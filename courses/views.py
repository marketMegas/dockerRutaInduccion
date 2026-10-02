import json
import os
import re
import secrets
from urllib.parse import urlencode
from django.http import FileResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import EmailMessage
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify
from usuarios.permisos import requiere_estudiante
from .models import UserProgress, Calificacion, Certificado, Course, Module, Lesson

CARPETA_CERTIFICADOS = 'Certificados_Emitidos'

# ── Catálogo de cursos (GET) ──────────────────────────────
# El frontend (React) no tiene hardcodeado el catálogo: lo pide a Django para
# que un curso creado desde /admin aparezca de inmediato en la app.
_YOUTUBE_ID_RE = re.compile(r'(?:v=|youtu\.be/|/embed/|/shorts/|live/)([A-Za-z0-9_-]{6,15})')


def _youtube_id(video_url):
    """Extrae el ID de YouTube de una URL o devuelve el valor tal cual.

    El frontend embebe videos como https://www.youtube.com/embed/<id>, asi que
    el admin puede pegar la URL completa de YouTube o directamente el ID.
    """
    if not video_url:
        return ''
    url = video_url.strip()
    if '://' not in url and 'www.' not in url:
        return url
    coincidencia = _YOUTUBE_ID_RE.search(url)
    return coincidencia.group(1) if coincidencia else url


def _serializar_curso(course):
    """Aplana Course › modules › lessons al contrato que espera el frontend.

    El frontend trabaja con una lista plana de lecciones (no con módulos),
    asi que el orden se calcula recorriendo los módulos ordenados y sus
    lecciones ordenadas, numerandolas de 1 en adelante.
    """
    lecciones = []
    for modulo in course.modules.all().order_by('order'):
        for leccion in modulo.lessons.all().order_by('order'):
            orden = len(lecciones) + 1
            lecciones.append({
                'id': orden,
                'title': leccion.title,
                'duration': leccion.duration or '—',
                'path': '' if orden == 1 else f'/leccion/{orden}',
                'videoId': _youtube_id(leccion.video_url),
            })

    total = len(lecciones)
    return {
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'imageUrl': course.cover_image or None,
        'color': course.accent_color,
        'iconType': course.icon_type,
        'badge': course.badge,
        'level': course.level,
        'duration': course.duration,
        'lessonsCount': total,
        'totalLessons': total,
        'progress': 0,
        'completedLessons': 0,
        'lessons': lecciones,
    }


@requiere_estudiante
@require_http_methods(["GET"])
def lista_cursos(request):
    cursos = Course.objects.prefetch_related('modules__lessons').order_by('id')
    return JsonResponse([_serializar_curso(c) for c in cursos], safe=False)


@requiere_estudiante
@require_http_methods(["GET"])
def detalle_curso(request, course_id):
    from django.shortcuts import get_object_or_404
    course = get_object_or_404(
        Course.objects.prefetch_related('modules__lessons'), pk=course_id
    )
    return JsonResponse(_serializar_curso(course))


def _enviar(asunto, cuerpo, adjunto=None, destinatario='', con_internos=True):
    """Manda un correo a los destinatarios internos y, si se le pasa uno, al
    destinatario.

    Unico camino de salida de correo del modulo, para que el aislamiento de
    errores sea el mismo en todos los avisos: devuelve (True, None) o
    (False, motivo) y NUNCA lanza excepcion.

    Que no lance es el punto. El correo es un aviso sobre algo que ya se
    guardo, asi que un SMTP caido no puede volver tirarla abajo: perder la
    calificacion o el certificado porque el servidor de correo estaba malo
    seria peor que no avisar. El error vuelve en la respuesta y queda
    registrado en la base, desde donde se puede reenviar a mano.

    `destinatario` es el correo del estudiante, opcional: sin el, el aviso va
    solo a los internos como antes. Cuando viene, el estudiante va en `to` y
    los internos en `bcc`, y no todos juntos en `to`: en `to` el estudiante
    veria las direcciones del equipo. Por eso esto usa EmailMessage y no
    send_mail, que no tiene bcc.

    `con_internos=False` deja el aviso solo para el destinatario, sin copia
    oculta. Se usa cuando el aviso interno va a salir aparte con su propio
    texto: en ese caso mandar la copia oculta tambien los haria recibir el
    certificado dos veces.

    adjunto es (nombre, contenido, tipo_mime) o None.
    """
    internos = [d for d in settings.NOTIF_DESTINATARIOS if d]
    destinatario = (destinatario or '').strip()

    if destinatario:
        bcc = [d for d in internos if d.lower() != destinatario.lower()] if con_internos else []
        para = [destinatario]
    else:
        bcc = []
        para = list(internos)

    if not para and not bcc:
        return False, (
            'No hay a quien avisar: NOTIF_DESTINATARIOS esta vacio y el '
            'usuario no informo correo.'
        )

    try:
        mensaje = EmailMessage(
            subject=asunto,
            body=cuerpo,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=para,
            bcc=bcc,
        )
        if adjunto is not None:
            nombre, contenido, tipo = adjunto
            mensaje.attach(nombre, contenido, tipo)
        mensaje.send(fail_silently=False)
    except Exception as e:
        return False, str(e)

    return True, None


def _notificar_aprobacion(request, calificacion):
    """Avisa a la gente interna que un usuario aprobo un curso.

    Solo se llama en la PRIMERA transicion de reprobar a aprobar, asi que
    repetir el quiz y aprobar de nuevo no multiplica correos.
    """
    nombre = calificacion.user_name or calificacion.user_id
    panel = request.build_absolute_uri(
        reverse('admin:courses_calificacion_changelist')
    )

    cuerpo = (
        f"{nombre} aprobo el curso '{calificacion.course_name}'.\n\n"
        f"Usuario:   {nombre}\n"
        f"Correo:    {calificacion.user_email or 'no informado'}\n"
        f"Puntaje:   {calificacion.score} de {calificacion.total_questions}\n"
        f"Resultado: {calificacion.percentage}%\n"
        f"Fecha:     {timezone.localtime(calificacion.fecha_creacion):%Y-%m-%d %H:%M}\n\n"
        f"Ver todas las calificaciones:\n{panel}"
    )

    return _enviar(f"[Aprobacion] {nombre} - {calificacion.course_name}", cuerpo)


def _cuerpo_certificado(request, certificado, motivo, para_estudiante=False):
    """Arma el cuerpo del aviso de certificado.

    El PDF va adjunto. Antes se mando solo un link al panel, y el link no le
    servia a nadie: /admin exige is_staff y los usuarios de NOTIF_DESTINATARIOS
    no lo son, asi que el correo llegaba sin nada que mirar. El link queda
    igual como dato extra, por si alguno tiene acceso.

    Son dos textos distintos porque son dos readerships: el link al panel y
    el detalle de la emisión no le sirven de nada al estudiante, y mandárselos
    igual lo confunde (parece que tiene que entrar a un panel que no puede
    ver). Los internos siguen recibiendo el cuerpo largo.
    """
    nombre = certificado.user_name or certificado.user_id

    if para_estudiante:
        return (
            f"Felicidades {nombre}.\n\n"
            f"Completaste satisfactoriamente el curso "
            f"'{certificado.course_name}' y tu certificado ya esta listo.\n\n"
            f"Curso:     {certificado.course_name}\n"
            f"Fecha:     "
            f"{timezone.localtime(certificado.fecha_emision):%Y-%m-%d %H:%M}\n"
            f"Motivo:    {motivo}\n\n"
            f"El certificado va adjunto en este correo. Guardalo y compartilo "
            f"con quien lo necesites."
        )

    # El detalle de un certificado ya no se abre desde /admin, asi que el aviso
    # interno apunta al listado filtrado por ese alumno: ahi se ven sus
    # certificados y cuantos son, que es lo que RH necesita, sin exponer el PDF.
    busqueda = certificado.user_email or certificado.user_name or certificado.user_id
    panel = request.build_absolute_uri(
        reverse('admin:courses_certificado_changelist')
        + '?' + urlencode({'q': busqueda})
    )

    return (
        f"{nombre} completo el curso '{certificado.course_name}' y ya tiene su "
        f"certificado generado.\n\n"
        f"Usuario:   {nombre}\n"
        f"Correo:    {certificado.user_email or 'no informado'}\n"
        f"Curso:     {certificado.course_name}\n"
        f"Fecha:     {timezone.localtime(certificado.fecha_emision):%Y-%m-%d %H:%M}\n"
        f"Motivo:    {motivo}\n\n"
        f"El certificado va adjunto en este correo.\n"
        f"Detalle de la emisión:\n{panel}"
    )


def _nombre_certificado(user_id, course_id):
    """Nombre determinista del PDF, derivado de la fila y no del cliente.

    Antes se usaba el nombre que mandaba el navegador
    ('Certificado_William Guerrero.pdf'), que ademas arrastra espacios y
    acentos del displayName. Con un nombre fijo, el archivo de una reemision
    es el mismo y se puede reemplazar en vez de acumular.
    """
    usuario = slugify(user_id)[:40] or 'usuario'
    curso = slugify(course_id)[:20] or 'curso'
    return f'{CARPETA_CERTIFICADOS}/Certificado_{usuario}_{curso}.pdf'


def _adjunto_certificado(certificado):
    """Arma el adjunto del aviso leyendo el PDF desde el almacenamiento.

    Se lee del archivo guardado y no del upload: asi el reenvio manual desde
    el panel puede adjuntar el mismo PDF sin volver a pedirlo al navegador.
    """
    with default_storage.open(certificado.archivo) as f:
        contenido = f.read()
    return os.path.basename(certificado.archivo), contenido, 'application/pdf'

@csrf_exempt
@require_http_methods(["POST"])
@requiere_estudiante
def guardar_progreso(request):
    """Guarda que leccion del curso ya vio el alumno.

    `user_id` sale del token verificado, no del cuerpo. Antes se tomaba de
    ahi, asi que un POST con el uid de otro le escribia el progreso a otro.
    El `user_id` que sigue llegando en el body se ignora a proposito: el
    frontend lo manda porque ya lo tenia, y las URLs viejas siguen igual.
    """
    try:
        data = json.loads(request.body)
        course_id = data.get('course_id')
        lesson_id = data.get('lesson_id')
        completado = data.get('completado', False)

        if not course_id or not lesson_id:
            return JsonResponse({'error': 'Faltan campos obligatorios: course_id, lesson_id'}, status=400)

        user_id = request.firebase_uid
        progress, created = UserProgress.objects.update_or_create(
            user_id=user_id,
            course_id=course_id,
            lesson_id=lesson_id,
            defaults={
                'completado': completado
            }
        )

        return JsonResponse({
            'status': 'success',
            'data': {
                'id': progress.id,
                'user_id': progress.user_id,
                'course_id': progress.course_id,
                'lesson_id': progress.lesson_id,
                'completado': progress.completado,
                'fecha_actualizacion': progress.fecha_actualizacion.isoformat()
            }
        }, status=200 if not created else 201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@requiere_estudiante
@require_http_methods(["GET"])
def obtener_progreso(request, user_id):
    """El progreso del alumno del token.

    El `user_id` de la URL ya no decide: el endpoint devuelve las filas de
    quien mando el token, se llame como se llame. La firma se conserva para no
    romper las URLs que ya tiene el frontend. Antes este era un IDOR abierto:
    GET /api/cursos/progreso/<uid de otro>/ devolvia el progreso de ese otro.
    """
    try:
        progress_records = UserProgress.objects.filter(user_id=request.firebase_uid)
        data = []
        for progress in progress_records:
            data.append({
                'id': progress.id,
                'user_id': progress.user_id,
                'course_id': progress.course_id,
                'lesson_id': progress.lesson_id,
                'completado': progress.completado,
                'fecha_actualizacion': progress.fecha_actualizacion.isoformat()
            })
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class _Error(Exception):
    """Falla con un mensaje y un status propio, en vez de un 500 generico."""

    def __init__(self, mensaje, status=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status = status


@csrf_exempt
@require_http_methods(["POST"])
@requiere_estudiante
def guardar_calificacion(request):
    """Guarda la nota de una evaluacion, por dos caminos distintos.

    - Con `respuestas` en el payload: el backend corrige contra la base y el
      score del cliente se ignora. Es el camino que usa la app.
    - Sin `respuestas` (cliente viejo, o un bundle viejo cacheado en el
      navegador): se guarda lo que vino, pero `passed` NO se toca.

    Lo segundo es un cierre, no una funcionalidad. Antes esta vista aceptaba
    `passed` tal cual, sin preguntas ni respuestas, asi que un POST a mano
    aprobaba el curso, disparaba el aviso a RH y liberaba el certificado sin
    haber abierto el quiz. Ahora `passed` solo cambia cuando hay respuestas que
    corregir, y ni ahi se le cree al cliente.

    Y en el camino viejo `passed` tampoco BAJA: un alumno que ya aprobo y
    tiene el bundle viejo cacheado repite la evaluacion, y perder el
    certificado por una request de un cliente obsoleto seria peor que la nota
    que se pretendia proteger.

    Quiien es el que califica ya no viene del cuerpo: entra `user_id` y el
    nombre por `request.firebase_uid` y `request.nombre_verificado`, que los
    fijo `@requiere_estudiante` desde el token verificado. Por eso aca ya no
    hace falta el `user_id` que mandaba el cliente, y mandarlo no cambia nada.
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    try:
        respuestas = data.get('respuestas')
        if isinstance(respuestas, dict) and respuestas:
            return _calificar_con_respuestas(request, data, respuestas)
        return _guardar_nota_del_cliente(request, data)
    except _Error as fallo:
        return JsonResponse({'error': fallo.mensaje}, status=fallo.status)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def _calificar_con_respuestas(request, data, respuestas):
    """Corrige las respuestas mandadas por el cliente y guarda la nota.

    Import perezoso a proposito: evaluaciones.views importa de arriba
    _notificar_aprobacion de este modulo, asi que importar evaluacion
    aca arriba cerraria el circulo en el arranque.
    """
    from evaluaciones.services import (
        banco_incompleto, curso_de, evaluacion_activa, registrar_calificacion,
    )

    curso = curso_de(data.get('course_id'))
    if curso is None:
        raise _Error(
            f"No se encontro el curso {data.get('course_id')!r}: con respuestas "
            'la nota se corrige contra un curso real.',
            404,
        )

    evaluacion = evaluacion_activa(curso.id)
    if evaluacion is None:
        raise _Error('Este curso no tiene una evaluación activa.', 404)
    if evaluacion.total_preguntas == 0:
        raise _Error('La evaluación no tiene preguntas cargadas.', 409)

    incompletas = banco_incompleto(evaluacion)
    if incompletas:
        raise _Error(
            f'La evaluación tiene {incompletas} pregunta(s) sin una única opción '
            'correcta marcada. Avisa a RH antes de reintentar.',
            409,
        )

    resultado = registrar_calificacion(
        curso=curso,
        evaluacion=evaluacion,
        respuestas=respuestas,
        user_id=request.firebase_uid,
        user_name=request.nombre_verificado,
        user_email=request.firebase_email,
    )

    notificado, error_notificacion = False, None
    if resultado['notificar']:
        notificado, error_notificacion = _notificar_aprobacion(
            request, resultado['calificacion']
        )

    calificacion = resultado['calificacion']
    return JsonResponse({
        'status': 'success',
        'data': _serializar_calificacion(calificacion, _certificado_de(calificacion)),
        'puntaje_aprobacion': resultado['puntaje_aprobacion'],
        'detalle': resultado['detalle'],
        'notificado': notificado,
        'notificacion_error': error_notificacion,
    }, status=201 if resultado['created'] else 200)


def _guardar_nota_del_cliente(request, data):
    """Camino viejo: guarda la nota tal cual, pero sin tocar `passed`."""
    course_id = str(data.get('course_id'))
    course_name = data.get('course_name', f'Curso {course_id}')

    if not course_id or course_id == 'None':
        raise _Error('Faltan campos obligatorios: course_id')

    defaults = {
        'course_name': course_name,
        'score': int(data.get('score', 0)),
        'total_questions': int(data.get('total_questions', 0)),
        'percentage': int(data.get('percentage', 0)),
        # La identidad sale del token y del alta de RH. Antes se tomaba de
        # `user_name` y `user_email` del cuerpo, o sea de lo que afirmaba el
        # navegador: por ahi se podia poner la nota y el nombre de otro.
        'user_name': request.nombre_verificado,
        'user_email': request.firebase_email,
    }

    # 'passed' ausente a proposito: se conserva el que hubiera. Ver el
    # docstring de guardar_calificacion.
    calificacion, created = Calificacion.objects.update_or_create(
        user_id=request.firebase_uid,
        course_id=course_id,
        defaults=defaults
    )

    # Sin respuestas no hay nada que notificar: por esta via no se puede
    # aprobar. La nota queda guardada igual, que es lo que importa.
    return JsonResponse({
        'status': 'success',
        'data': _serializar_calificacion(calificacion, _certificado_de(calificacion)),
        'notificado': False,
        'notificacion_error': None
    }, status=200 if not created else 201)


def _serializar_certificado(calificacion, certificado):
    """Lo que el frontend necesita para ofrecer la descarga.

    El token viaja en la respuesta a proposito: es el que abre la vista de
    descarga, y el frontend no lo puede adivinar ni se lo pide a otro
    servicio. Solo se expone para los certificados del propio usuario, que es
    como se consulta: `obtener_calificaciones` siempre pide las filas de un
    `user_id`.
    """
    if certificado is None:
        return {'emitido': False, 'token': None, 'url': None}

    return {
        'emitido': True,
        'certificado_id': certificado.id,
        'token': certificado.token,
        'course_name': certificado.course_name,
        'notificado': certificado.notificado,
        'url': reverse(
            'descargar_certificado',
            args=[calificacion.user_id, calificacion.course_id, certificado.token],
        ),
    }


def _serializar_calificacion(calificacion, certificado=None):
    """Contrato de una calificacion para el frontend.

    Una sola definicion: antes habia dos, la segunda pisa a la primera, y la
    primera tenia 23 lineas muertas despues del `return` que ademas
    referenciaban `user_name`, `defaults` y `calificacion`, variables que no
    existen en ese scope. Leyendolo de arriba abajo parecia que guardaba dos
    veces la calificacion.

    `course_id` sale como int cuando es numerico porque el frontend lo usa
    para comparar contra el id del curso que le llega del catalogo, y comparar
    '3' con 3 en JavaScript da false.
    """
    course_id = calificacion.course_id
    return {
        'id': calificacion.id,
        'user_id': calificacion.user_id,
        'user_name': calificacion.user_name,
        'user_email': calificacion.user_email,
        'course_id': int(course_id) if course_id.isdigit() else course_id,
        'course_name': calificacion.course_name,
        'score': calificacion.score,
        'total_questions': calificacion.total_questions,
        'percentage': calificacion.percentage,
        'passed': calificacion.passed,
        'fecha_creacion': calificacion.fecha_creacion.isoformat(),
        'certificado': _serializar_certificado(calificacion, certificado),
    }


def _certificado_de(calificacion):
    """El certificado de esa calificacion, o None si todavia no se emitio."""
    return Certificado.objects.filter(
        user_id=calificacion.user_id, course_id=calificacion.course_id
    ).first()


def _certificados_de(user_id, course_ids):
    """Certificados del usuario, indexados por course_id.

    Una sola consulta para toda la lista: pedir el certificado fila por fila
    es un query por calificacion, y esta vista se llama en cada carga de la
    pagina de notas.
    """
    if not course_ids:
        return {}
    return {
        certificado.course_id: certificado
        for certificado in Certificado.objects.filter(
            user_id=user_id, course_id__in=course_ids
        )
    }


@requiere_estudiante
@require_http_methods(["GET"])
def obtener_calificaciones(request, user_id):
    """Las notas del alumno del token, con su certificado si ya lo emitio.

    El `user_id` de la URL es decorativo: lo que decide es de quien es el
    token de la peticion. Antes esta vista era un IDOR abierto, porque el
    uid de la URL lo elegia quien llamara y GET
    /api/cursos/calificaciones/<uid de otro>/ devolvia las notas de ese otro
    (y el token de su certificado, que es lo que abre la descarga).
    """
    try:
        uid = request.firebase_uid
        records = list(Calificacion.objects.filter(user_id=uid))
        certificados = _certificados_de(uid, [c.course_id for c in records])
        data = [
            _serializar_calificacion(calif, certificados.get(calif.course_id))
            for calif in records
        ]
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@requiere_estudiante
def enviar_certificado(request):
    """Registra el certificado de un curso aprobado y lo manda por correo.

    Lo habilita `Calificacion.passed`, no el progreso de lecciones. Antes el
    certificado salia con `course.progress === 100`, que es un dato de
    Firebase que el backend no ve: approving la evaluacion no servia de nada
    y ademas el boton de la app estaba atado a un `course.id === 3`
    hardcodeado. Ahora la unica puerta es la nota, que es la fuente
    autoritativa y no se puede falsear desde el cliente.

    El certificado se guarda y se registra SIEMPRE, y el aviso va aparte: si el
    SMTP se cae, la respuesta es 200 con notificado=false y la fila queda con el
    error, en vez de un 500 que perdia el rastro de una emision que si ocurrio.
    El PDF ya esta en disco y el estudiante ya aprobo, asi que devolver un
    error de 500 no evitaba nada.

    Del POST solo se leen el PDF, el `curso` (que es texto libre, asi que solo
    se usa de nombre de archivo) y el `courseId`. El nombre, el correo y el
    `userId` que mandaba el navegador ya no se miran: salen del token
    verificado y de la Calificacion.
    """
    try:
        certificado_file = request.FILES.get('certificado')
        curso = request.POST.get('curso', '').strip() or 'Curso'

        if not certificado_file:
            return JsonResponse({'error': 'No se proporcionó el certificado'}, status=400)

        # De quien es el certificado sale del token, no del `userId` del POST.
        # Antes ese campo venia del cliente y caia a 'desconocido' cuando no
        # venia, asi que dos alumnos distintos compartian una misma fila y
        # cualquiera que mandara un userId ajeno se llevaba su certificado.
        user_id = request.firebase_uid
        # courseId si se sigue leyendo del POST: es el dato que se cruza con la
        # Calificacion, y de todos modos la nota de abajo tiene que existir y
        # estar aprobada.
        course_id = request.POST.get('courseId', '').strip() or slugify(curso)[:50] or 'curso'

        # La nota manda. Sin esto cualquiera podria pedir el certificado de un
        # curso que no rindio. Y ahora que `user_id` sale del token verificado,
        # la nota que se busca es la de esa persona y no la de otra.
        calificacion = Calificacion.objects.filter(
            user_id=user_id, course_id=course_id
        ).first()
        if calificacion is None or not calificacion.passed:
            return JsonResponse({
                'error': 'Todavia no hay una calificacion aprobada para este '
                         'curso. Rinde la evaluacion y aprobala para poder '
                         'descargar el certificado.'
            }, status=400)

        previo = Certificado.objects.filter(
            user_id=user_id, course_id=course_id
        ).first()

        # Se borra el PDF anterior antes de guardar el nuevo. default_storage
        # no sobreescribe: le agrega un sufijo aleatorio al nombre, asi que sin
        # esto cada reemision dejaba un archivo huerfano mas en la carpeta. El
        # nombre es determinista, asi que borrando antes alcanza.
        if previo and previo.archivo:
            try:
                default_storage.delete(previo.archivo)
            except Exception:
                # El archivo en disco y la fila pueden desincronizarse; no es
                # motivo para frenar una emision nueva.
                pass

        archivo = _nombre_certificado(user_id, course_id)
        saved_path = default_storage.save(
            archivo, ContentFile(certificado_file.read())
        )

        # El nombre y el correo los pone la Calificacion, que ya los guardo
        # desde el alta de RH. Los `nombreUsuario`/`emailUsuario` del POST se
        # ignoran: texto libre del navegador que ademas va impreso en el PDF.
        certificado, created = Certificado.objects.update_or_create(
            user_id=user_id,
            course_id=course_id,
            defaults={
                'user_name': calificacion.user_name or request.nombre_verificado,
                'user_email': calificacion.user_email or request.firebase_email,
                'course_name': calificacion.course_name,
                'archivo': saved_path,
            },
        )
        certificado.intentos += 1

        # A diferencia de la aprobacion, aca avisamos SIEMPRE. Descargar el
        # certificado es una accion explicita del usuario, no un evento
        # automatico que se pueda disparar dos veces sin querer, y el
        # certificado lo que RH necesita ver es cada vez que alguien termina.
        motivo = 'emisión del certificado' if created else 'reemisión del certificado'
        adjunto = _adjunto_certificado(certificado)

        # Dos avisos y no uno: el del estudiante no lleva el link al panel
        # (no puede verlo, /admin exige is_staff) y el de los internos tampoco
        # se le manda a el. `notificado` sigue siendo el estado del aviso
        # interno, que es lo que mira el admin y la accion de reenvio.
        ok_estudiante, error_estudiante = True, None
        if certificado.user_email:
            # con_internos=False: el aviso interno sale ahora abajo con su
            # propio texto. Sin esto los internos recibirian el certificado dos
            # veces, una como copia oculta de este y otra del aviso de RH.
            ok_estudiante, error_estudiante = _enviar(
                f"Tu certificado de {certificado.course_name}",
                _cuerpo_certificado(
                    request, certificado, motivo, para_estudiante=True,
                ),
                adjunto,
                destinatario=certificado.user_email,
                con_internos=False,
            )

        notificado_internos, error_internos = _enviar(
            f"[Certificación completada] {certificado.user_name or user_id}",
            _cuerpo_certificado(request, certificado, motivo),
            adjunto,
        )

        certificado.notificado = notificado_internos
        # Se guardan los dos errores: si fallo el del estudiante, el reenvio
        # manual desde el panel tiene que poder ver que no le llego.
        certificado.notificacion_error = error_internos or error_estudiante or ''
        certificado.save()

        return JsonResponse({
            'status': 'success',
            'certificado_id': certificado.id,
            'token': certificado.token,
            'saved_path': saved_path,
            'notificado': certificado.notificado,
            'notificacion_error': certificado.notificacion_error,
            # Distinto de `notificado`: el interno puede haber salido y el del
            # estudiante no, y al usuario hay que decirle cual de los dos fue.
            'correo_estudiante': bool(certificado.user_email) and ok_estudiante,
            'sin_correo': not certificado.user_email,
            'primera_emision': created,
        }, status=201 if created else 200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def descargar_certificado(request, user_id, course_id, token):
    """Sirve el PDF guardado del certificado.

    Esta es la UNICA vista de datos de alumno que no lleva
    `@requiere_estudiante`, y no es un agujero: el token va en la URL y es lo
    unico que abre este endpoint. Se puso a proposito, porque el PDF se manda
    por correo y su enlace tiene que funcionar sin sesion: quien lo recibe no
    esta en el navegador de la app.

    Ese token se genero cuando se creo el certificado (`secrets.token_urlsafe`),
    de ahi que sin el enlace no se puede adivinar, y se compara con
    `secrets.compare_digest` y no con `==`: la comparacion de cadenas normal
    sale en el primer caracter que difiere y filtra informacion del token byte
    a byte.

    Ojo con lo que se cerrro despues: cuando el API entero valido sesion, este
    endpoint NO sepaso a sesion porque habria roto los correos. `user_id` sigue
    SALIENDO de la URL en esta vista, a proposito, y por eso el token es lo unico
    que protege el archivo.
    """
    certificado = Certificado.objects.filter(
        user_id=user_id, course_id=course_id
    ).first()

    if (
        certificado is None
        or not certificado.token
        or not secrets.compare_digest(certificado.token, token or '')
    ):
        return JsonResponse({'error': 'Certificado no encontrado.'}, status=404)

    if not certificado.archivo or not default_storage.exists(certificado.archivo):
        # El archivo se puede haber borrado del disco a mano. Es el mismo caso
        # que el action reenviar_aviso del admin distingue: mejor un 404 con
        # motivo que un 500 de almacenamiento.
        return JsonResponse({
            'error': 'El archivo del certificado ya no esta en el servidor. '
                     'Pedilo de nuevo para que se regenere.'
        }, status=404)

    return FileResponse(
        default_storage.open(certificado.archivo, 'rb'),
        content_type='application/pdf',
        as_attachment=True,
        filename=os.path.basename(certificado.archivo),
    )


import json
import os
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail, EmailMessage
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify
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


@require_http_methods(["GET"])
def lista_cursos(request):
    cursos = Course.objects.prefetch_related('modules__lessons').order_by('id')
    return JsonResponse([_serializar_curso(c) for c in cursos], safe=False)


@require_http_methods(["GET"])
def detalle_curso(request, course_id):
    from django.shortcuts import get_object_or_404
    course = get_object_or_404(
        Course.objects.prefetch_related('modules__lessons'), pk=course_id
    )
    return JsonResponse(_serializar_curso(course))


def _enviar(asunto, cuerpo, adjunto=None):
    """Manda un correo a los destinatarios internos.

    Unico camino de salida de correo del modulo, para que el aislamiento de
    errores sea el mismo en todos los avisos: devuelve (True, None) o
    (False, motivo) y NUNCA lanza excepcion.

    Que no lance es el punto. El correo es un aviso sobre algo que ya se
    guardo, asi que un SMTP caido no puede volver tirarla abajo: perder la
    calificacion o el certificado porque el servidor de correo estaba malo
    seria peor que no avisar. El error vuelve en la respuesta y queda
    registrado en la base, desde donde se puede reenviar a mano.

    adjunto es (nombre, contenido, tipo_mime) o None.
    """
    destinatarios = settings.NOTIF_DESTINATARIOS
    if not destinatarios:
        return False, 'NOTIF_DESTINATARIOS esta vacio: no hay a quien avisar.'

    try:
        if adjunto is None:
            send_mail(
                subject=asunto,
                message=cuerpo,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=destinatarios,
                fail_silently=False,
            )
        else:
            mensaje = EmailMessage(
                subject=asunto,
                body=cuerpo,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=destinatarios,
            )
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


def _cuerpo_certificado(request, certificado, motivo):
    """Arma el cuerpo del aviso de certificado.

    El PDF va adjunto. Antes se mando solo un link al panel, y el link no le
    servia a nadie: /admin exige is_staff y los usuarios de NOTIF_DESTINATARIOS
    no lo son, asi que el correo llegaba sin nada que mirar. El link queda
    igual como dato extra, por si alguno tiene acceso.
    """
    panel = request.build_absolute_uri(
        reverse('admin:courses_certificado_change', args=[certificado.id])
    )
    nombre = certificado.user_name or certificado.user_id

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
def guardar_progreso(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        course_id = data.get('course_id')
        lesson_id = data.get('lesson_id')
        completado = data.get('completado', False)

        if not user_id or not course_id or not lesson_id:
            return JsonResponse({'error': 'Faltan campos obligatorios: user_id, course_id, lesson_id'}, status=400)

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

@require_http_methods(["GET"])
def obtener_progreso(request, user_id):
    try:
        progress_records = UserProgress.objects.filter(user_id=user_id)
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

    user_id = str(data.get('user_id') or '').strip()
    if not user_id:
        raise _Error('Faltan campos obligatorios: user_id')

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
        user_id=user_id,
        user_name=str(data.get('user_name') or '').strip(),
        user_email=str(data.get('user_email') or '').strip(),
    )

    notificado, error_notificacion = False, None
    if resultado['notificar']:
        notificado, error_notificacion = _notificar_aprobacion(
            request, resultado['calificacion']
        )

    calificacion = resultado['calificacion']
    return JsonResponse({
        'status': 'success',
        'data': _serializar_calificacion(calificacion),
        'puntaje_aprobacion': resultado['puntaje_aprobacion'],
        'detalle': resultado['detalle'],
        'notificado': notificado,
        'notificacion_error': error_notificacion,
    }, status=201 if resultado['created'] else 200)


def _guardar_nota_del_cliente(request, data):
    """Camino viejo: guarda la nota tal cual, pero sin tocar `passed`."""
    user_id = data.get('user_id')
    course_id = str(data.get('course_id'))
    course_name = data.get('course_name', f'Curso {course_id}')
    user_name = data.get('user_name', '').strip()
    user_email = data.get('user_email', '').strip()

    if not user_id or not course_id:
        raise _Error('Faltan campos obligatorios: user_id, course_id')

    defaults = {
        'course_name': course_name,
        'score': int(data.get('score', 0)),
        'total_questions': int(data.get('total_questions', 0)),
        'percentage': int(data.get('percentage', 0)),
    }
    # Solo se pisan si vienen informadas: un cliente viejo que no las
    # mande no debe borrar la identidad que ya estaba guardada.
    if user_name:
        defaults['user_name'] = user_name
    if user_email:
        defaults['user_email'] = user_email

    # 'passed' ausente a proposito: se conserva el que hubiera. Ver el
    # docstring de guardar_calificacion.
    calificacion, created = Calificacion.objects.update_or_create(
        user_id=user_id,
        course_id=course_id,
        defaults=defaults
    )

    # Sin respuestas no hay nada que notificar: por esta via no se puede
    # aprobar. La nota queda guardada igual, que es lo que importa.
    return JsonResponse({
        'status': 'success',
        'data': _serializar_calificacion(calificacion),
        'notificado': False,
        'notificacion_error': None
    }, status=200 if not created else 201)


def _serializar_calificacion(calificacion):
    return {
        'id': calificacion.id,
        'user_id': calificacion.user_id,
        'user_name': calificacion.user_name,
        'user_email': calificacion.user_email,
        'course_id': calificacion.course_id,
        'course_name': calificacion.course_name,
        'score': calificacion.score,
        'total_questions': calificacion.total_questions,
        'percentage': calificacion.percentage,
        'passed': calificacion.passed,
        'fecha_creacion': calificacion.fecha_creacion.isoformat()
    }
    # Solo se pisan si vienen informadas: un cliente viejo que no las
    # mande no debe borrar la identidad que ya estaba guardada.
    if user_name:
        defaults['user_name'] = user_name
    if user_email:
        defaults['user_email'] = user_email

    # 'passed' ausente a proposito: se conserva el que hubiera. Ver el
    # docstring de guardar_calificacion.
    calificacion, created = Calificacion.objects.update_or_create(
        user_id=user_id,
        course_id=course_id,
        defaults=defaults
    )

    # Sin respuestas no hay nada que notificar: no se puede aprobar por esta
    # via. La nota queda guardada igual, que es lo que importa.
    return JsonResponse({
        'status': 'success',
        'data': _serializar_calificacion(calificacion),
        'notificado': False,
        'notificacion_error': None
    }, status=200 if not created else 201)


def _serializar_calificacion(calificacion):
    return {
        'id': calificacion.id,
        'user_id': calificacion.user_id,
        'user_name': calificacion.user_name,
        'user_email': calificacion.user_email,
        'course_id': calificacion.course_id,
        'course_name': calificacion.course_name,
        'score': calificacion.score,
        'total_questions': calificacion.total_questions,
        'percentage': calificacion.percentage,
        'passed': calificacion.passed,
        'fecha_creacion': calificacion.fecha_creacion.isoformat()
    }

@require_http_methods(["GET"])
def obtener_calificaciones(request, user_id):
    try:
        records = Calificacion.objects.filter(user_id=user_id)
        data = []
        for calif in records:
            data.append({
                'id': calif.id,
                'user_id': calif.user_id,
                'user_name': calif.user_name,
                'user_email': calif.user_email,
                'course_id': int(calif.course_id) if calif.course_id.isdigit() else calif.course_id,
                'course_name': calif.course_name,
                'score': calif.score,
                'total_questions': calif.total_questions,
                'percentage': calif.percentage,
                'passed': calif.passed,
                'fecha_creacion': calif.fecha_creacion.isoformat()
            })
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def enviar_certificado(request):
    """Registra un certificado emitido y avisa a los internos.

    El certificado se guarda y se registra SIEMPRE, y el aviso va aparte: si el
    SMTP se cae, la respuesta es 200 con notificado=false y la fila queda con el
    error, en vez de un 500 que perdia el rastro de una emision que si ocurrio.
    El PDF ya esta en disco y el curso ya quedo en 100% para cuando lo baje el
    usuario, asi que devolver un error de 500 no evitaba nada.
    """
    try:
        certificado_file = request.FILES.get('certificado')
        nombre_usuario = request.POST.get('nombreUsuario', '').strip()
        email_usuario = request.POST.get('emailUsuario', '').strip()
        curso = request.POST.get('curso', '').strip() or 'Curso'

        if not certificado_file:
            return JsonResponse({'error': 'No se proporcionó el certificado'}, status=400)

        # userId y courseId son campos nuevos. Un cliente viejo que no los mande
        # cae a algo estable, porque (user_id, course_id) es la clave unica de
        # la fila y si se quedara vacio todas las emisiones colapsarian en una.
        user_id = request.POST.get('userId', '').strip() or email_usuario or 'desconocido'
        course_id = request.POST.get('courseId', '').strip() or slugify(curso)[:50] or 'curso'

        previo = Certificado.objects.filter(
            user_id=user_id, course_id=course_id
        ).first()

        # Se borra el PDF anterior antes de guardar el nuevo. default_storage
        # no sobreescribe: le agrega un sufijo aleatorio al nombre, asi que sin
        # esto cada "Finalizar Curso" dejaba un archivo huerfano mas en la
        # carpeta. El nombre es determinista, asi que borrando antes alcanza.
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

        certificado, created = Certificado.objects.update_or_create(
            user_id=user_id,
            course_id=course_id,
            defaults={
                'user_name': nombre_usuario,
                'user_email': email_usuario,
                'course_name': curso,
                'archivo': saved_path,
            },
        )
        certificado.intentos += 1

        # A diferencia de la aprobacion, aca avisamos SIEMPRE. "Finalizar
        # Curso" es una accion explicita del usuario, no un evento automatico
        # que se pueda disparar dos veces sin querer, y el certificado lo que
        # RH necesita ver es cada vez que alguien termina. Silenciar la
        # reemision dejaba al usuario sin ningun aviso en la bandeja.
        motivo = 'emisión del certificado' if created else 'reemisión del certificado'
        notificado, error_notificacion = _enviar(
            f"[Certificación completada] {certificado.user_name or user_id}",
            _cuerpo_certificado(request, certificado, motivo),
            _adjunto_certificado(certificado),
        )

        certificado.notificado = notificado
        certificado.notificacion_error = error_notificacion or ''
        certificado.save()

        return JsonResponse({
            'status': 'success',
            'certificado_id': certificado.id,
            'saved_path': saved_path,
            'notificado': notificado,
            'notificacion_error': error_notificacion,
            'primera_emision': created,
        }, status=201 if created else 200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


"""API de gestion de evaluaciones para la pantalla del sidebar (solo staff).

La app del estudiante solo tiene dos rutas de evaluaciones: ver el banco SIN
las correctas y entregar respuestas. Esta pantalla es el otro lado: ver el
banco CON las correctas y editarlo. Por eso cada vista va con
`@requiere_staff` y no con `@requiere_estudiante`: un alumno dado de alta no
tiene por que poder tocar el examen ni ver que respuesta es la buena.

Las invariantes del modelo se mantienen igual que en /admin de Django:

- Una sola opcion correcta por pregunta. Marcar `es_correcta` en una opcion
  desmarca las demas de esa pregunta, en transaccion, para que no quede un
  instante con dos correctas.
- No se puede activar (ni agregar preguntas) con el banco incompleto: una
  pregunta sin correcta es un quiz que nadie puede aprobar, y el estudiante
  se encontraria un 409 sin poder hacer nada.
- Una evaluacion activa no pierde su ultima correcta: borrar o desmarcar la
  unica correcta de una pregunta de una evaluacion activa se rechaza, igual
  que lo hace el formset del admin.

`banco_incompleto` y `total_correctas` se reusan de los modulos que ya
existen para el quiz y para el admin: son la misma regla en los tres lugares.
"""

import json

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from usuarios.permisos import requiere_staff

from .models import Evaluacion, Opcion, Pregunta
from .serializers import (
    serializar_admin_evaluacion, serializar_lista_admin,
)
from .services import banco_incompleto, error


def _json_o_none(request):
    """El body parseado, o None si no es JSON valido (ya se responde 400)."""
    try:
        return json.loads(request.body or b'{}')
    except json.JSONDecodeError:
        return None


def _entero(valor, campo):
    """int(valor) o (None, mensaje de error) si no lo es."""
    try:
        return int(valor), None
    except (TypeError, ValueError):
        return None, f'El campo {campo} debe ser un numero entero.'


def _siguiente_orden(queryset):
    """El proximo orden libre para un hijo recien creado (max + 1)."""
    ultimo = queryset.order_by('-orden').values_list('orden', flat=True).first()
    return (ultimo or 0) + 1


def _evaluacion_con_banco(pk):
    return get_object_or_404(
        Evaluacion.objects.select_related('course').prefetch_related(
            'preguntas__opciones'
        ),
        pk=pk,
    )


# ── Evaluaciones ─────────────────────────────────────────────────────────


@requiere_staff
@require_http_methods(["GET"])
def listar_evaluaciones(request):
    """GET /api/admin/evaluaciones/  ->  el listado con su curso y conteos."""
    evaluaciones = (
        Evaluacion.objects
        .select_related('course')
        .prefetch_related('preguntas')
        .order_by('orden', 'id')
    )
    return JsonResponse({'evaluaciones': serializar_lista_admin(evaluaciones)})


@csrf_exempt
@require_http_methods(["GET", "PUT"])
@requiere_staff
def evaluacion_detallada(request, evaluacion_id):
    """GET  ->  el banco completo con las correctas marcadas.
    PUT  ->  edita titulo/puntaje/activa/orden del formulario de la pantalla.
    """
    if request.method == 'GET':
        return JsonResponse(
            serializar_admin_evaluacion(_evaluacion_con_banco(evaluacion_id))
        )

    data = _json_o_none(request)
    if data is None:
        return error('JSON invalido', 400)

    # Se busca SIN prefetch: la respuesta se re-lee al final con el banco
    # fresco, y aca solo se escriben campos de la propia evaluacion.
    evaluacion = get_object_or_404(Evaluacion, pk=evaluacion_id)

    if 'titulo' in data:
        titulo = str(data['titulo'] or '').strip()
        if not titulo:
            return error('El titulo no puede quedar vacio.', 400)
        evaluacion.titulo = titulo

    if 'puntaje_aprobacion' in data:
        puntaje, problema = _entero(data['puntaje_aprobacion'], 'puntaje_aprobacion')
        if problema:
            return error(problema, 400)
        if not 0 <= puntaje <= 100:
            return error('El puntaje de aprobacion va de 0 a 100.', 400)
        evaluacion.puntaje_aprobacion = puntaje

    if 'orden' in data:
        orden, problema = _entero(data['orden'], 'orden')
        if problema:
            return error(problema, 400)
        evaluacion.orden = orden

    if 'activa' in data:
        activa = bool(data['activa'])
        if activa:
            if evaluacion.total_preguntas == 0:
                return error(
                    'No se puede activar una evaluacion sin preguntas.', 400
                )
            incompletas = banco_incompleto(evaluacion)
            if incompletas:
                return error(
                    f'No se puede activar: {incompletas} de las '
                    f'{evaluacion.total_preguntas} preguntas no tienen '
                    'exactamente una opcion correcta marcada.',
                    400,
                )
        evaluacion.activa = activa

    evaluacion.save()
    return JsonResponse(serializar_admin_evaluacion(_evaluacion_con_banco(evaluacion.pk)))


# ── Preguntas ────────────────────────────────────────────────────────────


@csrf_exempt
@require_http_methods(["POST"])
@requiere_staff
def crear_pregunta(request, evaluacion_id):
    """POST /api/admin/evaluaciones/<id>/preguntas/  ->  agrega una pregunta.

    En una evaluacion ACTIVA se rechaza: agregar una pregunta sin opciones
    dejaria el banco incompleto y los estudiantes se encontrarian un 409.
    En /admin de Django pasa lo mismo, por el save_related de la evaluacion.
    """
    evaluacion = get_object_or_404(Evaluacion, pk=evaluacion_id)
    if evaluacion.activa:
        return error(
            'Desactiva la evaluacion antes de agregar preguntas: una '
            'evaluacion activa no puede quedar con preguntas sin opciones.',
            400,
        )

    data = _json_o_none(request)
    if data is None:
        return error('JSON invalido', 400)

    texto = str(data.get('texto') or '').strip()
    if not texto:
        return error('La pregunta no puede quedar vacia.', 400)

    if 'orden' in data and data['orden'] not in (None, ''):
        orden, problema = _entero(data['orden'], 'orden')
        if problema:
            return error(problema, 400)
    else:
        orden = _siguiente_orden(evaluacion.preguntas.all())

    pregunta = Pregunta.objects.create(
        evaluacion=evaluacion,
        texto=texto,
        contexto=str(data.get('contexto') or ''),
        es_larga=bool(data.get('es_larga')),
        orden=orden,
    )
    return JsonResponse(
        serializar_admin_evaluacion(_evaluacion_con_banco(evaluacion.pk)),
        status=201,
    )


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
@requiere_staff
def pregunta_detallada(request, pregunta_id):
    """PUT  ->  edita la pregunta. DELETE  ->  la borra con sus opciones."""
    pregunta = get_object_or_404(
        Pregunta.objects.select_related('evaluacion'), pk=pregunta_id
    )

    if request.method == 'DELETE':
        # Borrar una pregunta de una evaluacion activa deja el banco que los
        # estudiantes ven a medio hacer, igual que al agregar.
        if pregunta.evaluacion.activa:
            return error(
                'Desactiva la evaluacion antes de borrar preguntas.', 400
            )
        evaluacion_id = pregunta.evaluacion_id
        pregunta.delete()
        return JsonResponse({
            'ok': True,
            'evaluacion': serializar_admin_evaluacion(
                _evaluacion_con_banco(evaluacion_id)
            ),
        })

    data = _json_o_none(request)
    if data is None:
        return error('JSON invalido', 400)

    if 'texto' in data:
        texto = str(data['texto'] or '').strip()
        if not texto:
            return error('La pregunta no puede quedar vacia.', 400)
        pregunta.texto = texto

    if 'contexto' in data:
        pregunta.contexto = str(data['contexto'] or '')

    if 'es_larga' in data:
        pregunta.es_larga = bool(data['es_larga'])

    if 'orden' in data and data['orden'] not in (None, ''):
        orden, problema = _entero(data['orden'], 'orden')
        if problema:
            return error(problema, 400)
        pregunta.orden = orden

    pregunta.save()
    return JsonResponse(
        serializar_admin_evaluacion(_evaluacion_con_banco(pregunta.evaluacion_id))
    )


# ── Opciones ─────────────────────────────────────────────────────────────


def _desmarcar_correctas_de(pregunta):
    """Desmarca toda opcion de la pregunta; quien quede marcada se hace
    despues con el save() de la opcion elegida (ver opcion_detallada)."""
    pregunta.opciones.update(es_correcta=False)


def _perderia_su_correcta(pregunta, opcion):
    """Si desmarcar/borrar `opcion` dejaria la pregunta sin ninguna correcta."""
    if not opcion.es_correcta:
        return False
    return not pregunta.opciones.exclude(pk=opcion.pk).filter(es_correcta=True).exists()


@csrf_exempt
@require_http_methods(["POST"])
@requiere_staff
def crear_opcion(request, pregunta_id):
    """POST /api/admin/preguntas/<id>/opciones/  ->  agrega una opcion.

    Si viene `es_correcta: true`, las demas opciones de la pregunta quedan
    desmarcadas en la misma transaccion: una sola correcta es la regla del
    modelo y aqui no hay formset que la valide despues.
    """
    pregunta = get_object_or_404(
        Pregunta.objects.select_related('evaluacion'), pk=pregunta_id
    )

    data = _json_o_none(request)
    if data is None:
        return error('JSON invalido', 400)

    texto = str(data.get('texto') or '').strip()
    if not texto:
        return error('La opcion no puede quedar vacia.', 400)

    if 'orden' in data and data['orden'] not in (None, ''):
        orden, problema = _entero(data['orden'], 'orden')
        if problema:
            return error(problema, 400)
    else:
        orden = _siguiente_orden(pregunta.opciones.all())

    es_correcta = bool(data.get('es_correcta'))
    with transaction.atomic():
        if es_correcta:
            _desmarcar_correctas_de(pregunta)
        Opcion.objects.create(
            pregunta=pregunta,
            texto=texto,
            es_correcta=es_correcta,
            orden=orden,
        )

    return JsonResponse(
        serializar_admin_evaluacion(
            _evaluacion_con_banco(pregunta.evaluacion_id)
        ),
        status=201,
    )


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
@requiere_staff
def opcion_detallada(request, opcion_id):
    """PUT  ->  edita texto/orden y (des)marca la correcta. DELETE  ->  borra."""
    opcion = get_object_or_404(
        Opcion.objects.select_related('pregunta__evaluacion'),
        pk=opcion_id,
    )
    pregunta = opcion.pregunta

    if request.method == 'DELETE':
        # Borrar la unica correcta de una pregunta de una evaluacion activa
        # dejaria el quiz sin respuesta posible: en /admin el formset lo
        # rechaza y aca tambien.
        if _perderia_su_correcta(pregunta, opcion) and pregunta.evaluacion.activa:
            return error(
                'Esta es la unica opcion correcta de una pregunta de una '
                'evaluacion activa. Desactiva la evaluacion o marca otra '
                'respuesta correcta antes de borrarla.',
                400,
            )
        opcion.delete()
        return JsonResponse({
            'ok': True,
            'evaluacion': serializar_admin_evaluacion(
                _evaluacion_con_banco(pregunta.evaluacion_id)
            ),
        })

    data = _json_o_none(request)
    if data is None:
        return error('JSON invalido', 400)

    if 'texto' in data:
        texto = str(data['texto'] or '').strip()
        if not texto:
            return error('La opcion no puede quedar vacia.', 400)
        opcion.texto = texto

    if 'orden' in data and data['orden'] not in (None, ''):
        orden, problema = _entero(data['orden'], 'orden')
        if problema:
            return error(problema, 400)
        opcion.orden = orden

    if 'es_correcta' in data:
        es_correcta = bool(data['es_correcta'])
        if (
            not es_correcta
            and _perderia_su_correcta(pregunta, opcion)
            and pregunta.evaluacion.activa
        ):
            return error(
                'Esta es la unica opcion correcta de una pregunta de una '
                'evaluacion activa. Desactiva la evaluacion o marca otra '
                'respuesta correcta antes de desmarcarla.',
                400,
            )
        if es_correcta:
            with transaction.atomic():
                _desmarcar_correctas_de(pregunta)
            # Se pone en memoria y no con update(): si no, el save() del
            # final escribiria encima con el False viejo de esta instancia,
            # como si nunca se hubiera marcado.
            opcion.es_correcta = True
        else:
            opcion.es_correcta = False

    opcion.save()
    return JsonResponse(
        serializar_admin_evaluacion(
            _evaluacion_con_banco(pregunta.evaluacion_id)
        )
    )

"""API de evaluaciones: sirve el quiz y lo corrige.

El cambio de fondo es que la correccion ocurre aca. Antes el frontend mandaba
score, percentage y passed ya calculados y nunca mandaba las respuestas, asi
que cualquiera con curl o devtools podia declararse aprobado sin abrir el quiz
y disparar el correo de aprobacion y el certificado. Ahora el navegador solo
dice que opcion eligio en cada pregunta, y el veredicto sale de comparar
contra la base (ver services.py).
"""

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404

from courses.models import Course
from courses.views import _notificar_aprobacion

from .serializers import serializar_evaluacion
from .services import banco_incompleto, error, evaluacion_activa, registrar_calificacion


def _texto(valor):
    """Lo que llega del JSON como texto, sin reventar si vino otra cosa."""
    return str(valor).strip() if isinstance(valor, str) else ''


@require_http_methods(["GET"])
def obtener_evaluacion(request, course_id):
    """El quiz del curso, sin las respuestas correctas.

    Un 404 aqui no es un error del frontend: es el caso de un curso creado en
    /admin que todavia no tiene preguntas. El componente lo muestra como "este
    curso aun no tiene evaluacion".
    """
    curso = get_object_or_404(Course, pk=course_id)
    evaluacion = evaluacion_activa(curso.id)

    if evaluacion is None:
        return error('Este curso aun no tiene una evaluación activa.', 404)

    incompletas = banco_incompleto(evaluacion)
    if incompletas:
        # Se devuelve 409 y no el quiz a medio hacer: si faltan las correctas,
        # ninguna nota va a ser la que el admin espera.
        return error(
            f'La evaluación tiene {incompletas} pregunta(s) sin una única '
            'opción correcta marcada. Avisa a RH antes de reintentar.',
            409,
        )

    return JsonResponse(serializar_evaluacion(evaluacion))


@csrf_exempt
@require_http_methods(["POST"])
def entregar_evaluacion(request, course_id):
    """Corrige las respuestas y guarda la calificacion."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return error('JSON inválido', 400)

    user_id = _texto(data.get('user_id'))
    if not user_id:
        return error('Falta user_id: no se sabe de quien es la nota.', 400)

    respuestas = data.get('respuestas')
    if not isinstance(respuestas, dict) or not respuestas:
        return error('Faltan las respuestas para corregir la evaluación.', 400)

    curso = get_object_or_404(Course, pk=course_id)
    evaluacion = evaluacion_activa(curso.id)
    if evaluacion is None:
        return error('Este curso no tiene una evaluación activa.', 404)

    if evaluacion.total_preguntas == 0:
        return error('La evaluación no tiene preguntas cargadas.', 409)

    incompletas = banco_incompleto(evaluacion)
    if incompletas:
        return error(
            f'La evaluación tiene {incompletas} pregunta(s) sin una única '
            'opción correcta marcada. Avisa a RH antes de reintentar.',
            409,
        )

    resultado = registrar_calificacion(
        curso=curso,
        evaluacion=evaluacion,
        respuestas=respuestas,
        user_id=user_id,
        user_name=_texto(data.get('user_name')),
        user_email=_texto(data.get('user_email')),
    )

    notificado, error_notificacion = False, None
    if resultado['notificar']:
        notificado, error_notificacion = _notificar_aprobacion(
            request, resultado['calificacion']
        )

    calificacion = resultado['calificacion']
    return JsonResponse({
        'status': 'success',
        'data': {
            'id': calificacion.id,
            'evaluacion_id': evaluacion.id,
            'course_id': str(curso.id),
            'course_name': calificacion.course_name,
            'score': resultado['score'],
            'total_questions': resultado['total'],
            'percentage': resultado['percentage'],
            'passed': resultado['passed'],
            'puntaje_aprobacion': resultado['puntaje_aprobacion'],
            'fecha_creacion': calificacion.fecha_creacion.isoformat(),
        },
        'detalle': resultado['detalle'],
        'notificado': notificado,
        'notificacion_error': error_notificacion,
    }, status=201 if resultado['created'] else 200)

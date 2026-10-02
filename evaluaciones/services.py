"""Correccion y registro de una nota.

Vive aca, y no en las vistas, porque hay dos caminos que necesitan exactamente
la misma logica:

- POST /api/cursos/evaluaciones/<id>/entregar/  (lo que usa la app)
- POST /api/cursos/calificaciones/  con `respuestas`  (clientes viejos)

Con la correccion en dos lugares, uno de los dos se queda viejo y el
endurecimiento de `guardar_calificacion` deja de servir para nada.
"""

from django.http import JsonResponse

from courses.models import Calificacion, Course

from .models import Evaluacion
from .serializers import corrector, total_correctas


def evaluacion_activa(course_id):
    """La evaluacion que se sirve de un curso, o None.

    `activa` filtra los bancos en edicion: el admin puede tener la evaluacion
    nueva cargandose sin que los estudiantes la vean todavia.
    """
    return (
        Evaluacion.objects
        .filter(course_id=course_id, activa=True)
        .prefetch_related('preguntas__opciones')
        .order_by('orden', 'id')
        .first()
    )


def banco_incompleto(evaluacion):
    """Cuantas preguntas no tienen una unica correcta marcada; 0 si esta bien.

    El admin no deja activar asi (ver admin.py), pero el banco tambien se
    puede tocar por SQL o por una carga de datos. Corregir contra el peor caso
    daria notas que nadie podria improbar: una pregunta sin correcta nadie la
    acierta y frena el certificado para siempre. Mejor fallar visible y que RH
    lo arregle.
    """
    total = evaluacion.total_preguntas
    if not total:
        return 0
    return total - total_correctas(evaluacion)


def registrar_calificacion(*, curso, evaluacion, respuestas, user_id,
                           user_name='', user_email=''):
    """Corrige, guarda la Calificacion y devuelve el veredicto.

    No mira nada de lo que el cliente diga sobre su nota: entra `respuestas` y
    sale score/percentage/passed de la comparacion contra la base. Tampoco mira
    quien es: `user_id`, `user_name` y `user_email` llegan ya resueltos desde
    `request.firebase_uid` / `request.nombre_verificado`, que fijo
    `@requiere_estudiante` a partir del token verificado. Por eso esta funcion
    no busca al usuario por ningun lado, ni aunque `user_id` fuera una cadena
    inventada.

    `course_name` va con el titulo del CURSO y no con el de la evaluacion: ese
    ultimo es decorativo ("Evaluación final") y el aviso de aprobacion lo lee
    gente de RH, que necesita saber que curso se completo.

    LA APROBACION ES IRREVERSIBLE y la fila guarda el MEJOR intento, no el
    ultimo. Antes se pisaba `passed` con el veredicto de cada intento, asi que
   aprobar y despues reprobar dejaba al estudiante sin aprobacion: justo lo
    contrario de lo que significa "aprobo", y con el certificado como
    consecuencia (perdia el derecho a descargarlo). Rindiendo de nuevo solo
    puede mejorar el numero.

    La respuesta reporta los valores de la fila guardada, no los de este
    intento, y por eso el veredicto que ve el estudiante y la puerta del
    certificado nunca se contradicen. Que este intento fuera peor se puede
    leer en `detalle` y en `intento_mejorado`, para que la pantalla lo diga
    en vez de fingir que el 100% de antes es el de ahora.

    Devuelve un dict con la fila, el detalle pregunta por pregunta y si la
    nota es nueva. El aviso de aprobacion NO se manda desde aca: lo manda la
    vista, que tiene el `request` para armar los enlaces del correo.
    """
    score, total, detalle = corrector(evaluacion, respuestas)
    percentage = round((score / total) * 100) if total else 0
    passed = percentage >= evaluacion.puntaje_aprobacion

    # El aviso sale solo en la PRIMERA transicion de reprobar a aprobar: repetir
    # el quiz y aprobar de nuevo no multiplica correos.
    previa = Calificacion.objects.filter(
        user_id=user_id, course_id=str(curso.id)
    ).first()
    ya_aprobo = bool(previa and previa.passed)

    # Solo se pisa con un intento estrictamente mejor. Empate no cuenta: rindiendo
    # lo mismo dos veces no tiene por que reescribir la fila ni tocar la fecha.
    intento_mejorado = previa is None or percentage > previa.percentage

    if intento_mejorado:
        fila_score, fila_total = score, total
        fila_percentage, fila_passed = percentage, passed
    else:
        fila_score = previa.score
        fila_total = previa.total_questions
        fila_percentage = previa.percentage
        fila_passed = previa.passed

    defaults = {
        'course_name': curso.title,
        'evaluacion': evaluacion,
        'score': fila_score,
        'total_questions': fila_total,
        'percentage': fila_percentage,
        'passed': fila_passed,
    }
    # La identidad solo se pisa si viene informada: un cliente que no manda
    # user_name ni user_email no debe borrar la que ya estaba guardada.
    if user_name:
        defaults['user_name'] = user_name
    if user_email:
        defaults['user_email'] = user_email

    if previa is not None and not intento_mejorado:
        # update_or_create() hace save() aunque los valores sean identicos, y
        # fecha_creacion es auto_now: reintentar con la misma nota moveria la
        # fecha de una fila que en realidad no cambio (y al usuario le
        # apareceria como si acabara de calificar). Solo se escribe si hay
        # algo distinto de verdad, por ejemplo el nombre del curso si RH lo
        # renombro, o el nombre del alumno si esta vez si vino informado.
        cambios = {
            campo: valor for campo, valor in defaults.items()
            if getattr(previa, campo) != valor
        }
        if cambios:
            for campo, valor in cambios.items():
                setattr(previa, campo, valor)
            previa.save()
        calificacion, created = previa, False
    else:
        calificacion, created = Calificacion.objects.update_or_create(
            user_id=user_id,
            course_id=str(curso.id),
            defaults=defaults,
        )

    return {
        'calificacion': calificacion,
        'score': fila_score,
        'total': fila_total,
        'percentage': fila_percentage,
        'passed': fila_passed,
        'puntaje_aprobacion': evaluacion.puntaje_aprobacion,
        # Solo se puede exponer DESPUES de guardar: ya no le sirve al cliente
        # para volver a mandar. Lo consume la vista para armar la respuesta.
        'detalle': detalle,
        'notificar': fila_passed and not ya_aprobo,
        'created': created,
        'intento_mejorado': intento_mejorado,
        # Para que la pantalla pueda decir "ya lo habias aprobado" en vez de
        # mostrar un 100% viejo como si fuera el resultado de este intento.
        'ya_aprobado': ya_aprobo,
        # Lo que este intento dio en realidad, aunque no se haya guardado.
        'intento_percentage': percentage,
        'intento_score': score,
    }


def curso_de(course_id):
    """El curso de un id, o None si el id no corresponde a ningun curso.

    A diferencia de get_object_or_404, no revienta con 404: guardar_calificacion
    acepta course_id como texto libre (por course_name, para clientes viejos) y
    necesita poder decir "ese curso no existe" con su propio mensaje.
    """
    try:
        pk = int(str(course_id).strip())
    except (TypeError, ValueError):
        return None
    return Course.objects.filter(pk=pk).first()


def error(mensaje, status):
    """JsonResponse de error, para no repetir el dict en cada rama."""
    return JsonResponse({'error': mensaje}, status=status)

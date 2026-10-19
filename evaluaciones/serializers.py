"""Traduccion entre los modelos de evaluaciones y el JSON del frontend.

La separacion importante es la de las dos funciones:

- `serializar_evaluacion` arma lo que ve el ESTUDIANTE. Nunca incluye
  `es_correcta`: si el navegador recibiera la respuesta correcta podria
  postearla sin resolver el quiz, y el backend la creeria.
- `corregir` hace lo contrario, con la base: es el unico lugar donde se mira
  `es_correcta`.
"""


def serializar_evaluacion(evaluacion):
    """El quiz tal como lo consume el estudiante. Sin respuestas correctas."""
    preguntas = []
    for pregunta in evaluacion.preguntas_ordenadas:
        preguntas.append({
            'id': pregunta.id,
            'texto': pregunta.texto,
            'contexto': pregunta.contexto,
            'es_larga': pregunta.es_larga,
            'opciones': [
                {'id': opcion.id, 'texto': opcion.texto}
                for opcion in pregunta.opciones_ordenadas
            ],
        })

    return {
        'id': evaluacion.id,
        'titulo': evaluacion.titulo,
        'puntaje_aprobacion': evaluacion.puntaje_aprobacion,
        'total_preguntas': len(preguntas),
        'preguntas': preguntas,
    }


def corrector(evaluacion, respuestas):
    """Corrige contra la base y devuelve (score, total, detalle).

    `respuestas` viene como {id_pregunta: id_opcion} con las claves como
    texto, porque asi llega del JSON.parse del navegador.

    El detalle es por pregunta, no solo el total: el estudiante puede ver
    cual fallo y cual era la correcta. Es informacion que el backend puede dar
    DESPUES de que rindio, porque la nota ya quedo guardada.

    Una respuesta que no corresponde a la pregunta (por ejemplo, la opcion de
    otra pregunta, o un id que no existe) cuenta como incorrecta y no revienta:
    un cliente buggy, no un ataque, no puede tumbar el endpoint.
    """
    detalle = []
    score = 0
    total = 0

    for pregunta in evaluacion.preguntas_ordenadas:
        total += 1
        correcta = pregunta.opcion_correcta
        elegida_id = _a_id(respuestas.get(str(pregunta.id)))
        elegida = next(
            (o for o in pregunta.opciones_ordenadas if o.id == elegida_id),
            None,
        )
        acierto = correcta is not None and elegida is not None and elegida.id == correcta.id
        if acierto:
            score += 1

        detalle.append({
            'pregunta_id': pregunta.id,
            'texto': pregunta.texto,
            'correcta': acierto,
            # None cuando el estudiante no contesto esa pregunta.
            'opcion_elegida': elegida.id if elegida else None,
            'opcion_correcta': correcta.id if correcta else None,
        })

    return score, total, detalle


def _a_id(valor):
    """Normaliza a int lo que llega del JSON. None si no es un id usable."""
    if valor is None or isinstance(valor, bool):
        return None
    try:
        return int(valor)
    except (TypeError, ValueError):
        return None


def total_correctas(evaluacion):
    """Cuantas preguntas tienen exactamente una opcion correcta marcada."""
    return sum(
        1 for p in evaluacion.preguntas_ordenadas
        if sum(1 for o in p.opciones_ordenadas if o.es_correcta) == 1
    )


# ── La version para la pantalla de gestion (solo staff) ──────────────────
#
# Estas funciones SI incluyen `es_correcta`, a diferencia de
# `serializar_evaluacion`. Es a proposito y con el mismo criterio de siempre:
# el estudiante nunca recibe la respuesta correcta (la haria el quiz
# innecesario), pero quien gestiona el banco no puede marcar la correcta sin
# verla. La proteccion no es el JSON: es que estas rutas exigen `is_staff`
# (ver usuarios.permisos.requiere_staff y evaluaciones.admin_api).


def _fila_opcion_admin(opcion):
    return {
        'id': opcion.id,
        'texto': opcion.texto,
        'es_correcta': opcion.es_correcta,
        'orden': opcion.orden,
    }


def _fila_pregunta_admin(pregunta):
    return {
        'id': pregunta.id,
        'texto': pregunta.texto,
        'contexto': pregunta.contexto,
        'es_larga': pregunta.es_larga,
        'orden': pregunta.orden,
        'opciones': [
            _fila_opcion_admin(o) for o in pregunta.opciones_ordenadas
        ],
    }


def _fila_evaluacion_resumen(evaluacion):
    return {
        'id': evaluacion.id,
        'course_id': evaluacion.course_id,
        'course_title': evaluacion.course.title,
        'titulo': evaluacion.titulo,
        'puntaje_aprobacion': evaluacion.puntaje_aprobacion,
        'activa': evaluacion.activa,
        'orden': evaluacion.orden,
        'total_preguntas': evaluacion.total_preguntas,
    }


def serializar_lista_admin(evaluaciones):
    """El listado de la pantalla de gestion: una fila por evaluacion."""
    return [_fila_evaluacion_resumen(e) for e in evaluaciones]


def serializar_admin_evaluacion(evaluacion):
    """El detalle completo, con preguntas, opciones y la correcta marcada.

    prefetch de `preguntas__opciones` en la vista: sin eso, cada pregunta
    consulta sus opciones sola y el listado de 30 preguntas son 31 queries.
    """
    fila = _fila_evaluacion_resumen(evaluacion)
    fila['total_preguntas'] = len(evaluacion.preguntas_ordenadas)
    fila['preguntas'] = [
        _fila_pregunta_admin(p) for p in evaluacion.preguntas_ordenadas
    ]
    return fila

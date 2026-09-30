import json

from django.core import mail
from django.test import TestCase, override_settings

from courses.models import Calificacion, Course

from .models import Evaluacion, Opcion, Pregunta

DESTINATARIOS = ['interno@megas.co']


def crear_curso(titulo='Curso de prueba', **extra):
    return Course.objects.create(title=titulo, description='.', **extra)


def crear_evaluacion(curso, titulo='Evaluación final', puntaje_aprobacion=90,
                      activa=True, preguntas=2, correctas_por_pregunta=1):
    """Banco mínimo: `preguntas` preguntas, la última con la correcta marcada."""
    evaluacion = Evaluacion.objects.create(
        course=curso, titulo=titulo,
        puntaje_aprobacion=puntaje_aprobacion, activa=activa,
    )
    for i in range(1, preguntas + 1):
        pregunta = Pregunta.objects.create(
            evaluacion=evaluacion, texto=f'Pregunta {i}', orden=i,
        )
        # La primera opción es correcta; el resto son distractores.
        for j, correcta in enumerate([True] + [False, False], start=1):
            Opcion.objects.create(
                pregunta=pregunta, texto=f'Opción {j}',
                es_correcta=correcta and j <= correctas_por_pregunta,
                orden=j,
            )
    return evaluacion


def ids_correctas(evaluacion):
    """{id_pregunta: id_opcion_correcta} para armar respuestas approves."""
    return {
        str(p.id): p.opcion_correcta.id
        for p in evaluacion.preguntas_ordenadas
    }


def ids_incorrectas(evaluacion):
    return {
        str(p.id): p.opciones_ordenadas[-1].id
        for p in evaluacion.preguntas_ordenadas
    }


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class ObtenerEvaluacionTest(TestCase):
    """Lo que ve el estudiante, y sobre todo lo que NO ve."""

    url = '/api/cursos/evaluaciones/'

    def setUp(self):
        self.curso = crear_curso()
        self.evaluacion = crear_evaluacion(self.curso)

    def test_devuelve_el_banco_con_titulo_y_puntaje(self):
        respuesta = self.client.get(f'{self.url}{self.curso.id}/')

        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.json()
        self.assertEqual(datos['titulo'], 'Evaluación final')
        self.assertEqual(datos['puntaje_aprobacion'], 90)
        self.assertEqual(datos['total_preguntas'], 2)
        self.assertEqual(len(datos['preguntas']), 2)
        self.assertEqual(len(datos['preguntas'][0]['opciones']), 3)
        self.assertEqual(
            [o['id'] for o in datos['preguntas'][0]['opciones']],
            [o.id for o in self.evaluacion.preguntas_ordenadas[0].opciones_ordenadas],
        )

    def test_no_devuelve_cual_es_la_respuesta_correcta(self):
        # La razon de ser del modulo: si el navegador supiera la correcta,
        # podria postearla sin resolver nada.
        datos = self.client.get(f'{self.url}{self.curso.id}/').json()

        for pregunta in datos['preguntas']:
            for opcion in pregunta['opciones']:
                self.assertNotIn('es_correcta', opcion)
            self.assertNotIn('correcta', pregunta)
        self.assertNotIn('es_correcta', json.dumps(datos))

    def test_curso_sin_evaluacion_da_404(self):
        # No es un error del frontend: es el caso de un curso nuevo en /admin.
        curso = crear_curso('Curso sin preguntas')

        respuesta = self.client.get(f'{self.url}{curso.id}/')

        self.assertEqual(respuesta.status_code, 404)
        self.assertIn('no tiene', respuesta.json()['error'])

    def test_evaluacion_inactiva_no_se_sirve(self):
        # Para que el admin pueda tener el banco nuevo en edicion sin que los
        # estudiantes lo vean todavia.
        inactive = crear_evaluacion(self.curso, titulo='Borrador', activa=False)

        respuesta = self.client.get(f'{self.url}{self.curso.id}/')

        self.assertEqual(respuesta.status_code, 200)
        self.assertNotEqual(respuesta.json()['id'], inactive.id)

    def test_curso_inexistente_da_404(self):
        self.assertEqual(self.client.get(f'{self.url}999999/').status_code, 404)

    def test_banco_sin_correcta_marcada_no_se_sirve(self):
        # Con una pregunta sin correcta, nadie puede aprobarla y el certificado
        # queda trabado para siempre: mejor fallar visible.
        pregunta = self.evaluacion.preguntas_ordenadas[0]
        pregunta.opciones.update(es_correcta=False)

        respuesta = self.client.get(f'{self.url}{self.curso.id}/')

        self.assertEqual(respuesta.status_code, 409)
        self.assertIn('correcta', respuesta.json()['error'])


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class EntregarEvaluacionTest(TestCase):
    """La correccion es del backend; el cliente no dice cuanto saco."""

    url = '/api/cursos/evaluaciones/'

    def setUp(self):
        self.curso = crear_curso('Curso 1: ¿Qué es el autoglp?')
        self.evaluacion = crear_evaluacion(self.curso, preguntas=2)
        self.url_entregar = f'{self.url}{self.curso.id}/entregar/'

    def _entregar(self, respuestas, **extra):
        payload = {
            'user_id': 'uid-abc',
            'user_name': 'Ana Perez',
            'user_email': 'ana@ejemplo.co',
            'respuestas': respuestas,
        }
        payload.update(extra)
        return self.client.post(
            self.url_entregar,
            data=json.dumps(payload),
            content_type='application/json',
        )

    def test_todo_correcto_aproba_y_avisa_a_internos(self):
        respuesta = self._entregar(ids_correctas(self.evaluacion))

        self.assertEqual(respuesta.status_code, 201)
        datos = respuesta.json()['data']
        self.assertEqual(datos['score'], 2)
        self.assertEqual(datos['total_questions'], 2)
        self.assertEqual(datos['percentage'], 100)
        self.assertTrue(datos['passed'])
        self.assertEqual(datos['puntaje_aprobacion'], 90)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, DESTINATARIOS)
        # El aviso lleva el titulo del CURSO, no el decorativo de la evaluación.
        self.assertIn('Curso 1: ¿Qué es el autoglp?', mail.outbox[0].body)

    def test_la_nota_del_cliente_se_ignora(self):
        # Con el modelo viejo, esto era un 100% sin abrir el quiz.
        respuesta = self._entregar(
            ids_incorrectas(self.evaluacion),
            score=99, percentage=100, passed=True,
        )

        datos = respuesta.json()['data']
        self.assertEqual(datos['score'], 0)
        self.assertEqual(datos['percentage'], 0)
        self.assertFalse(datos['passed'])
        self.assertEqual(len(mail.outbox), 0)

    def test_nota_del_cliente_tampoco_puede_achicar_un_buen_resultado(self):
        self._entregar(ids_correctas(self.evaluacion))
        mail.outbox.clear()

        respuesta = self._entregar(
            ids_correctas(self.evaluacion), score=0, percentage=0, passed=False,
        )

        self.assertEqual(respuesta.json()['data']['percentage'], 100)
        self.assertTrue(respuesta.json()['data']['passed'])
        # Ya habia aprobado: no se le avisa otra vez.
        self.assertEqual(len(mail.outbox), 0)

    def test_sin_responder_una_pregunta_esta_mal(self):
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))

        respuesta = self._entregar(respuestas)

        self.assertEqual(respuesta.json()['data']['score'], 1)
        self.assertEqual(respuesta.json()['data']['percentage'], 50)
        self.assertFalse(respuesta.json()['data']['passed'])

    def test_opcion_de_otra_pregunta_no_cuenta(self):
        # Cliente buggy, no un ataque: cuenta como mal y no revienta.
        otra = self.evaluacion.preguntas_ordenadas[1]
        ajena = otra.opciones_ordenadas[-1].id

        respuesta = self._entregar({str(otra.id): ajena})

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(respuesta.json()['data']['score'], 0)
        self.assertFalse(respuesta.json()['data']['passed'])

    def test_id_de_opcion_inventado_no_revienta(self):
        respuesta = self._entregar({'999999': '888888'})

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(respuesta.json()['data']['score'], 0)

    def test_detalle_dice_cual_era_la_correcta(self):
        respuestas = ids_correctas(self.evaluacion)
        primera = self.evaluacion.preguntas_ordenadas[0]
        respuestas[str(primera.id)] = primera.opciones_ordenadas[-1].id

        detalle = self._entregar(respuestas).json()['detalle']

        self.assertEqual(len(detalle), 2)
        fallada = next(d for d in detalle if not d['correcta'])
        self.assertEqual(fallada['pregunta_id'], primera.id)
        self.assertEqual(fallada['opcion_correcta'], primera.opcion_correcta.id)
        self.assertNotEqual(fallada['opcion_elegida'], fallada['opcion_correcta'])
        # La que acertó no trae opcion_elegida porque es la misma.
        self.assertTrue(next(d for d in detalle if d['correcta'])['correcta'])

    def test_sin_respuestas_es_400(self):
        respuesta = self._entregar({})

        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('respuestas', respuesta.json()['error'])
        self.assertEqual(Calificacion.objects.count(), 0)

    def test_sin_user_id_es_400(self):
        respuesta = self._entregar(
            ids_correctas(self.evaluacion), user_id='',
        )

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(Calificacion.objects.count(), 0)

    def test_json_invalido_es_400(self):
        respuesta = self.client.post(
            self.url_entregar, data='{no es json', content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 400)

    def test_puntaje_de_aprobacion_lo_manda_el_admin(self):
        # Con el umbral en 50, una sola respuesta buena alcanza.
        self.evaluacion.puntaje_aprobacion = 50
        self.evaluacion.save()
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))

        respuesta = self._entregar(respuestas)

        self.assertEqual(respuesta.json()['data']['percentage'], 50)
        self.assertTrue(respuesta.json()['data']['passed'])

    def test_repetir_aprobacion_no_reenvia_correo(self):
        self._entregar(ids_correctas(self.evaluacion))
        mail.outbox.clear()

        respuesta = self._entregar(ids_correctas(self.evaluacion))

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Calificacion.objects.count(), 1)

    def test_aprobar_despues_de_reprobar_sigue_notificando(self):
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))
        self._entregar(respuestas)
        mail.outbox.clear()

        respuesta = self._entregar(ids_correctas(self.evaluacion))

        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)

    def test_smtp_caido_no_tira_la_nota(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            respuesta = self._entregar(ids_correctas(self.evaluacion))

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertIn('smtp caido', respuesta.json()['notificacion_error'])
        self.assertTrue(Calificacion.objects.get().passed)

    def test_queda_ligada_a_la_evaluacion_y_al_curso(self):
        self._entregar(ids_correctas(self.evaluacion))

        calificacion = Calificacion.objects.get()
        self.assertEqual(calificacion.evaluacion, self.evaluacion)
        self.assertEqual(calificacion.course_id, str(self.curso.id))
        self.assertEqual(calificacion.course_name, self.curso.title)

    def test_cliente_sin_identidad_no_borra_la_que_habia(self):
        self._entregar(ids_correctas(self.evaluacion))

        self._entregar(
            ids_correctas(self.evaluacion), user_name='', user_email='',
        )

        calificacion = Calificacion.objects.get()
        self.assertEqual(calificacion.user_name, 'Ana Perez')
        self.assertEqual(calificacion.user_email, 'ana@ejemplo.co')

    def test_curso_sin_evaluacion_no_acepta_una_entrega(self):
        curso = crear_curso('Curso sin preguntas')

        respuesta = self.client.post(
            f'{self.url}{curso.id}/entregar/',
            data=json.dumps({'user_id': 'uid-abc', 'respuestas': {'1': '1'}}),
            content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 404)
        self.assertEqual(Calificacion.objects.count(), 0)
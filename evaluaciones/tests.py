import json
from datetime import timedelta

from django.utils import timezone

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings

from courses.models import Calificacion, Course
from usuarios.testing import ConSesion

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
class ObtenerEvaluacionTest(ConSesion, TestCase):
    """Lo que ve el estudiante, y sobre todo lo que NO ve."""

    url = '/api/cursos/evaluaciones/'

    def setUp(self):
        super().setUp()
        self.curso = crear_curso()
        self.evaluacion = crear_evaluacion(self.curso)

    def _banco(self, curso_id=None):
        return self.client.get(
            f'{self.url}{curso_id or self.curso.id}/', **self.sesion.header()
        )

    def test_devuelve_el_banco_con_titulo_y_puntaje(self):
        respuesta = self._banco()

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
        datos = self._banco().json()

        for pregunta in datos['preguntas']:
            for opcion in pregunta['opciones']:
                self.assertNotIn('es_correcta', opcion)
            self.assertNotIn('correcta', pregunta)
        self.assertNotIn('es_correcta', json.dumps(datos))

    def test_curso_sin_evaluacion_da_404(self):
        # No es un error del frontend: es el caso de un curso nuevo en /admin.
        curso = crear_curso('Curso sin preguntas')

        respuesta = self._banco(curso.id)

        self.assertEqual(respuesta.status_code, 404)
        self.assertIn('no tiene', respuesta.json()['error'])

    def test_evaluacion_inactiva_no_se_sirve(self):
        # Para que el admin pueda tener el banco nuevo en edicion sin que los
        # estudiantes lo vean todavia.
        inactive = crear_evaluacion(self.curso, titulo='Borrador', activa=False)

        respuesta = self._banco()

        self.assertEqual(respuesta.status_code, 200)
        self.assertNotEqual(respuesta.json()['id'], inactive.id)

    def test_curso_inexistente_da_404(self):
        self.assertEqual(self._banco(999999).status_code, 404)

    def test_banco_sin_correcta_marcada_no_se_sirve(self):
        # Con una pregunta sin correcta, nadie puede aprobarla y el certificado
        # queda trabado para siempre: mejor fallar visible.
        pregunta = self.evaluacion.preguntas_ordenadas[0]
        pregunta.opciones.update(es_correcta=False)

        respuesta = self._banco()

        self.assertEqual(respuesta.status_code, 409)
        self.assertIn('correcta', respuesta.json()['error'])


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class EntregarEvaluacionTest(ConSesion, TestCase):
    """La correccion es del backend; el cliente no dice cuanto saco."""

    url = '/api/cursos/evaluaciones/'

    def setUp(self):
        super().setUp()
        self.curso = crear_curso('Curso 1: ¿Qué es el autoglp?')
        self.evaluacion = crear_evaluacion(self.curso, preguntas=2)
        self.url_entregar = f'{self.url}{self.curso.id}/entregar/'

    def _entregar(self, respuestas, **extra):
        # El `user_id` del payload ya no decide de quien es la nota: lo pone el
        # token. Se sigue mandando porque el endpoint lo admitia, y los tests
        # de abajo comprueban que mandarlo no cambia nada.
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
            **self.sesion.header(),
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

    def test_sin_user_id_no_impide_aprobar(self):
        # Antes esto era 400 y no habia nota. Ahora el uid sale del token
        # verificado, asi que un cliente viejo que no mande el campo (o mande
        # uno de otro) califica igual, y con la fila que es suya.
        respuesta = self._entregar(
            ids_correctas(self.evaluacion), user_id='',
        )

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(Calificacion.objects.get().user_id, 'uid-abc')

    def test_el_user_id_del_cuerpo_no_pisa_el_del_token(self):
        respuesta = self._entregar(
            ids_correctas(self.evaluacion), user_id='uid-otro',
            user_name='Impostor',
        )

        self.assertEqual(respuesta.status_code, 201)
        calificacion = Calificacion.objects.get()
        self.assertEqual(calificacion.user_id, 'uid-abc')
        # Y el nombre tampoco: sale del alta de RH, no de lo que affirmaba el
        # navegador.
        self.assertEqual(calificacion.user_name, 'Ana Perez')

    def test_json_invalido_es_400(self):
        respuesta = self.client.post(
            self.url_entregar, data='{no es json',
            content_type='application/json', **self.sesion.header(),
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

    def test_reprobar_no_revierte_la_aprobacion(self):
        # La fila guarda el mejor intento, no el último. Con el umbral en 50,
        # aprobar con 1 de 2 y reintentar fallando todo no puede dejar
        # passed=False: el certificado ya existe y esa fila es su respaldo.
        self.evaluacion.puntaje_aprobacion = 50
        self.evaluacion.save()
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))
        self._entregar(respuestas)

        primera = self.evaluacion.preguntas_ordenadas[0]
        todo_mal = {
            str(p.id): p.opciones_ordenadas[-1].id
            for p in self.evaluacion.preguntas_ordenadas
        }
        assert todo_mal[str(primera.id)] != primera.opcion_correcta.id
        respuesta = self._entregar(todo_mal)

        self.assertTrue(respuesta.json()['data']['passed'])
        self.assertEqual(respuesta.json()['data']['percentage'], 50)
        guardada = Calificacion.objects.get()
        self.assertTrue(guardada.passed)
        self.assertEqual(guardada.percentage, 50)

    def test_intento_peor_no_toca_la_fila(self):
        self.evaluacion.puntaje_aprobacion = 50
        self.evaluacion.save()
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))
        self._entregar(respuestas)
        # fecha_creacion es auto_now: cambia en cada save(), asi que sirve para
        # detectar una escritura que no deberia haberse hecho.
        Calificacion.objects.update(fecha_creacion=timezone.now() - timedelta(days=7))
        antes = Calificacion.objects.get().fecha_creacion

        todo_mal = {
            str(p.id): p.opciones_ordenadas[-1].id
            for p in self.evaluacion.preguntas_ordenadas
        }
        self._entregar(todo_mal)

        self.assertEqual(Calificacion.objects.get().fecha_creacion, antes)

    def test_intento_mejor_actualiza_la_fila(self):
        self.evaluacion.puntaje_aprobacion = 50
        self.evaluacion.save()
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))
        self._entregar(respuestas)

        respuesta = self._entregar(ids_correctas(self.evaluacion))

        datos = respuesta.json()['data']
        self.assertTrue(datos['intento_mejorado'])
        # La fila ya estaba aprobada de antes (con 50%), pero este intento la
        # mejoro: por eso el aviso sale una sola vez, en el primer aprobado.
        self.assertTrue(datos['ya_aprobado'])
        # Y aunque la fila se haya reescrito, el aviso no sale otra vez: la
        # notificacion se ata a la transicion reprobar -> aprobar.
        self.assertFalse(respuesta.json()['notificado'])
        self.assertEqual(datos['percentage'], 100)
        self.assertEqual(Calificacion.objects.get().percentage, 100)

    def test_repetir_igual_no_cuenta_como_mejora(self):
        # Mismo porcentaje: no se toca la fila y no se reenvía el aviso. Si
        # contara como mejora, reintentar hasta acertar la mitad lanzaría
        # correos y cambios de fecha sin motivo.
        self.evaluacion.puntaje_aprobacion = 50
        self.evaluacion.save()
        respuestas = ids_correctas(self.evaluacion)
        respuestas.pop(next(iter(respuestas)))
        self._entregar(respuestas)
        mail.outbox.clear()

        respuesta = self._entregar(respuestas)

        datos = respuesta.json()['data']
        self.assertFalse(datos['intento_mejorado'])
        self.assertTrue(datos['ya_aprobado'])
        self.assertFalse(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 0)

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
        # La identidad ya no viene del cuerpo, asi que vaciarla no toca nada: la
        # fila conserva lo que puso el alta de RH.
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
            data=json.dumps({'respuestas': {'1': '1'}}),
            content_type='application/json',
            **self.sesion.header(),
        )

        self.assertEqual(respuesta.status_code, 404)
        self.assertEqual(Calificacion.objects.count(), 0)


class AdminEvaluacionesTest(TestCase):
    """El admin de evaluaciones: el camino natural para crear un banco.

    Estas pruebas existen porque el admin se rompio sin que ningun test lo
    notara: EvaluacionAdmin sobreescribia changeform_view() sin el argumento
    `object_id`, y el alta devolvia un error 500. La firma de un override hay
    que probarla, no solo escribirla bien.
    """

    def setUp(self):
        self.admin = get_user_model().objects.create_superuser(
            'admin', 'admin@ejemplo.co', 'clave-de-prueba',
        )
        self.client.force_login(self.admin)
        self.curso = crear_curso('Curso para cargar preguntas')

    def _post_alta(self, **extra):
        """Payload del formulario de alta, con una pregunta.

        Los prefijos de los inlines salen del related_name de cada FK:
        `preguntas` para PreguntaInline.

        NO se mandan opciones: Django ignora los inlines anidados, asi que en
        esta pantalla no existen campos `preguntas-0-opciones-*`. Las opciones
        van en un POST aparte contra la pantalla de la pregunta.
        """
        datos = {
            'course': self.curso.id,
            'titulo': 'Evaluación final',
            'puntaje_aprobacion': 90,
            'activa': 'on',
            'orden': 0,
            'preguntas-TOTAL_FORMS': 1,
            'preguntas-INITIAL_FORMS': 0,
            'preguntas-MIN_NUM_FORMS': 0,
            'preguntas-MAX_NUM_FORMS': 1000,
            'preguntas-0-texto': '¿Qué es la venta consultiva?',
            'preguntas-0-contexto': '',
            'preguntas-0-orden': 1,
            '_save': 'Guardar',
        }
        datos.update(extra)
        return self.client.post('/admin/evaluaciones/evaluacion/add/', datos)

    def _post_opciones(self, pregunta, correctas=(0,)):
        """Carga las opciones desde la pantalla de la pregunta.

        Acá OpcionInline es un inline de primer nivel, asi que si funciona.
        """
        textos = ['Entender al cliente', 'Vender sin preguntar', 'Solo hablar de precio']
        datos = {
            'evaluacion': pregunta.evaluacion_id,
            'texto': pregunta.texto,
            'contexto': pregunta.contexto,
            'es_larga': '',
            'orden': pregunta.orden,
            'opciones-TOTAL_FORMS': len(textos),
            'opciones-INITIAL_FORMS': 0,
            'opciones-MIN_NUM_FORMS': 0,
            'opciones-MAX_NUM_FORMS': 1000,
            '_save': 'Guardar',
        }
        for i, texto in enumerate(textos):
            datos[f'opciones-{i}-texto'] = texto
            datos[f'opciones-{i}-orden'] = i + 1
            if i in correctas:
                datos[f'opciones-{i}-es_correcta'] = 'on'
        return self.client.post(
            f'/admin/evaluaciones/pregunta/{pregunta.id}/change/', datos
        )

    def test_la_pantalla_de_alta_abre(self):
        respuesta = self.client.get('/admin/evaluaciones/evaluacion/add/')

        self.assertEqual(respuesta.status_code, 200)
        # Si volviera al índice, el redirect traería Location y status 302.
        self.assertIsNone(respuesta.headers.get('Location'))
        self.assertContains(respuesta, 'preguntas')

    def test_la_pantalla_de_alta_no_trae_campos_de_opciones(self):
        # Documenta el limite de Django, no un desire: los inlines anidados no
        # existen. Si esto cambia y aparecen los campos, hay que volver a
        # revisar el flujo y este test.
        html = self.client.get(
            '/admin/evaluaciones/evaluacion/add/'
        ).content.decode()

        self.assertNotIn('preguntas-0-opciones-', html)
        # La ayuda tiene que decir que las opciones van en otra pantalla.
        self.assertContains(
            self.client.get('/admin/evaluaciones/evaluacion/add/'),
            'no permite poner opciones en esta misma',
        )

    def test_la_pantalla_de_edicion_abre(self):
        evaluacion = crear_evaluacion(self.curso)

        respuesta = self.client.get(
            f'/admin/evaluaciones/evaluacion/{evaluacion.id}/change/'
        )

        self.assertEqual(respuesta.status_code, 200)
        self.assertIsNone(respuesta.headers.get('Location'))

    def test_flujo_completo_crea_la_evaluacion_y_activarla(self):
        # El camino que va a seguir quien use el admin: evaluación inactiva con
        # su pregunta, opciones desde la pregunta, y recién ahí activar.
        self._post_alta(**{'activa': ''})
        evaluacion = Evaluacion.objects.get(titulo='Evaluación final')
        self.assertFalse(evaluacion.activa)

        self._post_opciones(evaluacion.preguntas_ordenadas[0])
        self.assertEqual(
            evaluacion.preguntas_ordenadas[0].opcion_correcta.texto,
            'Entender al cliente',
        )

        # Ahora sí, activar: el save_related tiene que dejar pasar.
        respuesta = self.client.post(
            f'/admin/evaluaciones/evaluacion/{evaluacion.id}/change/',
            {
                'course': self.curso.id,
                'titulo': 'Evaluación final',
                'puntaje_aprobacion': 90,
                'activa': 'on',
                'orden': 0,
                'preguntas-TOTAL_FORMS': 1,
                'preguntas-INITIAL_FORMS': 1,
                'preguntas-MIN_NUM_FORMS': 0,
                'preguntas-MAX_NUM_FORMS': 1000,
                'preguntas-0-id': evaluacion.preguntas_ordenadas[0].id,
                'preguntas-0-evaluacion': evaluacion.id,
                'preguntas-0-texto': '¿Qué es la venta consultiva?',
                'preguntas-0-contexto': '',
                'preguntas-0-orden': 1,
                '_save': 'Guardar',
            },
        )

        self.assertEqual(respuesta.status_code, 302)
        evaluacion.refresh_from_db()
        self.assertTrue(evaluacion.activa)

    def test_la_pantalla_de_pregunta_explica_el_orden_de_carga(self):
        # El deadlock de arrancar de cero: sin evaluaciones cargadas, el
        # select de `evaluacion` queda vacio y el alta se bloquea sin decir
        # por que.
        evaluacion = crear_evaluacion(self.curso)

        html = self.client.get(
            '/admin/evaluaciones/pregunta/add/'
        ).content.decode()

        self.assertIn('name="evaluacion"', html)
        self.assertContains(
            self.client.get('/admin/evaluaciones/pregunta/add/'),
            'campo <b>Evaluación</b> es obligatorio',
        )
        # Y el desplegable tiene que ofrecer de verdad la evaluación existente.
        self.assertIn(f'value="{evaluacion.id}"', html)

    def test_crear_pregunta_sin_evaluacion_no_se_puede(self):
        # `evaluacion` es obligatoria a proposito: una pregunta huerfana no se
        # serviria nunca y dejaria total_correctas() en nonsense.
        respuesta = self.client.post(
            '/admin/evaluaciones/pregunta/add/',
            {
                'evaluacion': '',
                'texto': 'Pregunta sin Evaluación',
                'contexto': '',
                'es_larga': '',
                'orden': 1,
                'opciones-TOTAL_FORMS': 0,
                'opciones-INITIAL_FORMS': 0,
                'opciones-MIN_NUM_FORMS': 0,
                'opciones-MAX_NUM_FORMS': 1000,
                '_save': 'Guardar',
            },
        )

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(Pregunta.objects.count(), 0)

    def test_crear_pregunta_con_evaluacion_si_se_puede(self):
        evaluacion = crear_evaluacion(self.curso)

        respuesta = self.client.post(
            '/admin/evaluaciones/pregunta/add/',
            {
                'evaluacion': evaluacion.id,
                'texto': '¿Qué es la venta consultiva?',
                'contexto': '',
                'es_larga': '',
                'orden': 1,
                'opciones-TOTAL_FORMS': 0,
                'opciones-INITIAL_FORMS': 0,
                'opciones-MIN_NUM_FORMS': 0,
                'opciones-MAX_NUM_FORMS': 1000,
                '_save': 'Guardar',
            },
        )

        self.assertEqual(respuesta.status_code, 302)
        pregunta = Pregunta.objects.get(texto='¿Qué es la venta consultiva?')
        self.assertEqual(pregunta.evaluacion, evaluacion)

    def test_activar_sin_preguntas_no_guarda(self):
        # El banco se arma en la misma pantalla, pero alguien puede activar
        # antes de escribirla. Sin esto, la evaluación queda activa y vacía.
        respuesta = self._post_alta(**{'preguntas-TOTAL_FORMS': 0})

        self.assertEqual(Evaluacion.objects.count(), 0)
        # Vuelve al formulario con el error, no al índice y no con un 500.
        self.assertEqual(respuesta.status_code, 302)
        self.assertIn(
            '/admin/evaluaciones/evaluacion/add/',
            respuesta.headers['Location'],
        )

    def test_activar_con_una_pregunta_sin_correcta_no_guarda(self):
        # Pregunta y opciones cargadas, pero nadie marcó la correcta: no hay
        # nota que nadie pueda sacar, así que el banco no puede activarse.
        self._post_alta(**{'activa': ''})
        evaluacion = Evaluacion.objects.get(titulo='Evaluación final')
        self._post_opciones(evaluacion.preguntas_ordenadas[0], correctas=())

        respuesta = self.client.post(
            f'/admin/evaluaciones/evaluacion/{evaluacion.id}/change/',
            {
                'course': self.curso.id,
                'titulo': 'Evaluación final',
                'puntaje_aprobacion': 90,
                'activa': 'on',
                'orden': 0,
                'preguntas-TOTAL_FORMS': 1,
                'preguntas-INITIAL_FORMS': 1,
                'preguntas-MIN_NUM_FORMS': 0,
                'preguntas-MAX_NUM_FORMS': 1000,
                'preguntas-0-id': evaluacion.preguntas_ordenadas[0].id,
                'preguntas-0-evaluacion': evaluacion.id,
                'preguntas-0-texto': '¿Qué es la venta consultiva?',
                'preguntas-0-contexto': '',
                'preguntas-0-orden': 1,
                '_save': 'Guardar',
            },
        )

        evaluacion.refresh_from_db()
        self.assertFalse(evaluacion.activa)
        self.assertIn(
            f'/admin/evaluaciones/evaluacion/{evaluacion.id}/change/',
            respuesta.headers['Location'],
        )

    def test_el_formset_de_opciones_rechaza_dos_correctas(self):
        # La validación vive en la pantalla de la pregunta, que es donde las
        # opciones se escriben de verdad.
        self._post_alta(**{'activa': ''})
        evaluacion = Evaluacion.objects.get(titulo='Evaluación final')
        pregunta = evaluacion.preguntas_ordenadas[0]

        respuesta = self._post_opciones(pregunta, correctas=(0, 1))

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(pregunta.opciones.count(), 0)

    def test_dejar_inactiva_sin_preguntas_si_se_puede(self):
        # Inactiva es el estado de "todavia no la cargo": tiene que dejar.
        respuesta = self._post_alta(
            **{'preguntas-TOTAL_FORMS': 0, 'activa': ''}
        )

        self.assertEqual(respuesta.status_code, 302)
        evaluacion = Evaluacion.objects.get(titulo='Evaluación final')
        self.assertFalse(evaluacion.activa)
        self.assertEqual(evaluacion.total_preguntas, 0)
import json
import os
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from usuarios.testing import ConSesion
from .models import Calificacion, Certificado, Course

AdminUser = get_user_model()
from evaluaciones.models import Evaluacion, Opcion, Pregunta

DESTINATARIOS = ['interno@megas.co']


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class NotificacionAprobacionTest(ConSesion, TestCase):
    """El aviso sale solo en la primera transicion de reprobar a aprobar.

    Las notas se aprueban mandando `respuestas`: el backend las corrige. Antes
    el cliente mandaba `passed` ya calculado y esta clase no tenia ningun
    banco de preguntas del que depender.

    `ConSesion` porque `guardar_calificacion` exige sesion: sin el patch del
    token, todo esto recibiria 401.
    """

    url = '/api/cursos/calificaciones/'
    TOTAL_PREGUNTAS = 5

    def setUp(self):
        super().setUp()
        # pk=1 para que el payload de los tests siga hablando del curso 1.
        self.curso = Course.objects.create(
            pk=1, title='Curso 1: ¿Qué es el autoglp?', description='.',
        )
        self.evaluacion = self._crear_evaluacion()

    def _crear_evaluacion(self):
        evaluacion = Evaluacion.objects.create(
            course=self.curso, titulo='Evaluación final',
            puntaje_aprobacion=90, activa=True,
        )
        for i in range(1, self.TOTAL_PREGUNTAS + 1):
            pregunta = Pregunta.objects.create(
                evaluacion=evaluacion, texto=f'Pregunta {i}', orden=i,
            )
            for j, correcta in enumerate([True, False, False, False], start=1):
                Opcion.objects.create(
                    pregunta=pregunta, texto=f'Opción {j}',
                    es_correcta=correcta, orden=j,
                )
        return evaluacion

    def _aprobadas(self):
        return {
            str(p.id): p.opcion_correcta.id
            for p in self.evaluacion.preguntas_ordenadas
        }

    def _suspendidas(self):
        return {
            str(p.id): p.opciones_ordenadas[-1].id
            for p in self.evaluacion.preguntas_ordenadas
        }

    def _postar(self, **extra):
        # El `user_id`/`user_name`/`user_email` del payload ya no deciden nada:
        # el backend los saca del token. Se siguen mandando porque el endpoint
        # lo admitia y los tests de abajo comprueban justamente que ignorarlos
        # no cambia el resultado.
        payload = {
            'user_id': 'uid-abc',
            'user_name': 'Ana Perez',
            'user_email': 'ana@ejemplo.co',
            'course_id': '1',
            'course_name': 'Curso 1: ¿Qué es el autoglp?',
        }
        payload.update(extra)
        return self.client.post(
            self.url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.sesion.header(),
        )

    def _aprobar(self, **extra):
        return self._postar(respuestas=self._aprobadas(), **extra)

    def _reprobar(self, **extra):
        return self._postar(respuestas=self._suspendidas(), **extra)

    def test_reprobar_no_notifica_pero_si_guarda(self):
        respuesta = self._reprobar()

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertFalse(Calificacion.objects.get().passed)

    def test_primera_aprobacion_notifica_a_internos(self):
        respuesta = self._aprobar()

        self.assertEqual(respuesta.status_code, 201)
        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, DESTINATARIOS)
        # El aviso va a los internos, no al usuario que aprobo.
        self.assertNotIn('ana@ejemplo.co', mail.outbox[0].to)

        cuerpo = mail.outbox[0].body
        self.assertIn('Ana Perez', cuerpo)
        self.assertIn('Curso 1: ¿Qué es el autoglp?', cuerpo)

    def test_repetir_aprobacion_no_reenvia(self):
        self._aprobar()
        mail.outbox.clear()

        respuesta = self._aprobar()

        self.assertEqual(respuesta.status_code, 200)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Calificacion.objects.count(), 1)

    def test_aprobar_despues_de_reprobar_sigue_notificando(self):
        self._reprobar()
        mail.outbox.clear()

        respuesta = self._aprobar()

        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)

    def test_identidad_viene_del_alta_de_django_no_del_cuerpo(self):
        self._postar(respuestas=self._aprobadas(), user_name='Impostor')

        calificacion = Calificacion.objects.get()
        # El nombre es el que RH escribio en /admin, no el que afirmo el
        # navegador. Antes esto se copiaba del cuerpo y asi un POST a mano
        # dejaba el nombre de otro en la nota que ve RH.
        self.assertEqual(calificacion.user_name, 'Ana Perez')
        self.assertEqual(calificacion.user_email, 'ana@ejemplo.co')

    def test_el_user_id_del_cuerpo_no_pisa_el_del_token(self):
        # `uid-otro` en el body era, antes, la fila donde se guardaba la nota.
        respuesta = self._postar(
            respuestas=self._aprobadas(), user_id='uid-otro',
        )

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(Calificacion.objects.get().user_id, 'uid-abc')
        self.assertFalse(Calificacion.objects.filter(user_id='uid-otro').exists())

    def test_correo_caido_no_tira_la_calificacion(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            respuesta = self._aprobar()

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertIn('smtp caido', respuesta.json()['notificacion_error'])
        # La nota quedo guardada igual: es lo que importa.
        self.assertTrue(Calificacion.objects.get().passed)

    # ── Endurecimiento: `passed` del cliente ya no alcanza ──────────────

    def test_sin_respuestas_no_aproba_aunque_diga_passed(self):
        # El agujero que se cerro: antes este POST aprobaba el curso,
        # disparaba el aviso a RH y liberaba el certificado sin abrir el quiz.
        respuesta = self._postar(score=5, percentage=100, passed=True)

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['data']['passed'])
        self.assertEqual(len(mail.outbox), 0)
        # La nota que vino si se guarda, para no perder datos del cliente.
        self.assertEqual(Calificacion.objects.get().score, 5)
        self.assertFalse(Calificacion.objects.get().passed)

    def test_sin_respuestas_no_degrada_un_que_ya_aprobo(self):
        # Un alumno con el bundle viejo cacheado repite la evaluación: si
        # `passed` bajara, perdería el certificado.
        self._aprobar()

        respuesta = self._postar(score=0, percentage=0, passed=False)

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()['data']['passed'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(Calificacion.objects.get().passed)

    def test_sin_respuestas_no_avisa_aunque_diga_passed(self):
        # El correo solo sale por la vía corregida. La nota sin respuestas queda
        # guardada pero no genera aviso.
        respuesta = self._postar(score=5, percentage=100, passed=True)

        self.assertFalse(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(
            Calificacion.objects.get(user_id='uid-abc').passed
        )

    def test_respuestas_de_un_curso_inexistente_no_aprueban(self):
        # Con respuestas la nota se corrige contra un curso real; un id que no
        # existe no puede convertirse en "aprobado" por el camino viejo.
        respuesta = self._postar(respuestas=self._aprobadas(), course_id='9999')

        self.assertEqual(respuesta.status_code, 404)
        self.assertEqual(Calificacion.objects.count(), 0)


class BackendQueExplota:
    """SMTP caido, para probar que la calificacion sobrevive."""

    def __init__(self, *args, **kwargs):
        pass

    def send_messages(self, messages):
        raise OSError('smtp caido')


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class CertificadoTest(ConSesion, TestCase):
    """El certificado se registra siempre; el aviso es lo que puede fallar.

    Y solo existe si hay una Calificacion aprobada para el par (user_id,
    course_id): la nota es la puerta, no el progreso de lecciones.

    `user_id` sale del token verificado, asi que los casos que antes cambiaban
    el `userId` del POST para estar "como otro alumno" ahora cambian la sesion
    con `self.sesion_de(...)`.
    """

    url = '/api/cursos/enviar-certificado/'
    pdf = b'%PDF-1.4 certificado de prueba'

    def setUp(self):
        super().setUp()
        # MEDIA_ROOT temporal: los tests escriben PDFs de verdad y no deben
        # ensuciar media/Certificados_Emitidos/ del proyecto.
        self.media = TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        self.override_media = override_settings(MEDIA_ROOT=self.media.name)
        self.override_media.enable()
        self.addCleanup(self.override_media.disable)

        self.calificacion = Calificacion.objects.create(
            user_id='uid-abc',
            user_name='Ana Perez',
            user_email='ana@ejemplo.co',
            course_id='1',
            course_name='Que es el autoglp',
            score=8, total_questions=10, percentage=80, passed=True,
        )

    def _otro_alumno(self):
        """Cambia la sesion a un segundo alumno, tambien dado de alta."""
        self.alumno_b = get_user_model().objects.create_user(
            username='b@ejemplo.co', email='b@ejemplo.co',
        )
        self.sesion_de('uid-z', 'b@ejemplo.co')
        return self.alumno_b

    def _emitir(self, **extra):
        datos = {
            'certificado': SimpleUploadedFile(
                'Certificado_Ana Perez.pdf', self.pdf, 'application/pdf'
            ),
            'nombreUsuario': 'Ana Perez',
            'emailUsuario': 'ana@ejemplo.co',
            'curso': 'Que es el autoglp',
            'userId': 'uid-abc',
            'courseId': '1',
        }
        datos.update(extra)
        return self.client.post(self.url, datos, **self.sesion.header())

    def _archivos_en_disco(self):
        carpeta = os.path.join(self.media.name, 'Certificados_Emitidos')
        return sorted(os.listdir(carpeta)) if os.path.isdir(carpeta) else []

    # --- La puerta: sin nota aprobada no hay certificado ------------------

    def test_sin_calificacion_no_registra_nada(self):
        # Un curso del que no hay nota: no hay de donde sacar el certificado.
        # Antes este caso se provocaba con un userId ajeno en el POST; ahora el
        # userId no se mira, asi que el curso es lo que tiene que faltar.
        respuesta = self._emitir(courseId='2')

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(Certificado.objects.count(), 0)
        self.assertEqual(self._archivos_en_disco(), [])

    def test_la_nota_de_otro_alumno_no_sirve(self):
        # El `userId: 'uid-otro'` que mandaba este test antes ya no alcanza:
        # la nota que habilita tiene que ser la de quien tiene el token.
        self._otro_alumno()

        respuesta = self._emitir(userId='uid-abc')

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(Certificado.objects.count(), 0)

    def test_calificacion_no_aprobada_no_registra(self):
        self.calificacion.passed = False
        self.calificacion.save()

        respuesta = self._emitir()

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(Certificado.objects.count(), 0)

    def test_cliente_viejo_sin_course_id_no_registra(self):
        # Sin courseId no hay forma de encontrar la Calificacion que habilita
        # el certificado: cae al slug del nombre de curso, que es texto libre
        # del cliente, y buscar por ahi seria adivinar.
        respuesta = self._emitir(courseId='')

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(Certificado.objects.count(), 0)

    # --- El token ---------------------------------------------------------

    def test_el_token_se_genera_y_no_cambia_al_reemitir(self):
        primera = self._emitir().json()['token']
        segunda = self._emitir().json()['token']

        self.assertTrue(primera)
        self.assertEqual(primera, segunda)
        self.assertEqual(Certificado.objects.get().token, primera)

    def test_el_token_es_distinto_por_usuario(self):
        self._otro_alumno()
        Calificacion.objects.create(
            user_id='uid-z', user_name='B', user_email='b@ejemplo.co',
            course_id='1', course_name='Que es el autoglp', passed=True,
        )

        self._emitir()

        self.sesion_de('uid-abc', 'ana@ejemplo.co')
        response = self._emitir()

        self.assertEqual(len(Certificado.objects.values_list('token', flat=True)), 2)
        self.assertNotEqual(
            Certificado.objects.get(user_id='uid-abc').token,
            Certificado.objects.get(user_id='uid-z').token,
        )
        self.assertTrue(response.json()['token'])

    def test_el_nombre_del_curso_lo_manda_la_calificacion(self):
        # El `curso` del POST es texto libre y es lo que va impreso en el
        # PDF: sin esto un certificado podía salir a nombre de otro curso.
        respuesta = self._emitir(curso='Curso Inventado')

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(
            Certificado.objects.get().course_name, 'Que es el autoglp',
        )

    # --- Avisos -----------------------------------------------------------

    def test_avisa_al_estudiante_y_a_los_internos_con_el_pdf_adjunto(self):
        respuesta = self._emitir()

        self.assertTrue(respuesta.json()['notificado'])
        self.assertTrue(respuesta.json()['correo_estudiante'])
        # Uno para el estudiante y otro para los internos: son dos readerships
        # y cada uno recibe lo suyo.
        self.assertEqual(len(mail.outbox), 2)

        al_estudiante, a_internos = mail.outbox

        # El estudiante va solo en `to`, y sin copia oculta: los internos
        # reciben el aviso de RH de abajo, asi que una copia oculta los
        # haria tener el certificado dos veces.
        self.assertEqual(al_estudiante.to, ['ana@ejemplo.co'])
        self.assertEqual(al_estudiante.bcc, [])

        self.assertEqual(a_internos.to, DESTINATARIOS)
        self.assertEqual(a_internos.bcc, [])

        # El PDF tiene que ir adjunto en los dos: el link del cuerpo del
        # aviso interno apunta a /admin, que exige is_staff, y los
        # destinatarios no lo son.
        for mensaje in (al_estudiante, a_internos):
            self.assertEqual(len(mensaje.attachments), 1)
            nombre, contenido, tipo = mensaje.attachments[0]
            self.assertEqual(contenido, self.pdf)
            self.assertEqual(tipo, 'application/pdf')
            self.assertTrue(nombre.endswith('.pdf'))

        # Cada cuerpo con lo suyo: el del estudiante no le manda el link al
        # panel, que no puede ver.
        self.assertIn('/admin/courses/certificado/', a_internos.body)
        # ...y al listado, no al detalle: la pagina de cambio esta cerrada.
        self.assertNotIn('/change/', a_internos.body)
        self.assertNotIn('/admin/', al_estudiante.body)
        self.assertIn('Ana Perez', al_estudiante.body)
        self.assertIn('Que es el autoglp', al_estudiante.body)

    def test_el_motivo_de_reemision_llega_a_los_dos(self):
        self._emitir()
        mail.outbox.clear()

        respuesta = self._emitir()

        self.assertEqual(respuesta.status_code, 200)
        self.assertFalse(respuesta.json()['primera_emision'])
        # Descargar el certificado es una accion explicita: cada vez que se
        # aprieta llega el aviso, no solo la primera.
        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 2)
        for mensaje in mail.outbox:
            self.assertIn('reemisión del certificado', mensaje.body)

        certificado = Certificado.objects.get()
        self.assertEqual(Certificado.objects.count(), 1)
        self.assertEqual(certificado.intentos, 2)
        # Sin archivos huerfanos: el nombre es determinista y el viejo se borra.
        self.assertEqual(self._archivos_en_disco(), ['Certificado_uid-abc_1.pdf'])

    def test_fila_sin_correo_usa_el_verificado_del_token(self):
        # Una Calificacion vieja sin correo: antes el certificado salia sin
        # correo y el alumno no recibia nada. Ahora cae al correo del token,
        # que siempre esta verificado, asi que el aviso igual llega.
        self.calificacion.user_email = ''
        self.calificacion.save()

        respuesta = self._emitir(emailUsuario='')

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['sin_correo'])
        self.assertTrue(respuesta.json()['correo_estudiante'])
        self.assertEqual(
            Certificado.objects.get().user_email, 'ana@ejemplo.co',
        )
        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ['ana@ejemplo.co'])
        self.assertEqual(mail.outbox[1].to, DESTINATARIOS)

    def test_smtp_caido_deja_la_fila_con_el_error(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            respuesta = self._emitir()

        # 201 y no 500: la emision ocurrio, solo fallo el aviso.
        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertFalse(respuesta.json()['correo_estudiante'])

        certificado = Certificado.objects.get()
        self.assertFalse(certificado.notificado)
        self.assertIn('smtp caido', certificado.notificacion_error)
        self.assertTrue(default_storage.exists(certificado.archivo))

    def test_reemision_tras_fallo_previo_si_reenvia(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            self._emitir()
        mail.outbox.clear()

        respuesta = self._emitir()

        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(Certificado.objects.get().intentos, 2)

    def test_sin_destinatarios_guarda_la_fila(self):
        # Sin internos el aviso interno no sale, pero el del estudiante si:
        # son envíos independientes. El PDF ya está en disco igual.
        with self.settings(NOTIF_DESTINATARIOS=[]):
            respuesta = self._emitir()

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertTrue(respuesta.json()['correo_estudiante'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['ana@ejemplo.co'])
        self.assertFalse(Certificado.objects.get().notificado)


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class DescargarCertificadoTest(TestCase):
    """La descarga del PDF guardado, con su token."""

    def setUp(self):
        self.media = TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        self.override_media = override_settings(MEDIA_ROOT=self.media.name)
        self.override_media.enable()
        self.addCleanup(self.override_media.disable)

        Calificacion.objects.create(
            user_id='uid-abc', user_name='Ana Perez', user_email='ana@ejemplo.co',
            course_id='1', course_name='Que es el autoglp', passed=True,
        )
        self.certificado = Certificado.objects.create(
            user_id='uid-abc', user_name='Ana Perez', user_email='ana@ejemplo.co',
            course_id='1', course_name='Que es el autoglp',
            archivo=default_storage.save(
                'Certificados_Emitidos/prueba.pdf',
                ContentFile(b'%PDF-1.4 de verdad'),
            ),
        )
        self.url = (
            f'/api/cursos/certificado/uid-abc/1/{self.certificado.token}/'
        )

    def test_descarga_el_pdf_con_el_token_correcto(self):
        respuesta = self.client.get(self.url)

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta['Content-Type'], 'application/pdf')
        self.assertIn('attachment', respuesta['Content-Disposition'])
        self.assertEqual(b''.join(respuesta.streaming_content), b'%PDF-1.4 de verdad')

    def test_token_incorrecto_da_404(self):
        # Sin esto, como la API no valida sesion, el que supiera el uid de
        # otro estudiante se bajaba su certificado.
        respuesta = self.client.get('/api/cursos/certificado/uid-abc/1/token-ajeno/')

        self.assertEqual(respuesta.status_code, 404)

    def test_certificado_de_otro_usuario_da_404(self):
        respuesta = self.client.get(
            f'/api/cursos/certificado/otro-uid/1/{self.certificado.token}/'
        )

        self.assertEqual(respuesta.status_code, 404)

    def test_sin_certificado_da_404(self):
        respuesta = self.client.get(
            '/api/cursos/certificado/uid-abc/99/cualquier-token/'
        )

        self.assertEqual(respuesta.status_code, 404)

    def test_archivo_borrado_del_disco_da_404(self):
        default_storage.delete(self.certificado.archivo)

        respuesta = self.client.get(self.url)

        self.assertEqual(respuesta.status_code, 404)
        self.assertIn('ya no esta', respuesta.json()['error'])

    def test_otro_metodo_da_405(self):
        self.assertEqual(self.client.post(self.url).status_code, 405)


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class CertificadoEnCalificacionesTest(ConSesion, TestCase):
    """Lo que la pagina de notas necesita para ofrecer la descarga."""

    def setUp(self):
        super().setUp()
        Calificacion.objects.create(
            user_id='uid-abc', course_id='1', course_name='Curso Con Nota',
            score=9, total_questions=10, percentage=90, passed=True,
        )
        Calificacion.objects.create(
            user_id='uid-abc', course_id='2', course_name='Curso Sin Nota',
            score=1, total_questions=10, percentage=10, passed=False,
        )

    def _notas(self, user_id='uid-abc'):
        respuesta = self.client.get(
            f'/api/cursos/calificaciones/{user_id}/', **self.sesion.header()
        )
        self.assertEqual(respuesta.status_code, 200)
        return {c['course_id']: c for c in respuesta.json()}

    def test_una_calificacion_sin_certificado_lo_dice(self):
        notas = self._notas()

        self.assertFalse(notas[1]['certificado']['emitido'])
        self.assertIsNone(notas[1]['certificado']['url'])

    def test_con_certificado_trae_el_token_y_la_url(self):
        certificado = Certificado.objects.create(
            user_id='uid-abc', course_id='1', course_name='Curso Con Nota',
            archivo='Certificados_Emitidos/x.pdf',
        )

        notas = self._notas()

        emitido = notas[1]['certificado']
        self.assertTrue(emitido['emitido'])
        self.assertEqual(emitido['token'], certificado.token)
        self.assertIn(certificado.token, emitido['url'])
        self.assertIn('uid-abc', emitido['url'])

    def test_no_trae_certificados_de_otros_usuarios(self):
        Certificado.objects.create(
            user_id='uid-otro', course_id='1', course_name='Ajeno',
            archivo='Certificados_Emitidos/ajeno.pdf',
        )

        notas = self._notas()

        # Existe un certificado para el curso 1, pero de otra persona: el
        # token de otro no se sirve en la lista de este.
        self.assertFalse(notas[1]['certificado']['emitido'])

    def test_el_user_id_de_la_url_no_abre_las_notas_de_otro(self):
        # El IDOR que se cerro con la sesion. Con el uid de otra persona en la
        # URL, lo que sale son SIEMPRE las notas de quien manda el token, y las
        # del otro no aparecen por ningun lado: ni sus notas ni el token de su
        # certificado, que es lo que abre la descarga del PDF.
        #
        # Ojo con la asercion: la lista no sale vacia, sale la de uno mismo. Un
        # `assertEqual(notas, {})` daria verde por el motivo equivocado y
        # dejaria pasar una vista que por un descuido devolviera cualquier cosa.
        Calificacion.objects.create(
            user_id='uid-otro', user_name='Otro', user_email='otro@ejemplo.co',
            course_id='9', course_name='Notas ajenas',
            percentage=100, passed=True,
        )
        Certificado.objects.create(
            user_id='uid-otro', course_id='9', course_name='Notas ajenas',
            archivo='Certificados_Emitidos/ajeno.pdf',
        )

        notas = self._notas(user_id='uid-otro')

        # Las dos de uid-abc, las del setUp. El curso 9 del otro no esta.
        self.assertEqual(set(notas), {1, 2})
        self.assertNotIn(9, notas)
        self.assertEqual({n['user_id'] for n in notas.values()}, {'uid-abc'})

    def test_course_id_numerico_sigue_siendo_numero(self):
        # El frontend compara el id de la nota contra el id del catalogo, y
        # en JavaScript '1' === 1 es false.
        self.assertIsInstance(self._notas()[1]['course_id'], int)


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class ReenviarAvisoAdminTest(TestCase):
    """La accion del panel reintenta los avisos que no salieron.

    Cubre los casos que el panel tiene que distinguir: ya notificado (no se
    toca), archivo borrado del disco (no se puede adjuntar nada) y falta de
    SMTP (se reintenta en otro momento).
    """

    pdf = b'%PDF-1.4 reenvio'

    def setUp(self):
        self.media = TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        self.override_media = override_settings(MEDIA_ROOT=self.media.name)
        self.override_media.enable()
        self.addCleanup(self.override_media.disable)

        Calificacion.objects.create(
            user_id='uid-abc', user_name='Ana Perez', user_email='ana@ejemplo.co',
            course_id='1', course_name='Que es el autoglp', passed=True,
        )
        # Sesion de RH: la accion es del admin, asi que hace falta un staff.
        self.admin = AdminUser.objects.create_superuser(
            'rh@megas.co', 'clave-de-prueba', 'RRHH',
        )
        self.client.force_login(self.admin)

    def _certificado(self, notificado=False, en_disco=True):
        # `archivo` es NOT NULL, asi que el caso "borrado del disco" se arma
        # guardando de verdad y despues borrando el archivo: es lo que pasa
        # cuando alguien limpia la carpeta de media a mano.
        ruta = default_storage.save(
            'Certificados_Emitidos/reenvio.pdf', ContentFile(self.pdf),
        )
        if not en_disco:
            default_storage.delete(ruta)
        return Certificado.objects.create(
            user_id='uid-abc', user_name='Ana Perez', user_email='ana@ejemplo.co',
            course_id='1', course_name='Que es el autoglp',
            archivo=ruta, notificado=notificado,
        )

    def _accion(self, queryset_id):
        return self.client.post(
            '/admin/courses/certificado/',
            {'action': 'reenviar_aviso', '_selected_action': [str(queryset_id)]},
            follow=True,
        )

    def test_reenvia_al_estudiante_y_a_los_internos(self):
        certificado = self._certificado()

        self._accion(certificado.id)

        certificado.refresh_from_db()
        self.assertTrue(certificado.notificado)
        self.assertEqual(certificado.intentos, 1)
        # Mismo contrato que la emision: dos mensajes, el del estudiante sin
        # copia oculta para que los internos no lo reciban dos veces.
        self.assertEqual(len(mail.outbox), 2)
        al_estudiante, a_internos = mail.outbox
        self.assertEqual(al_estudiante.to, ['ana@ejemplo.co'])
        self.assertEqual(al_estudiante.bcc, [])
        self.assertEqual(a_internos.to, DESTINATARIOS)
        for mensaje in (al_estudiante, a_internos):
            self.assertEqual(len(mensaje.attachments), 1)

    def test_no_reenvia_lo_que_ya_esta_notificado(self):
        # El aviso ya salio: mandarlo otra vez seria correo duplicado. Por eso
        # `intentos` tampoco se toca, que es lo que dice el registro.
        certificado = self._certificado(notificado=True)

        self._accion(certificado.id)

        certificado.refresh_from_db()
        self.assertEqual(certificado.intentos, 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_archivo_borrado_no_dispara_correo_ni_falla_el_admin(self):
        # Sin archivo no hay nada que adjuntar. El panel tiene que avisarlo
        # en vez de 누적arlos como errores de SMTP.
        certificado = self._certificado(en_disco=False)

        self._accion(certificado.id)

        certificado.refresh_from_db()
        self.assertFalse(certificado.notificado)
        self.assertIn('disco', certificado.notificacion_error)
        self.assertEqual(len(mail.outbox), 0)

    def test_smtp_caido_registra_el_error_y_no_levanta(self):
        certificado = self._certificado()

        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            self._accion(certificado.id)

        certificado.refresh_from_db()
        self.assertFalse(certificado.notificado)
        self.assertIn('smtp caido', certificado.notificacion_error)
        # El contador si sube: el intento se hizo, aunque el correo no saliera.
        self.assertEqual(certificado.intentos, 1)


class CertificadoAdminSinAccesoAlPdfTest(TestCase):
    """El admin cuenta certificados por alumno, pero no deja abrirlos ni bajarlos.

    Antes la fila linkeaba a la pagina de cambio y ahi colgaba un enlace
    "Descargar PDF" armado con `reverse` y `format_html` que nunca se
    importaron: abrir un certificado tiraba NameError. Ahora RH ve el listado
    con el conteo por alumno y nada mas.
    """

    def setUp(self):
        self.admin = AdminUser.objects.create_superuser(
            'rh@megas.co', 'clave-de-prueba', 'RRHH',
        )
        self.client.force_login(self.admin)
        for course_id in ('1', '2'):
            Certificado.objects.create(
                user_id='uid-ana', user_name='Ana Perez',
                user_email='ana@ejemplo.co', course_id=course_id,
                course_name=f'Curso {course_id}',
                archivo=f'Certificados_Emitidos/ana-{course_id}.pdf',
            )
        Certificado.objects.create(
            user_id='uid-beto', user_name='Beto Diaz',
            user_email='beto@ejemplo.co', course_id='1',
            course_name='Curso 1', archivo='Certificados_Emitidos/beto.pdf',
        )

    def test_el_listado_cuenta_los_certificados_de_cada_alumno(self):
        respuesta = self.client.get('/admin/courses/certificado/')

        self.assertEqual(respuesta.status_code, 200)
        # El conteo es por alumno, no por fila: Ana tiene dos y Beto uno.
        contados = {
            fila.user_email: fila.total_del_usuario
            for fila in respuesta.context['cl'].result_list
        }
        self.assertEqual(contados['ana@ejemplo.co'], 2)
        self.assertEqual(contados['beto@ejemplo.co'], 1)

    def test_el_detalle_no_se_abre(self):
        certificado = Certificado.objects.first()

        respuesta = self.client.get(
            f'/admin/courses/certificado/{certificado.id}/change/'
        )

        self.assertEqual(respuesta.status_code, 302)
        self.assertEqual(respuesta.url, '/admin/courses/certificado/')

    def test_el_listado_no_ofrece_ni_el_detalle_ni_la_descarga(self):
        certificado = Certificado.objects.first()

        contenido = self.client.get('/admin/courses/certificado/').content.decode()

        self.assertNotIn('Descargar PDF', contenido)
        self.assertNotIn(
            f'/admin/courses/certificado/{certificado.id}/change/', contenido,
        )

    def test_el_pie_no_repite_el_total_de_certificados(self):
        # Con una sola pagina el paginador del admin solo servia para imprimir
        # "7 Certificados". Ese total es ruido: el conteo que importa es el de
        # la columna por alumno.
        contenido = self.client.get('/admin/courses/certificado/').content.decode()

        self.assertNotIn('changelist-footer', contenido)

    def test_el_pie_sigue_intacto_en_los_demas_listados(self):
        # El override de la plantilla es del changelist de Certificado y de
        # ningun otro: un cambio de mas aca sacaria el paginador de toda la app.
        contenido = self.client.get('/admin/courses/calificacion/').content.decode()

        self.assertIn('changelist-footer', contenido)

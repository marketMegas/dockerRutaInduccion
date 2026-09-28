import json
import os
from tempfile import TemporaryDirectory

from django.core import mail
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .models import Calificacion, Certificado

DESTINATARIOS = ['interno@megas.co']


@override_settings(
    NOTIF_DESTINATARIOS=DESTINATARIOS,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class NotificacionAprobacionTest(TestCase):
    """El aviso sale solo en la primera transicion de reprobar a aprobar."""

    url = '/api/cursos/calificaciones/'

    def _postar(self, **extra):
        payload = {
            'user_id': 'uid-abc',
            'user_name': 'Ana Perez',
            'user_email': 'ana@ejemplo.co',
            'course_id': '1',
            'course_name': 'Que es el autoglp',
            'score': 0,
            'total_questions': 5,
            'percentage': 0,
            'passed': False,
        }
        payload.update(extra)
        return self.client.post(
            self.url,
            data=json.dumps(payload),
            content_type='application/json',
        )

    def test_reprobar_no_notifica_pero_si_guarda(self):
        respuesta = self._postar(score=2, percentage=40)

        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertFalse(Calificacion.objects.get().passed)

    def test_primera_aprobacion_notifica_a_internos(self):
        respuesta = self._postar(score=5, percentage=100, passed=True)

        self.assertEqual(respuesta.status_code, 201)
        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, DESTINATARIOS)
        # El aviso va a los internos, no al usuario que aprobo.
        self.assertNotIn('ana@ejemplo.co', mail.outbox[0].to)

        cuerpo = mail.outbox[0].body
        self.assertIn('Ana Perez', cuerpo)
        self.assertIn('Que es el autoglp', cuerpo)

    def test_repetir_aprobacion_no_reenvia(self):
        self._postar(score=5, percentage=100, passed=True)
        mail.outbox.clear()

        respuesta = self._postar(score=5, percentage=100, passed=True)

        self.assertEqual(respuesta.status_code, 200)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Calificacion.objects.count(), 1)

    def test_aprobar_despues_de_reprobar_sigue_notificando(self):
        self._postar(score=2, percentage=40)
        mail.outbox.clear()

        respuesta = self._postar(score=5, percentage=100, passed=True)

        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)

    def test_identidad_queda_guardada(self):
        self._postar(score=5, percentage=100, passed=True)

        calificacion = Calificacion.objects.get()
        self.assertEqual(calificacion.user_name, 'Ana Perez')
        self.assertEqual(calificacion.user_email, 'ana@ejemplo.co')

    def test_cliente_sin_identidad_no_borra_la_que_habia(self):
        self._postar(score=5, percentage=100, passed=True)

        # Cliente viejo que no manda user_name ni user_email.
        self._postar(score=4, percentage=80, passed=False, user_name='', user_email='')

        calificacion = Calificacion.objects.get()
        self.assertEqual(calificacion.user_name, 'Ana Perez')
        self.assertEqual(calificacion.user_email, 'ana@ejemplo.co')

    def test_correo_caido_no_tira_la_calificacion(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            respuesta = self._postar(score=5, percentage=100, passed=True)

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertIn('smtp caido', respuesta.json()['notificacion_error'])
        # La nota quedo guardada igual: es lo que importa.
        self.assertTrue(Calificacion.objects.get().passed)


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
class CertificadoTest(TestCase):
    """El certificado se registra siempre; el aviso es lo que puede fallar."""

    url = '/api/cursos/enviar-certificado/'
    pdf = b'%PDF-1.4 certificado de prueba'

    def setUp(self):
        # MEDIA_ROOT temporal: los tests escriben PDFs de verdad y no deben
        # ensuciar media/Certificados_Emitidos/ del proyecto.
        self.media = TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        self.override_media = override_settings(MEDIA_ROOT=self.media.name)
        self.override_media.enable()
        self.addCleanup(self.override_media.disable)

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
        return self.client.post(self.url, datos)

    def _archivos_en_disco(self):
        carpeta = os.path.join(self.media.name, 'Certificados_Emitidos')
        return sorted(os.listdir(carpeta)) if os.path.isdir(carpeta) else []

    def test_emision_guarda_archivo_y_registra_la_fila(self):
        respuesta = self._emitir()

        self.assertEqual(respuesta.status_code, 201)
        self.assertTrue(respuesta.json()['primera_emision'])

        certificado = Certificado.objects.get()
        self.assertEqual(certificado.user_id, 'uid-abc')
        self.assertEqual(certificado.user_email, 'ana@ejemplo.co')
        self.assertEqual(certificado.course_id, '1')
        self.assertEqual(certificado.intentos, 1)
        self.assertTrue(default_storage.exists(certificado.archivo))
        with default_storage.open(certificado.archivo) as f:
            self.assertEqual(f.read(), self.pdf)

    def test_aviso_solo_a_internos_con_el_pdf_adjunto(self):
        respuesta = self._emitir()

        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, DESTINATARIOS)
        self.assertNotIn('ana@ejemplo.co', mail.outbox[0].to)

        # El PDF tiene que ir adjunto: el link del cuerpo apunta a /admin, que
        # exige is_staff, y los destinatarios del aviso no lo son.
        self.assertEqual(len(mail.outbox[0].attachments), 1)
        nombre, contenido, tipo = mail.outbox[0].attachments[0]
        self.assertEqual(contenido, self.pdf)
        self.assertEqual(tipo, 'application/pdf')
        self.assertTrue(nombre.endswith('.pdf'))

        cuerpo = mail.outbox[0].body
        self.assertIn('Ana Perez', cuerpo)
        self.assertIn('Que es el autoglp', cuerpo)
        self.assertIn('/admin/courses/certificado/', cuerpo)

    def test_smtp_caido_deja_la_fila_con_el_error(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            respuesta = self._emitir()

        # 201 y no 500: la emision ocurrio, solo fallo el aviso.
        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])

        certificado = Certificado.objects.get()
        self.assertFalse(certificado.notificado)
        self.assertIn('smtp caido', certificado.notificacion_error)
        self.assertTrue(default_storage.exists(certificado.archivo))

    def test_reemision_actualiza_la_fila_y_vuelve_a_avisar(self):
        self._emitir()
        mail.outbox.clear()

        respuesta = self._emitir()

        self.assertEqual(respuesta.status_code, 200)
        self.assertFalse(respuesta.json()['primera_emision'])
        # Finalizar Curso es una accion explicita: cada vez que se aprieta
        # llega el aviso, no solo la primera.
        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('reemisión del certificado', mail.outbox[0].body)

        certificado = Certificado.objects.get()
        self.assertEqual(Certificado.objects.count(), 1)
        self.assertEqual(certificado.intentos, 2)
        # Sin archivos huerfanos: el nombre es determinista y el viejo se borra.
        self.assertEqual(self._archivos_en_disco(), ['Certificado_uid-abc_1.pdf'])

    def test_reemision_tras_fallo_previo_si_reenvia(self):
        with self.settings(EMAIL_BACKEND='courses.tests.BackendQueExplota'):
            self._emitir()
        mail.outbox.clear()

        respuesta = self._emitir()

        self.assertTrue(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(Certificado.objects.get().intentos, 2)

    def test_cliente_viejo_sin_user_id_no_rompe(self):
        # Sin los campos userId y courseId que ahora manda el frontend.
        respuesta = self._emitir(userId='', courseId='')

        self.assertEqual(respuesta.status_code, 201)
        certificado = Certificado.objects.get()
        # Cae al correo como clave, para que no colapse con otras emisiones.
        self.assertEqual(certificado.user_id, 'ana@ejemplo.co')
        self.assertEqual(certificado.course_id, 'que-es-el-autoglp')
        self.assertTrue(certificado.notificado)

    def test_sin_destinatarios_guarda_la_fila(self):
        with self.settings(NOTIF_DESTINATARIOS=[]):
            respuesta = self._emitir()

        self.assertEqual(respuesta.status_code, 201)
        self.assertFalse(respuesta.json()['notificado'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(Certificado.objects.get().notificado)

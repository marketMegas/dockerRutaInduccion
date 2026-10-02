"""La puerta: quien puede hacer el curso y quien no.

Dos mitades y el empalme entre las dos. Lo que se prueba aca es que:

- La IDENTIDAD sale del token verificado, no del cuerpo de la peticion.
- La AUTORIZACION es la lista de User de Django, que es la de
  /admin > Authentication and Authorization > Users.
- Un token que no verifica NO es lo mismo que un token que verifica y no
  encuentra alta (401 contra 403), y un fallo de Google tampoco (503).

El ultimo punto es el que mas se olvida y el que mas caro sale: si Google se
cae y el backend contesta 401, todos los estudiantes ven "sesion invalida" a
la vez y parece un despliegue roto.
"""

import json
from tempfile import TemporaryDirectory
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.test import TestCase, override_settings

from courses.models import Calificacion, Certificado, UserProgress
from usuarios import firebase
from usuarios.permisos import MENSAJE_SIN_ALTA, usuario_autorizado
from usuarios.testing import ConSesion, firebase_caido, token_invalido

User = get_user_model()


def _json(valor):
    return json.dumps(valor)


def _value_error(*args, **kwargs):
    raise ValueError('Token used too late or too early')


def _transport_error(*args, **kwargs):
    raise firebase.google_exceptions.TransportError('no se pudo')


# ── Verificacion del token ──────────────────────────────────────────

class VerificarTokenTest(TestCase):
    """El envuelto de google-auth, que es donde se decide 401 contra 503."""

    def _verify(self, funcion, token='token-de-prueba'):
        """Ejercita `verificar_token_firebase` con google-auth parcheado.

        Se parchea la descarga de certificados y la decodificacion: lo que
        queda sin tocar (falta de configuracion, token vacio, claims sin `sub`,
        reintento por rotacion de llaves) es codigo propio y si se ejecuta de
        verdad, que es lo que interesa.
        """
        with self.settings(FIREBASE_PROJECT_ID='plataforma-gmax'):
            with mock.patch.object(
                firebase, '_certificados', return_value={'llave': 'certificado'}
            ) as certs, mock.patch.object(firebase.google_jwt, 'decode', funcion):
                return firebase.verificar_token_firebase(token), certs

    def test_un_token_valido_devuelve_los_claims(self):
        claims, _ = self._verify(
            lambda *a, **k: {'sub': 'uid-1', 'email': 'a@b.co'}
        )

        self.assertEqual(claims['sub'], 'uid-1')

    def test_se_verifica_contra_el_project_id_configurado(self):
        # El `aud` del token tiene que coincidir con el projectId del backend.
        # Si los dos lados no coinciden, Google no tiene con que emitir un token
        # que este backend pueda verificar nunca.
        with self.settings(FIREBASE_PROJECT_ID='plataforma-gmax'):
            with mock.patch.object(
                firebase, '_certificados', return_value={'llave': 'certificado'}
            ), mock.patch.object(firebase.google_jwt, 'decode') as decode:
                firebase.verificar_token_firebase('token-de-prueba')

        self.assertEqual(decode.call_args.kwargs['audience'], 'plataforma-gmax')

    def test_token_que_google_rechaza_es_token_invalido(self):
        # ValueError es lo que google_jwt.decode levanta para firma mala,
        # expirado o `aud` de otro proyecto. Los tres son culpa del cliente.
        with self.assertRaises(firebase.TokenInvalido):
            self._verify(_value_error, 'lo-que-sea')

    def test_llave_nueva_reintenta_con_certificados_frescos(self):
        # Google rota las llaves de firma. Un token firmado con la llave que
        # todavia no esta en el cache NO es invalido: se reintenta contra
        # certificados frescos. Sin esto, una sesion legitima queda afuera hasta
        # que venciera el TTL, y el error era indistinguible del de firma rota.
        llamadas = []

        def decode(*args, **kwargs):
            llamadas.append(kwargs['certs'])
            if len(llamadas) == 1:
                raise ValueError('Certificate for key id abc not found.')
            return {'sub': 'uid-1', 'email': 'a@b.co'}

        with self.settings(FIREBASE_PROJECT_ID='plataforma-gmax'):
            respuesta = mock.Mock(status=200, data=b'{"nueva": "certificado"}')
            with mock.patch.object(
                firebase, '_red', return_value=lambda *a, **k: respuesta
            ) as red, mock.patch.object(firebase.google_jwt, 'decode', decode):
                firebase._certs['valor'] = {'vieja': 'certificado'}
                firebase._certs['vence'] = 9e18  # cache todavia vigente
                claims = firebase.verificar_token_firebase('token-de-prueba')

        self.assertEqual(claims['sub'], 'uid-1')
        self.assertEqual(len(llamadas), 2, 'debe reintentar una vez')
        # El reintento tiene que haber bajado los certificados de verdad.
        self.assertTrue(red.called, 'el reintento debe refrescar los certificados')

    def test_llave_nueva_que_no_aparece_reintenta_y_falla_una_sola_vez(self):
        def llave_que_no_existe(*args, **kwargs):
            raise ValueError('Certificate for key id x not found.')

        with self.assertRaises(firebase.TokenInvalido):
            with mock.patch.object(
                firebase, '_certificados', return_value={'llave': 'certificado'}
            ) as certs, mock.patch.object(
                firebase.google_jwt, 'decode', llave_que_no_existe,
            ):
                firebase.verificar_token_firebase('lo-que-sea')

        # Un solo reintento: si la llave no esta ni en el set fresco, no hay que
        # seguir insistiendo con la red.
        self.assertEqual(certs.call_count, 2)

    def test_certificates_se_bajan_del_endpoint_de_firebase(self):
        # Este es el bug exacto que dejo a toda la gente afuera: las llaves de
        # Firebase viven en el endpoint de securetoken, NO en `oauth2/v1/certs`
        # que consulta `id_token.verify_oauth2_token`.
        self.assertIn(
            'securetoken@system.gserviceaccount.com',
            firebase._CERTS_DE_FIREBASE,
        )
        self.assertNotIn('oauth2/v1/certs', firebase._CERTS_DE_FIREBASE)

    def test_sin_token_es_token_invalido(self):
        with self.assertRaises(firebase.TokenInvalido):
            self._verify(lambda *a, **k: {}, '')

    def test_token_sin_sub_es_token_invalido(self):
        # Seria raro, pero un claims sin `sub` no dice de quien es la nota, y
        # sin uid no hay nada que guardar.
        with self.assertRaises(firebase.TokenInvalido):
            self._verify(lambda *a, **k: {'email': 'a@b.co'})

    def test_red_caida_no_es_token_invalido(self):
        # Esto es lo que evita que un mal dia de Google cierre la sesion de
        # todos los estudiantes a la vez.
        with self.assertRaises(firebase.FirebaseNoDisponible):
            with mock.patch.object(firebase, '_red', side_effect=_transport_error):
                firebase._certs['valor'] = None
                firebase.verificar_token_firebase('lo-que-sea')

    def test_google_que_responde_distinto_de_200_no_es_token_invalido(self):
        respuesta = mock.Mock(status=503, data=b'')
        with self.assertRaises(firebase.FirebaseNoDisponible):
            with mock.patch.object(firebase, '_red', return_value=lambda *a, **k: respuesta):
                firebase._certs['valor'] = None
                firebase.verificar_token_firebase('lo-que-sea')

    def test_certificados_se_cachean_entre_llamadas(self):
        # Sin cache, cada peticion de la API seria un ida y vuelta a Google.
        respuesta = mock.Mock(status=200, data=b'{"llave": "certificado"}')
        with mock.patch.object(firebase, '_red', return_value=lambda *a, **k: respuesta) as red:
            firebase._certs['valor'] = None
            firebase._certs['vence'] = 0
            firebase._certificados()
            firebase._certificados()

            self.assertEqual(red.call_count, 1)

            firebase._certificados(forzar=True)
            self.assertEqual(red.call_count, 2)

    def test_sin_firebase_project_id_no_se_puede_verificar(self):
        # Sin la variable no hay contra que auditar. Un 401 aco diria "sesion
        # invalida" cuando el problema es de configuracion del servidor.
        with self.settings(FIREBASE_PROJECT_ID=''):
            with self.assertRaises(firebase.FirebaseNoDisponible):
                firebase.verificar_token_firebase('lo-que-sea')


# ── La lista de Django ──────────────────────────────────────────────

class UsuarioAutorizadoTest(TestCase):
    """Como se decide que un correo esta dado de alta."""

    def setUp(self):
        self.alta = User.objects.create_user(
            username='ana', email='Ana.Perez@Ejemplo.co',
        )

    def test_encuentra_por_correo_sin_importar_mayusculas(self):
        # El corrector de mayusculas del navegador y el teclado del usuario
        # producen 'Ana.Perez@ejemplo.co' y 'ana.perez@ejemplo.co'. Que el
        # alta funcione para las dos es lo que evita que un alumno que SI esta
        # en la lista se quede afuera por una mayuscula.
        self.assertEqual(usuario_autorizado('ana.perez@ejemplo.co'), self.alta)
        self.assertEqual(usuario_autorizado('ANA.PEREZ@EJEMPLO.CO'), self.alta)

    def test_un_correo_que_no_esta_dado_de_alta_no_entra(self):
        self.assertIsNone(usuario_autorizado('nadie@ejemplo.co'))

    def test_correo_vacio_no_encuentra_a_nadie(self):
        self.assertIsNone(usuario_autorizado(''))
        self.assertIsNone(usuario_autorizado(None))

    def test_usuario_desactivado_no_entra(self):
        # `is_active` es el interruptor de baja: desactivar en /admin saca de
        # la plataforma sin borrar las notas ni los certificados.
        self.alta.is_active = False
        self.alta.save()

        self.assertIsNone(usuario_autorizado('ana.perez@ejemplo.co'))

    def test_se_busca_por_email_y_no_por_username(self):
        # El `username` de Django es obligatorio y RH lo deja en cualquier
        # cosa ('ana', 'prueba28'); el `email` es donde va el correo del
        # alumno. Buscar por username seria buscar por un valor que nadie
        # conoce y que ademas no esta garantizado.
        self.assertEqual(self.alta.username, 'ana')

        self.assertEqual(usuario_autorizado(self.alta.email), self.alta)
        # Y pasar el username no encuentra a nadie.
        self.assertIsNone(usuario_autorizado(self.alta.username))

    def test_is_staff_no_cambia_nada(self):
        # Un administrador de Django tiene su propio panel en /admin. Que sea
        # staff no lo convierte en alumno: la lista no mira ese campo.
        self.alta.is_staff = True
        self.alta.save()

        self.assertEqual(usuario_autorizado('ana.perez@ejemplo.co'), self.alta)


# ── La puerta, de punta a punta ─────────────────────────────────────

class VerificarAccesoTest(ConSesion, TestCase):
    """POST /api/auth/verificar/: la consulta que hace ProtectedRoute."""

    url = '/api/auth/verificar/'

    def _post(self):
        return self.client.post(self.url, **self.sesion.header())

    def test_un_alumno_dado_de_alta_entra(self):
        respuesta = self._post()

        self.assertEqual(respuesta.status_code, 200)
        cuerpo = respuesta.json()
        self.assertTrue(cuerpo['autorizado'])
        # El uid es el del token, no el de Django: las notas y el progreso
        # estan guardados con el uid de Firebase y por eso no hubo que migrar
        # nada al cerrar la API.
        self.assertEqual(cuerpo['uid'], 'uid-abc')
        self.assertEqual(cuerpo['email'], 'ana@ejemplo.co')
        # Y el nombre sale del alta de RH, no del displayName de Firebase.
        self.assertEqual(cuerpo['nombre'], 'Ana Perez')

    def test_sin_sesion_es_401(self):
        self.sin_sesion()

        respuesta = self._post()

        self.assertEqual(respuesta.status_code, 401)
        self.assertEqual(respuesta.json()['codigo'], 'token_invalido')

    def test_token_invalido_es_401(self):
        with token_invalido():
            respuesta = self._post()

        self.assertEqual(respuesta.status_code, 401)

    def test_google_caido_es_503_y_no_401(self):
        # Un 401 aco le diria al navegador "cerra sesion" a todos los
        # estudiantes, cuando el problema es del servidor y se resuelve solo.
        with firebase_caido():
            respuesta = self._post()

        self.assertEqual(respuesta.status_code, 503)
        self.assertEqual(respuesta.json()['codigo'], 'auth_no_disponible')

    def test_un_correo_sin_alta_es_403(self):
        # Firebase OK y sesion valida, pero el correo no esta en la lista de
        # Django: no entra, y tampoco se le dice que su sesion es falsa.
        self.alumno.delete()

        respuesta = self._post()

        self.assertEqual(respuesta.status_code, 403)
        cuerpo = respuesta.json()
        self.assertFalse(cuerpo['autorizado'])
        self.assertEqual(cuerpo['codigo'], 'sin_alta')
        # El mensaje es el mismo que arma `permisos`, no una copia.
        self.assertEqual(cuerpo['error'], MENSAJE_SIN_ALTA)
        self.assertIn('Recursos Humanos', cuerpo['error'])

    def test_usuario_desactivado_es_403(self):
        self.alumno.is_active = False
        self.alumno.save()

        respuesta = self._post()

        self.assertEqual(respuesta.status_code, 403)
        self.assertEqual(respuesta.json()['codigo'], 'sin_alta')

    def test_no_devuelve_nada_del_user_de_django(self):
        # La pantalla de acceso restringido solo necesita un mensaje. No hay
        # por que devolverle el username interno ni el is_staff.
        cuerpo = self._post().json()

        self.assertEqual(set(cuerpo), {'autorizado', 'uid', 'email', 'nombre'})

    def test_solo_post(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)


class CorreoAutorizadoTest(TestCase):
    """POST /api/auth/correo-autorizado/: la consulta de la pantalla de alta.

    Sin sesion todavia, asi que es publica, y tiene que serlo: es la que
    responde antes de que exista la cuenta en Firebase.

    Es el endpoint que cierra el robo de identidad. Como la lista blanca se
    busca por correo, dejar el alta libre en Firebase significaba que cualquiera
    podia abrirse una cuenta con el correo de un alumno ya dado de alta y
    entrar como el. Consulta atras, el enlace correo -> persona lo hace Django.
    """

    url = '/api/auth/correo-autorizado/'

    def _preguntar(self, email):
        return self.client.post(
            self.url, data=_json({'email': email}),
            content_type='application/json',
        )

    def test_un_correo_dado_de_alta_puede_registrarse(self):
        User.objects.create_user(username='ana', email='ana@ejemplo.co')

        respuesta = self._preguntar('ana@ejemplo.co')

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()['autorizado'])

    def test_un_correo_sin_alta_no_puede_registrarse(self):
        self.assertFalse(
            self._preguntar('nadie@ejemplo.co').json()['autorizado']
        )

    def test_usuario_desactivado_no_puede_registrarse(self):
        User.objects.create_user(
            username='ana', email='ana@ejemplo.co', is_active=False,
        )

        self.assertFalse(
            self._preguntar('ana@ejemplo.co').json()['autorizado']
        )

    def test_es_un_si_o_un_no_y_nada_mas(self):
        # No devuelve ni nombre ni username: aunque alguien lo consulte en
        # bucle para averiguar a quien dan de alta, no le sirve de mucho.
        User.objects.create_user(
            username='ana', email='ana@ejemplo.co', is_staff=True,
        )

        cuerpo = self._preguntar('ana@ejemplo.co').json()

        self.assertEqual(cuerpo, {'autorizado': True})

    def test_correo_incompleto_es_400(self):
        for correo in ('', 'sin-arroba', None):
            self.assertEqual(self._preguntar(correo).status_code, 400)

    def test_json_invalido_es_400(self):
        respuesta = self.client.post(
            self.url, data='{no es json', content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 400)

    def test_solo_post(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)


# ── Las vistas de la API ────────────────────────────────────────────

class VistasCerradasTest(ConSesion, TestCase):
    """Ninguna de estas se puede usar sin sesion.

    Antes de este cambio no habia ni un 401 en toda la API: con curl cualquiera
    pedia el catalogo, se bajaba las notas de otro y le escribia su progreso.
    """

    def test_el_catalogo_no_se_sin_sesion(self):
        self.sin_sesion()

        self.assertEqual(self.client.get('/api/cursos/').status_code, 401)

    def test_el_detalle_de_un_curso_no_es_sin_sesion(self):
        self.sin_sesion()

        self.assertEqual(self.client.get('/api/cursos/1/').status_code, 401)

    def test_el_banco_de_preguntas_no_es_sin_sesion(self):
        # Por aca se sale la respuesta correcta de la evaluacion.
        self.sin_sesion()

        self.assertEqual(
            self.client.get('/api/cursos/evaluaciones/1/').status_code, 401
        )

    def test_el_progreso_de_otro_no_es_sin_sesion(self):
        self.sin_sesion()

        self.assertEqual(
            self.client.get('/api/cursos/progreso/uid-otro/').status_code, 401
        )

    def test_las_notas_de_otro_no_son_sin_sesion(self):
        Calificacion.objects.create(
            user_id='uid-otro', course_id='1', course_name='Ajenas',
            percentage=100, passed=True,
        )
        self.sin_sesion()

        self.assertEqual(
            self.client.get('/api/cursos/calificaciones/uid-otro/').status_code,
            401,
        )

    def test_sin_sesion_no_se_escribe_progreso(self):
        self.sin_sesion()

        respuesta = self.client.post(
            '/api/cursos/progreso/',
            data=_json({
                'user_id': 'uid-otro', 'course_id': '1', 'lesson_id': '1',
            }),
            content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 401)
        # Y no se escribio nada: ni para el propio uid del token ni para el
        # `user_id` que vino en el cuerpo.
        self.assertFalse(UserProgress.objects.exists())

    def test_sin_sesion_no_se_guarda_la_nota(self):
        self.sin_sesion()

        respuesta = self.client.post(
            '/api/cursos/calificaciones/',
            data=_json({
                'user_id': 'uid-otro', 'course_id': '1',
                'course_name': 'Ajenas', 'percentage': 100, 'passed': True,
            }),
            content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 401)
        self.assertFalse(Calificacion.objects.exists())

    def test_sin_sesion_no_se_emite_certificado(self):
        # Sin sesion esto deberia ser 400 (falta el PDF) si la puerta no
        # cortara antes: el 401 es la prueba de que corto.
        self.sin_sesion()

        respuesta = self.client.post('/api/cursos/enviar-certificado/')

        self.assertEqual(respuesta.status_code, 401)
        self.assertFalse(Certificado.objects.exists())

    def test_un_metodo_equivocado_es_405_y_no_401(self):
        # Primero el metodo, despues la sesion. Al reves, un GET a un endpoint
        # de POST de una sesion valida se veria como "sesion invalida".
        respuesta = self.client.get(
            '/api/cursos/progreso/', **self.sesion.header()
        )

        self.assertEqual(respuesta.status_code, 405)


class SinAltaEnLaApiTest(ConSesion, TestCase):
    """Sesion de Firebase valida y sin alta: la API responde 403, no 401.

    La diferencia importa para el frontend: un 401 lo hace reintentar con un
    token nuevo y, si sigue, cerrar la sesion. Un 403 no: la sesion esta bien,
    lo que falta es el alta, asi que la pantalla correcta es la de acceso
    restringido y el alumno sigue con su sesion abierta.
    """

    def setUp(self):
        super().setUp()
        self.alumno.delete()

    def test_el_catalogo_es_403(self):
        respuesta = self.get('/api/cursos/')

        self.assertEqual(respuesta.status_code, 403)
        self.assertEqual(respuesta.json()['codigo'], 'sin_alta')

    def test_las_notas_son_403(self):
        respuesta = self.get('/api/cursos/calificaciones/uid-abc/')

        self.assertEqual(respuesta.status_code, 403)

    def test_el_progreso_es_403(self):
        respuesta = self.get('/api/cursos/progreso/uid-abc/')

        self.assertEqual(respuesta.status_code, 403)

    def test_guardar_el_progreso_es_403(self):
        respuesta = self.post(
            '/api/cursos/progreso/',
            data=_json({'course_id': '1', 'lesson_id': '1'}),
            content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 403)
        self.assertFalse(UserProgress.objects.exists())

    def test_entregar_una_evaluacion_es_403(self):
        respuesta = self.post(
            '/api/cursos/evaluaciones/1/entregar/',
            data=_json({'respuestas': {}}),
            content_type='application/json',
        )

        self.assertEqual(respuesta.status_code, 403)


class AdminSinResumenDeHashTest(TestCase):
    """El campo de contrasena del admin no debe mostrar el resumen del hash.

    Django lo trae por defecto ("algorithm: pbkdf2_sha256 / iterations: ... /
    salt: ... / hash: ...") y eso no tiene por que quedar a la vista en una
    plataforma donde la autenticacion la maneja Firebase.
    """

    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='jefa', email='jefa@ejemplo.co', password='ClaveDePrueba123',
        )
        self.alumno = User.objects.create_user(
            username='alumno', email='alumno@ejemplo.co', password='OtraClave123',
        )
        self.client.force_login(self.admin)

    def _cambio(self):
        return self.client.get(f'/admin/auth/user/{self.alumno.pk}/change/')

    def test_no_expone_el_resumen_del_hash(self):
        contenido = self._cambio().content.decode()

        self.assertNotIn('algorithm', contenido)
        self.assertNotIn('pbkdf2_sha256', contenido)
        self.assertNotIn('iterations', contenido)

    def test_conserva_el_boton_para_restablecer_la_contrasena(self):
        # Se quita el resumen, no la capacidad de administrar la contrasena.
        self.assertContains(self._cambio(), 'Reset password')

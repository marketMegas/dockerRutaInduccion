"""Verificacion del ID token de Firebase.

Firebase no es un servidor de autorizacion propio: sus ID tokens son JWT
firmados por Google, con `aud` igual al projectId. Eso los hace verificables
aca con google-auth, que ya estaba en requirements.txt. La firma es lo que
aporta la garantia: el `sub` (uid) y el `email` salen del token ya validado,
nunca del cuerpo de la peticion.

O sea: Firebase sigue probando QUIEN es la persona (email + contrasena, como
siempre), y Django decide QUIEN PUEDE, contra su propia lista de
`django.contrib.auth.User`. Las dos mitades se unen aca.

OJO con el endpoint de certificados, que es la trampa de esta integracion. Los
ID tokens de Firebase los firma la clave de servicio
`securetoken@system.gserviceaccount.com`, y sus llaves publicas viven en una URL
propia. `id_token.verify_oauth2_token` consulta otra (`oauth2/v1/certs`), la del
login con Google de accounts.google.com, donde las llaves de Firebase no
aparecen: esa funcion esta pensada para el login de Google, no para Firebase.
Con ella, TODOS los tokens de Firebase se rechazan con

    Certificate for key id <kid> not found.

aunque la sesion sea perfectamente valida, y el backend responde 401 a todo el
mundo sin dar ninguna pista. Por eso los certificados se leen del endpoint de
securetoken y la verificacion se hace con `google.auth.jwt.decode`, que es la
misma combinacion que usa firebase-admin: firma, `exp` y `aud` contra el
projectId.
"""

import json
import time

from django.conf import settings
from google.auth import exceptions as google_exceptions
from google.auth import jwt as google_jwt
from google.auth.transport import requests as google_requests
from requests.exceptions import RequestException


class TokenInvalido(Exception):
    """El token no sirve: expirado, mal firmado, o de otro proyecto.

    Distinto de FirebaseNoDisponible a proposito: uno es culpa del cliente
    (401) y el otro del servidor (503). Ver el decorador de usuarios.permisos.
    """


class FirebaseNoDisponible(Exception):
    """No se pudo ni intentar la verificacion.

    O cayo la red que llega a los certificados de Google, o al backend le
    falta FIREBASE_PROJECT_ID. Ninguno de los dos es culpa de quien esta
    logueado, asi que no puede terminar en un 401: un 401 manda a cerrar
    sesion a todos los estudiantes cada vez que Google tiene un mal dia.
    """


# Publicas de las llaves que firman los ID tokens de Firebase. Deliberadamente
# escrito aca y no importado del modulo: el nombre de google-auth para esta URL
# es privado (`_GOOGLE_APIS_CERTS_URL`) y no se quiere atar el codigo a el.
_CERTS_DE_FIREBASE = (
    'https://www.googleapis.com/robot/v1/metadata/x509'
    '/securetoken@system.gserviceaccount.com'
)

# `_certificados` no usa cache de google-auth porque NO hay: `id_token._fetch_certs`
# baja el JSON de Google en cada llamada. Sin un cache propio, cada peticion de
# la API seria un ida y vuelta a Google. Una hora alcanza de sobra y mantiene el
# costo en un request por alumno por hora en vez de uno por cada clic.
_SEGUNDOS_DE_CACHE = 3600

# Una sola instancia de transporte para toda la app, que si reutiliza la
# conexion (el `requests.Session` de adentro), pero NO los certificados.
_solicitante = None
_certs = {'valor': None, 'vence': 0.0}


def _red():
    global _solicitante
    if _solicitante is None:
        _solicitante = google_requests.Request()
    return _solicitante


def _certificados(forzar=False):
    """Certificados publicos de las llaves que firman tokens de Firebase.

    `forzar=True` ignora el cache y vuelve a bajarlos. Se usa para el reintento
    ante una llave desconocida, que es el caso de la rotacion de Google.
    """
    ahora = time.monotonic()
    if not forzar and _certs['valor'] is not None and ahora < _certs['vence']:
        return _certs['valor']

    try:
        respuesta = _red()(_CERTS_DE_FIREBASE, method='GET')
    except (google_exceptions.TransportError, RequestException) as e:
        raise FirebaseNoDisponible(
            f'No se pudieron descargar los certificados de Google: {e}'
        ) from e

    if respuesta.status != 200:
        raise FirebaseNoDisponible(
            'Google respondio '
            f'{respuesta.status} al pedir los certificados de Firebase.'
        )

    try:
        _certs['valor'] = json.loads(respuesta.data.decode('utf-8'))
    except (ValueError, UnicodeDecodeError) as e:
        raise FirebaseNoDisponible(
            f'Los certificados de Google no son JSON legible: {e}'
        ) from e

    _certs['vence'] = ahora + _SEGUNDOS_DE_CACHE
    return _certs['valor']


def verificar_token_firebase(token):
    """Devuelve los claims de un ID token de Firebase, o lanza.

    `claims` trae lo que la app necesita: `sub` (el uid de Firebase, que es el
    `user_id` con el que ya estan guardadas las notas y el progreso) y `email`
    (con el que se busca el alta en Django).

    Lanza TokenInvalido o FirebaseNoDisponible, nunca otra cosa.
    """
    proyecto = settings.FIREBASE_PROJECT_ID
    if not proyecto:
        raise FirebaseNoDisponible(
            'El backend no tiene FIREBASE_PROJECT_ID: no hay contra que '
            'auditar el token. Revisar el .env del contenedor.'
        )

    if not token:
        raise TokenInvalido('No se mando ningun ID token.')

    try:
        claims = google_jwt.decode(
            token,
            certs=_certificados(),
            audience=proyecto,
        )
    except ValueError as e:
        # Google rota las llaves de firma de vez en cuando. Si el token esta
        # firmado con una llave que todavia no esta en el cache, NO es un token
        # invalido: se baja el set fresco y se reintenta una vez. Sin este
        # reintento, un alumno con sesion valida quedaria afuera hasta que
        # venciera el TTL del cache, y el error que veria es el mismo que el de
        # una firma genuinamente rota.
        if 'not found' in str(e).lower():
            try:
                claims = google_jwt.decode(
                    token,
                    certs=_certificados(forzar=True),
                    audience=proyecto,
                )
            except ValueError as reintento:
                raise TokenInvalido(str(reintento)) from reintento
        else:
            raise TokenInvalido(str(e)) from e

    if not claims.get('sub'):
        raise TokenInvalido('El token no trae `sub`.')

    return claims
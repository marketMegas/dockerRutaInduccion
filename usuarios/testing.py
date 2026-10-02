"""Ayudas para probar las vistas que ahora exigen sesion.

Vive en un modulo aparte y no en `usuarios/tests.py` porque lo necesitan tests
de otras apps: `courses.tests` y `evaluaciones.tests` tienen que llamar a vistas
protegidas y para eso necesitan el mismo parche y el mismo header.

Lo que se parchea es `usuarios.firebase.verificar_token_firebase`, no el
decorador entero: asi lo que se prueba de verdad es la combinacion de la
verificacion del token con la busqueda del alta, que es donde estan las
decisiones que importan (403 sin alta, `is_active`, el uid que sale del token).
El unico tramo que no se ejercita es la llamada a google de verdad, que
dependeria de la red.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model

from usuarios import firebase

# Defaults que coinciden con los que ya usaban los tests de courses y
# evaluaciones en sus payloads ('uid-abc', 'ana@ejemplo.co'), para que la
# identidad que ahora pone el alta en Django sea la misma que ponia el cuerpo.
UID_DE_PRUEBA = 'uid-abc'
EMAIL_DE_PRUEBA = 'ana@ejemplo.co'


class SesionFalsa:
    """Sesion de Firebase que el backend da por buena.

    Solo se reemplaza la VERIFICACION, no el alta en Django: el User hay que
    crearlo de verdad, porque que exista o no, y que este activo o no, es
    justamente lo que decide el 403.
    """

    def __init__(self, uid=UID_DE_PRUEBA, email=EMAIL_DE_PRUEBA):
        self.uid = uid
        self.email = email
        self.claims = {'sub': uid, 'email': email}

    def header(self):
        return {'HTTP_AUTHORIZATION': f'Bearer token-falso'}


def parche_de_sesion(sesion):
    """Context manager que hace pasar `sesion` por un token valido."""
    return patch.object(
        firebase,
        'verificar_token_firebase',
        side_effect=lambda token=None: sesion.claims,
    )


class ConSesion:
    """Mixin: da un alta en Django y una sesion de Firebase verificada.

    Como mixin y no como clase base para no pelearse con el orden de MRO de los
    `TestCase` de Django. `setUp` llama al del `TestCase` por si el que lo usa
    tambien quiere agregar cosas.

    Que el token se acepte es el comportamiento por defecto de toda la app: lo
    que se prueba explicitamente en `usuarios.tests` es lo contrario (token
    invalido, sin alta, inactivo).
    """

    uid = UID_DE_PRUEBA
    email = EMAIL_DE_PRUEBA

    def setUp(self):
        super().setUp()
        self.sesion = SesionFalsa(uid=self.uid, email=self.email)
        self.alumno = get_user_model().objects.create_user(
            username=self.email,
            email=self.email,
            first_name='Ana',
            last_name='Perez',
        )
        self.parche = parche_de_sesion(self.sesion)
        self.parche.start()
        self.addCleanup(self.parche.stop)

    def sesion_de(self, uid, email):
        """Cambia la sesion a otro alumno dentro del mismo test."""
        self.sesion.uid = uid
        self.sesion.email = email
        self.sesion.claims = {'sub': uid, 'email': email}

    def sin_sesion(self):
        """Deja de parchar la verificacion: todo responde 401."""
        self.parche.stop()

    def get(self, ruta, **kwargs):
        return self.client.get(ruta, **self.sesion.header(), **kwargs)

    def post(self, ruta, data=None, **kwargs):
        return self.client.post(ruta, data, **self.sesion.header(), **kwargs)


def token_invalido(mensaje='Token inválido'):
    """Context manager: el token no verifica."""
    return patch.object(
        firebase,
        'verificar_token_firebase',
        side_effect=firebase.TokenInvalido(mensaje),
    )


def firebase_caido(mensaje='no hay red'):
    """Context manager: Google no responde, o falta la config."""
    return patch.object(
        firebase,
        'verificar_token_firebase',
        side_effect=firebase.FirebaseNoDisponible(mensaje),
    )

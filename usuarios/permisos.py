"""La puerta de la API: quien puede ver el curso y las notas.

Dos mitades, y juntas:

- `usuarios.firebase` prueba la IDENTIDAD. Verifica la firma del ID token de
  Firebase y devuelve el uid y el correo de quien lo mando.
- Este modulo decide la AUTORIZACION. La identidad probada se busca contra los
  `User` de Django, que son los que RH da de alta en
  /admin > Authentication and Authorization > Users. Si el correo no esta ahi,
  no entra, aunque su sesion de Firebase sea perfectamente valida.

Lo que deja de ser posible, y es el punto de todo esto: antes el backend no
validaba sesion y `user_id` era una cadena que el navegador afirmaba. Cualquiera
que supiera el uid de otro se bajaba sus notas y le escribia su progreso. Ahora
`user_id` sale del token verificado y el cuerpo de la peticion se ignora.
"""

import functools

from django.contrib.auth import get_user_model
from django.http import JsonResponse

from . import firebase


# Un solo texto para el 403, en la API y en la pantalla del estudiante: que
# se lean igual importa mas que la redaccion.
MENSAJE_SIN_ALTA = (
    'Tu correo no esta habilitado para la Ruta de Induccion. Pide a Recursos '
    'Humanos que te de de alta en la plataforma y vuelve a entrar.'
)


def usuario_autorizado(email):
    """El User de Django habilitado para ese correo, o None.

    Se busca por `email` sin distinguir mayusculas y no por `username`: RH
    escribe el correo del alumno en el campo Email del formulario de /admin,
    que es un campo opcional, mientras que `username` es obligatorio y suele
    quedar en cualquier otra cosa.

    `is_active=True` es el interruptor de baja: desactivar el usuario en /admin
    lo saca de la plataforma sin borrar sus notas ni sus certificados.

    Ante duplicados gana el de id mas bajo. No deberia haber duplicados (el
    alta la hace una persona, no un script), pero si los hay, elegir siempre el
    mismo evita que las notas salten de usuario a usuario entre peticiones.
    """
    if not email:
        return None

    return (
        get_user_model()
        .objects
        .filter(email__iexact=email, is_active=True)
        .order_by('id')
        .first()
    )


def _token_de(request):
    """El ID token del header `Authorization: Bearer ...`, o cadena vacia."""
    esquema, _, valor = request.headers.get('Authorization', '').partition(' ')
    if esquema.lower() != 'bearer':
        return ''
    return valor.strip()


def claims_de_la_peticion(request):
    """(claims, None) si el token sirve, o (None, (status, cuerpo)) si no.

    El (status, cuerpo) se devuelve en vez de lanzar para que las vistas no
    tengan que elegir entre el 401 de /api/auth/verificar/ y el 403 de un
    alumno sin alta: las dos cosas arman la misma respuesta.
    """
    token = _token_de(request)
    try:
        return firebase.verificar_token_firebase(token), None
    except firebase.TokenInvalido as e:
        # El `detalle` y la distincion entre token ausente y token rechazado no
        # son adornos: son las dos unicas causas de este 401 y cada una se
        # arregla en un lado distinto (el header que no Via, contra un token
        # viejo, mal firmado o de otro proyecto). Con el texto fijo de antes
        # las dos se veian igual y no habia por donde entrar.
        return None, (401, {
            'error': 'Sesion no valida o vencida.',
            'codigo': 'token_ausente' if not token else 'token_invalido',
            'detalle': str(e),
        })
    except firebase.FirebaseNoDisponible as e:
        # 503 y no 401 a proposito: si Google esta caido o al backend le falta
        # la variable, esto NO es culpa de quien esta dentro, y responder 401
        # cerraria la sesion de todos los estudiantes a la vez.
        return None, (503, {
            'error': 'No se pudo verificar la sesion en este momento. '
                     'Intenta de nuevo en unos minutos.',
            'codigo': 'auth_no_disponible',
            'detalle': str(e),
        })


def requiere_estudiante(vista):
    """Exige sesion de Firebase Y alta en Django. Deja el uid en el request.

    Las vistas no vuelven a mirar `user_id` en el cuerpo: leen
    `request.firebase_uid`, que sale del token verificado. Ese es el cambio que
    cierra el IDOR, y por eso el decorador va en TODAS las vistas que tocan
    datos de un alumno, incluidas las de lectura.

    No va en `descargar_certificado`: ese entrega un PDF por un enlace que ya
    viaja con su propio token (courses.views), que es la defensa correcta para
    un archivo que se manda por correo.

    Va debajo de `@require_http_methods` para que un GET a un endpoint de POST
    conteste 405 y no 401: primero el metodo, despues la sesion.
    """
    @functools.wraps(vista)
    def envoltura(request, *args, **kwargs):
        claims, error = claims_de_la_peticion(request)
        if error is not None:
            status, cuerpo = error
            return JsonResponse(cuerpo, status=status)

        email = str(claims.get('email') or '').strip()
        user = usuario_autorizado(email)
        if user is None:
            return JsonResponse({
                'error': MENSAJE_SIN_ALTA,
                'codigo': 'sin_alta',
            }, status=403)

        request.firebase_uid = claims['sub']
        request.firebase_email = email
        request.django_user = user
        # El nombre sale del alta de RH, no del `displayName` de Firebase: lo
        # que va impreso en el certificado lo eligio la empresa.
        request.nombre_verificado = user.get_full_name() or user.username
        return vista(request, *args, **kwargs)

    return envoltura

"""Los dos endpoints que deciden si alguien puede entrar.

No hay mas registro ni login en Django. Todo eso vive en Firebase, del lado del
navegador: el backend no recibe contrasenas ni crea cuentas. Lo unico que hace
es negativo, y son justo las dos consultas que el frontend necesita:

- `correo_autorizado` se consulta ANTES de crear la cuenta en Firebase. Sin
  esto, el alta seria libre y cualquiera podria abrirse una cuenta con el correo
  de otro alumno y, si el correo es el criterio de la lista blanca, entrar como
  el. Con esto, el correo tiene que estar dado de alta en /admin antes de que
  exista la cuenta: el enlace correo -> persona lo hace Django.

- `verificar_acceso` se consulta ya con la sesion abierta. Es la respuesta
  directa a "este correo esta en la lista", y es la que `ProtectedRoute` mira
  para decidir entre mostrar el curso y mostrar la pantalla de acceso
  restringido.

Lo que se borro de aca (login_normal, registro_normal, registro_google y su
plantilla) era una segunda puerta de entrada que ademas se habia vuelto
autoinvitacion: `registro_normal` creaba un User de Django con lo que le
mandaran, y ahora que la lista blanca ES la lista de User de Django, eso habria
sido con solo un POST auto-darse el acceso.
"""

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .permisos import (
    MENSAJE_SIN_ALTA, claims_de_la_peticion, usuario_autorizado,
)


@csrf_exempt
@require_http_methods(["POST"])
def correo_autorizado(request):
    """POST {email} -> {autorizado: bool}

    Deliberadamente no devuelve ni el nombre ni el User: la pantalla de
    registro solo necesita un si o un no. Lo de que esta o no un correo en la
    lista lo revela el alta de cualquier registro, asi que no hay nada que
    ocultar aca; lo que si importa es no devolver datos de la cuenta.
    """
    try:
        data = json.loads(request.body or b'{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON invalido'}, status=400)

    email = str(data.get('email') or '').strip()
    if not email or '@' not in email:
        return JsonResponse({'error': 'Falta el correo.'}, status=400)

    return JsonResponse({'autorizado': usuario_autorizado(email) is not None})


@csrf_exempt
@require_http_methods(["POST"])
def verificar_acceso(request):
    """POST con `Authorization: Bearer <ID token>` -> si ese correo esta dado
    de alta en Django.

    No lleva `@requiere_estudiante`: esta vista ES la que responde si el alumno
    tiene alta, asi que un 403 aca es una respuesta valida y no un error. Por
    eso usa `claims_de_la_peticion` directo, que es el mismo paso que hace el
    decorador pero sin la segunda mitad.

    Un 401 con `codigo: token_invalido` le dice al frontend que reintente con
    un token fresco: los ID tokens duran una hora y el SDK de Firebase los
    refresca solo, asi que un token vencido no significa sesion perdida.
    """
    claims, error = claims_de_la_peticion(request)
    if error is not None:
        status, cuerpo = error
        return JsonResponse(cuerpo, status=status)

    email = str(claims.get('email') or '').strip()
    user = usuario_autorizado(email)

    if user is None:
        return JsonResponse({
            'autorizado': False,
            'codigo': 'sin_alta',
            'error': MENSAJE_SIN_ALTA,
        }, status=403)

    return JsonResponse({
        'autorizado': True,
        'uid': claims['sub'],
        'email': email,
        'nombre': user.get_full_name() or user.username,
    })

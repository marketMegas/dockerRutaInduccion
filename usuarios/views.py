import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from google.oauth2 import id_token
from google.auth.transport import requests

def registro_page(request):
    return render(request, 'usuarios/registro.html')

@csrf_exempt
def login_normal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'error': 'Por favor, ingrese usuario y contraseña'}, status=400)

            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({'status': 'success', 'message': '¡Inicio de sesión exitoso!'})
            else:
                return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def registro_normal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not username or not email or not password:
                return JsonResponse({'error': 'Por favor complete todos los campos'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'El nombre de usuario ya está en uso'}, status=400)

            # Crear el usuario en la base de datos
            user = User.objects.create_user(username=username, email=email, password=password)
            
            # Iniciar sesión automáticamente después de registrar
            login(request, user)
            
            return JsonResponse({'status': 'success', 'message': '¡Usuario registrado e inicio de sesión exitoso!'})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# Reemplaza esto con el mismo Client ID que usaste en el Frontend
GOOGLE_CLIENT_ID = "549227011140-784g5vpn47cfk2r7rnc96cen8247qgek.apps.googleusercontent.com"

# Nota: Usamos @csrf_exempt para facilitar la prueba inicial. 
# En producción, asegúrate de enviar el token CSRF desde tu frontend (fetch) para mayor seguridad.
@csrf_exempt 
def registro_google(request):
    if request.method == 'POST':
        try:
            # 1. Recibir el token enviado desde el frontend
            data = json.loads(request.body)
            token = data.get('token')

            if not token:
                return JsonResponse({'error': 'No se proporcionó ningún token'}, status=400)

            # 2. Verificar el token directamente con los servidores de Google
            # Si el token es inválido o expiró, esto lanzará un ValueError
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), "549227011140-784g5vpn47cfk2r7rnc96cen8247qgek.apps.googleusercontent.com")

            # 3. Extraer los datos seguros del usuario
            email = idinfo['email']
            nombre = idinfo.get('given_name', '')
            apellido = idinfo.get('family_name', '')

            # 4. Lógica de Base de Datos: Buscar o Crear el usuario en Django
            # Usamos el email como username, ya que Google garantiza que sea único y verificado
            user, created = User.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': nombre,
                'last_name': apellido
            })

            # 5. Iniciar la sesión del usuario en Django
            login(request, user)

            if created:
                mensaje = "¡Usuario registrado e inicio de sesión exitoso!"
            else:
                mensaje = "¡Bienvenido de vuelta! Inicio de sesión exitoso."

            return JsonResponse({'status': 'success', 'message': mensaje})

        except ValueError:
            # El token de Google es inválido
            return JsonResponse({'error': 'Token de Google inválido o expirado'}, status=401)
        except Exception as e:
            # Cualquier otro error del servidor
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)
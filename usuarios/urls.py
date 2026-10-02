from django.urls import path
from . import views

urlpatterns = [
    # Las dos mitades de la puerta. /api/auth/verificar/ es la que consulta
    # ProtectedRoute en cada arranque de sesion y /api/auth/correo-autorizado/
    # la que consulta RegisterPage antes de crear la cuenta en Firebase.
    path('api/auth/correo-autorizado/', views.correo_autorizado, name='correo_autorizado'),
    path('api/auth/verificar/', views.verificar_acceso, name='verificar_acceso'),
]

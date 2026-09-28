from django.urls import path
from . import views

urlpatterns = [
    # Otras rutas de tu app...
    path('', views.registro_page, name='registro_page'),
    path('api/login-normal/', views.login_normal, name='login_normal'),
    path('api/registro-normal/', views.registro_normal, name='registro_normal'),
    path('api/registro-google/', views.registro_google, name='registro_google'),
]
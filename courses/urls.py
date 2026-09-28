from django.urls import path
from . import views

urlpatterns = [
    path('', views.lista_cursos, name='lista_cursos'),
    path('<int:course_id>/', views.detalle_curso, name='detalle_curso'),
    path('progreso/', views.guardar_progreso, name='guardar_progreso'),
    path('progreso/<str:user_id>/', views.obtener_progreso, name='obtener_progreso'),
    path('calificaciones/', views.guardar_calificacion, name='guardar_calificacion'),
    path('calificaciones/<str:user_id>/', views.obtener_calificaciones, name='obtener_calificaciones'),
    path('enviar-certificado/', views.enviar_certificado, name='enviar_certificado'),
]


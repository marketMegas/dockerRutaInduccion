"""Rutas de la API de gestion de evaluaciones (solo staff).

Se montan bajo /api/admin/ (core_project/urls.py). No confundir con
/admin/, que es el panel de Django con sus propias plantillas: nginx y el
proxy de Vite ya enrutan /api/ entero al backend, asi que estas rutas
llegan sin tocar infraestructura.
"""

from django.urls import path

from . import admin_api

urlpatterns = [
    path('evaluaciones/', admin_api.listar_evaluaciones),
    path('evaluaciones/<int:evaluacion_id>/', admin_api.evaluacion_detallada),
    path(
        'evaluaciones/<int:evaluacion_id>/preguntas/',
        admin_api.crear_pregunta,
    ),
    path('preguntas/<int:pregunta_id>/', admin_api.pregunta_detallada),
    path('preguntas/<int:pregunta_id>/opciones/', admin_api.crear_opcion),
    path('opciones/<int:opcion_id>/', admin_api.opcion_detallada),
]

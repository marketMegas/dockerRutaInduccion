from django.urls import path
from . import views

urlpatterns = [
    # GET  /api/foro/temas/                          → listar temas
    # POST /api/foro/temas/                          → crear tema
    path('temas/', views.temas, name='foro-temas'),

    # GET  /api/foro/temas/<tema_id>/comentarios/    → listar comentarios
    # POST /api/foro/temas/<tema_id>/comentarios/    → crear comentario
    path('temas/<int:tema_id>/comentarios/', views.comentarios, name='foro-comentarios'),
]

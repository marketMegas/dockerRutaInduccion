from django.urls import path

from . import views

# Montado en core_project/urls.py bajo 'api/cursos/evaluaciones/', asi que las
# rutas completas son /api/cursos/evaluaciones/<course_id>/ y
# /api/cursos/evaluaciones/<course_id>/entregar/. Las dos por debajo de
# /api/cursos/ porque una evaluacion siempre pertenece a un curso.
urlpatterns = [
    path('<int:course_id>/', views.obtener_evaluacion, name='obtener_evaluacion'),
    path(
        '<int:course_id>/entregar/',
        views.entregar_evaluacion,
        name='entregar_evaluacion',
    ),
]

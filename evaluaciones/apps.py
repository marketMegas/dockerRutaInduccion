from django.apps import AppConfig


class EvaluacionesConfig(AppConfig):
    name = 'evaluaciones'
    # courses/0001_initial creo sus tablas con BigAutoField aunque settings no
    # fija DEFAULT_AUTO_FIELD. Sin esto, makemigrations genera AutoField para
    # estas y las claves primarias del proyecto quedan de dos tipos distintos.
    default_auto_field = 'django.db.models.BigAutoField'

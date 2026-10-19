from django.db import migrations, models
import django.db.models.deletion


def dejar_una_por_curso(apps, schema_editor):
    """Conserva una sola evaluación por curso antes de poner el OneToOne.

    Si una base ya traia varias evaluaciones para el mismo curso, el ALTER a
    OneToOne fallaria por la restriccion de unicidad. Se conserva la activa de
    menor id (la que un estudiante veria) y se borran las demas.
    """
    Evaluacion = apps.get_model('evaluaciones', 'Evaluacion')
    vistos = set()
    # Orden: por curso, activas primero (activa=True ordena antes en Postgres
    # y SQLite al ordenar descendente), y por id ascendente dentro de eso.
    for evaluacion in Evaluacion.objects.order_by('course_id', '-activa', 'id'):
        if evaluacion.course_id in vistos:
            evaluacion.delete()
        else:
            vistos.add(evaluacion.course_id)


class Migration(migrations.Migration):
    dependencies = [
        ('evaluaciones', '0001_initial'),
        ('courses', '0013_quitar_modulo'),
    ]

    operations = [
        migrations.RunPython(dejar_una_por_curso, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='evaluacion',
            name='course',
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='evaluacion',
                to='courses.course',
                verbose_name='Curso',
            ),
        ),
    ]

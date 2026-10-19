from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """Paso 1 de 3: agrega Lesson.course (nullable) antes de mover los datos.

    Tiene que ser nullable en este paso porque las lecciones que ya existen
    todavia no tienen curso: se rellena en 0012 y recien en 0013 se vuelve
    obligatorio y se borra Module.
    """

    dependencies = [
        ('courses', '0010_recurso'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='course',
            field=models.ForeignKey(
                null=True, blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='lessons',
                to='courses.course',
                verbose_name='Curso',
            ),
        ),
    ]

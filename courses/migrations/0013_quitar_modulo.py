from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """Paso 3 de 3: consolida Lesson.course y elimina Module.

    Después del backfill no queda ninguna lección sin curso, asi que `course`
    pasa a obligatorio, se quita la FK `module` y se borra el modelo Module.
    """

    dependencies = [
        ('courses', '0012_backfill_lesson_course'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lesson',
            name='module',
        ),
        migrations.AlterField(
            model_name='lesson',
            name='course',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='lessons',
                to='courses.course',
                verbose_name='Curso',
            ),
        ),
        migrations.DeleteModel(
            name='Module',
        ),
    ]

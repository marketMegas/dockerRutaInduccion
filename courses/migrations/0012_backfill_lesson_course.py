from django.db import migrations


def pasar_cursos(apps, schema_editor):
    """Paso 2 de 3: Lesson.course = modulo.course de cada lección.

    Recorre solo las lecciones que ya existen (select_related evita una query
    por lección para leer el curso del modulo).
    """
    Lesson = apps.get_model('courses', 'Lesson')
    for leccion in Lesson.objects.select_related('module'):
        leccion.course_id = leccion.module.course_id
        leccion.save(update_fields=['course'])


class Migration(migrations.Migration):
    dependencies = [
        ('courses', '0011_lesson_course'),
    ]

    operations = [
        migrations.RunPython(pasar_cursos, migrations.RunPython.noop),
    ]

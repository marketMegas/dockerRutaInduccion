from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_calificacion'),
    ]

    operations = [
        migrations.AddField(
            model_name='calificacion',
            name='user_email',
            field=models.EmailField(blank=True, default='', verbose_name='Correo del Usuario'),
        ),
        migrations.AddField(
            model_name='calificacion',
            name='user_name',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Nombre del Usuario'),
        ),
    ]

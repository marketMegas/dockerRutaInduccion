from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0013_quitar_modulo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='cover_image',
            field=models.CharField(
                blank=True,
                help_text='Pega el enlace de la imagen (directo o de servicios como Imgur), sin importar resolución o formato.',
                max_length=2048,
                null=True,
                verbose_name='URL de la imagen de portada',
            ),
        ),
    ]

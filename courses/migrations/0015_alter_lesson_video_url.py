from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0014_alter_course_cover_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='video_url',
            field=models.CharField(
                help_text='Pega un enlace de video de YouTube o de una imagen (directa o de páginas como Imgur/Pexels/Unsplash).',
                max_length=2048,
                verbose_name='URL del video',
            ),
        ),
    ]

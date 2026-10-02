"""Rellena el token de los certificados que ya existian.

La columna de 0008 entra con default='' y unique=True, asi que quedo un solo
certificado viejo en la base (el '' unico que(unique) permite) y su PDF ya no
se podia bajar: la vista de descarga compara el token de la URL con el de la
fila. Esta migracion le da su token sin volver a emitir el PDF ni tocar la
fecha.
"""

import secrets

from django.db import migrations


def rellenar_tokens(apps, schema_editor):
    Certificado = apps.get_model('courses', 'Certificado')
    for certificado in Certificado.objects.filter(token=''):
        certificado.token = secrets.token_urlsafe(32)
        # save(update_fields=...) evita pisar fecha_emision, que es auto_now.
        certificado.save(update_fields=['token'])


def quitar_tokens(apps, schema_editor):
    # Irreversible a proposito: los tokens son aleatorios y no se pueden
    # reconstruir. Volver a '' dejaria la vista de descarga inservible, que es
    # justo lo que esta migracion vino a arreglar.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0008_certificado_token'),
    ]

    operations = [
        migrations.RunPython(rellenar_tokens, quitar_tokens),
    ]

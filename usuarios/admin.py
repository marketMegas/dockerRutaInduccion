from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashWidget, UserChangeForm
from django.contrib.auth.models import Group, User


class _WidgetContrasenaSinHash(ReadOnlyPasswordHashWidget):
    """El widget por defecto resume el hash de la contrasena
    (algorithm/iterations/salt/hash). Eso no deberia mostrarse, menos aca donde
    la autenticacion la maneja Firebase. Se conserva el contexto del widget
    (boton "Reset password" y su enlace), pero con una plantilla sin el resumen.
    """

    template_name = "usuarios/widgets/password_sin_hash.html"


class _FormCambioUsuario(UserChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # No se redefine el campo: asi se mantiene su help_text (que apunta al
        # formulario para cambiar la contrasena). Solo se cambia el widget.
        self.fields["password"].widget = _WidgetContrasenaSinHash()


class UsuarioAdmin(UserAdmin):
    form = _FormCambioUsuario


if admin.site.is_registered(User):
    admin.site.unregister(User)
admin.site.register(User, UsuarioAdmin)

# Grupos fuera del menu: la plataforma no usa el sistema de permisos de Django
# (RH da de alta alumnos en una lista blanca, no asigna roles), asi que dejar
# Grupos visible solo invita a tocar algo que no afecta a nadie. Los usuarios
# siguen administrables.
if admin.site.is_registered(Group):
    admin.site.unregister(Group)

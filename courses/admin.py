import os

from django import forms
from django.contrib import admin, messages
from django.core.files.storage import default_storage
from django.db.models import Count, Max, OuterRef, Subquery
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import Course, Lesson, Calificacion, Certificado, Recurso
from .views import _adjunto_certificado, _cuerpo_certificado, _enviar
from evaluaciones.models import Evaluacion

EXTENSIONES_IMAGEN = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}


def _tipo_archivo(archivo):
    """PDF si termina en .pdf, Imagen si es una extension de imagen, sino None."""
    extension = os.path.splitext((archivo.name or '').lower())[1]
    if extension == '.pdf':
        return 'PDF'
    if extension in EXTENSIONES_IMAGEN:
        return 'Imagen'
    return None


def _crear_recurso_subido(leccion, archivo):
    """Crea un Recurso colgado de la leccion a partir de un archivo subido.

    Devuelve (recurso, None) si todo bien, o (None, mensaje de error) si el
    tipo no esta permitido o falta la extension.
    """
    tipo = _tipo_archivo(archivo)
    if tipo is None:
        nombre = archivo.name or 'sin nombre'
        return None, f'"{nombre}": tipo no permitido (usa un PDF o una imagen).'

    siguiente_orden = (
        Recurso.objects.filter(course=leccion.course)
        .aggregate(maximo=Max('order'))['maximo'] or 0
    ) + 1
    recurso = Recurso(
        course=leccion.course,
        lesson=leccion,
        title=archivo.name,
        tipo=tipo,
        archivo=archivo,
        order=siguiente_orden,
    )
    recurso.full_clean()
    recurso.save()
    return recurso, None


class MultiFileWidget(forms.ClearableFileInput):
    # ClearableFileInput desactiva la multi-subida por defecto; se reactiva
    # para poder elegir varios archivos en un mismo campo.
    allow_multiple_selected = True


class MultiArchivoField(forms.Field):
    """Campo de subida multi-archivo que no valida el contenido.

    Django convierte la multi-subida en una lista, y un FileField simple la ve
    como vacia ("No file was submitted"). Los archivos se procesan en
    ``CourseAdmin.save_formset`` leyendo ``request.FILES``, asi que este campo
    solo se encarga de renderizar el input y mantener el formulario valido.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('widget', MultiFileWidget())
        super().__init__(*args, **kwargs)

    def clean(self, value):
        return None


class LessonAdminForm(forms.ModelForm):
    # Campos de subida por leccion: no son parte del modelo Lesson; al guardar,
    # CourseAdmin.save_formset los convierte en Recurso de la leccion.
    nuevas_imagenes = MultiArchivoField(
        label="Subir imágenes",
        required=False,
        widget=MultiFileWidget(attrs={'multiple': True, 'accept': 'image/*'}),
        help_text="Se añaden como Recursos de esta lección.",
    )
    nuevos_pdfs = MultiArchivoField(
        label="Subir PDFs",
        required=False,
        widget=MultiFileWidget(attrs={'multiple': True, 'accept': '.pdf'}),
        help_text="Se añaden como Recursos de esta lección.",
    )

    class Meta:
        model = Lesson
        fields = '__all__'
        widgets = {
            'content_text': forms.Textarea(attrs={'rows': 10, 'style': 'width: 90%; min-width: 240px;'}),
            'image_urls': forms.Textarea(attrs={'rows': 10, 'style': 'width: 90%; min-width: 240px;'}),
        }


class LessonInline(admin.TabularInline):
    model = Lesson
    form = LessonAdminForm
    extra = 0
    fields = (
        'title', 'video_url', 'image_urls',
        'nuevas_imagenes', 'nuevos_pdfs',
        'content_text', 'order',
    )
    ordering = ('order',)

class EvaluacionInline(admin.TabularInline):
    # La evaluacion del curso, al final del formulario. Un curso tiene una
    # sola (OneToOne), asi que el inline no deja agregar una segunda. Las
    # preguntas y opciones se editan en la pagina propia de la evaluacion
    # (enlace "modificar"): Django no permite anidar inlines a mas de un nivel.
    model = Evaluacion
    extra = 1
    max_num = 1
    fields = ('titulo', 'puntaje_aprobacion', 'activa', 'orden')
    ordering = ('orden',)
    show_change_link = True
    verbose_name = "Evaluación"
    verbose_name_plural = "Evaluaciones"

class RecursoInline(admin.TabularInline):
    model = Recurso
    extra = 0
    fields = ('title', 'lesson', 'tipo', 'archivo', 'description', 'order')
    ordering = ('order',)

    def get_formset(self, request, obj=None, **kwargs):
        # El inline no recibe el curso en formfield_for_foreignkey, asi que se
        # guarda aqui para limitar el desplegable de lecciones a las del curso
        # que se esta editando.
        request._recurso_inline_course = obj
        return super().get_formset(request, obj, **kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'lesson':
            curso = getattr(request, '_recurso_inline_course', None)
            if curso is not None:
                kwargs['queryset'] = Lesson.objects.filter(course=curso)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'badge', 'level', 'icon_type', 'duration', 'created_at')
    list_filter = ('badge', 'level', 'icon_type')
    search_fields = ('title', 'description')
    fieldsets = (
        ('Contenido', {'fields': ('title', 'description', 'cover_image')}),
        ('Presentación', {'fields': ('icon_type', 'accent_color', 'badge', 'level')}),
    )
    # El orden importa: primero el contenido (lecciones), los recursos, y la
    # evaluacion al final del curso.
    inlines = [LessonInline, RecursoInline, EvaluacionInline]

    def save_formset(self, request, form, formset, change):
        super().save_formset(request, form, formset, change)

        # Los campos de subida de cada fila de leccion se transforman en Recurso
        # colgados de esa leccion. Se procesan despues de guardar las lecciones
        # (que ya tienen pk) y solo para las filas que no se marcaron borradas.
        if formset.model is not Lesson:
            return

        for formulario in formset.forms:
            if formulario.cleaned_data.get('DELETE'):
                continue
            leccion = formulario.instance
            if not leccion.pk:
                continue
            for campo in ('nuevas_imagenes', 'nuevos_pdfs'):
                for archivo in request.FILES.getlist(formulario.add_prefix(campo)):
                    recurso, error = _crear_recurso_subido(leccion, archivo)
                    if error:
                        messages.error(request, error)

# Lesson, Recurso y UserProgress NO se registran sueltos: las lecciones y los
# recursos se editan dentro del curso, y el progreso es dato operativo que no
# se toca a mano. El menu queda con Cursos, Calificaciones y Certificados.

# Registrada para que el enlace del correo de aprobacion (/admin/courses/calificacion/)
# sirva de algo: antes las notas solo se veian en la base. Antes de este cambio
# tampoco se podia ver que evaluacion rindio cada alumno.
@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_email', 'course_name', 'score', 'percentage', 'passed', 'evaluacion', 'fecha_creacion')
    list_filter = ('passed', 'course_id')
    search_fields = ('user_id', 'user_name', 'user_email', 'course_id', 'course_name')
    autocomplete_fields = ('evaluacion',)

@admin.register(Certificado)
class CertificadoAdmin(admin.ModelAdmin):
    # El listado es lo unico que se abre: dice quien tiene certificado, de que
    # curso y cuantos acumula cada alumno. El PDF no se consulta ni se baja
    # desde aca (ver `list_display_links` y `change_view` mas abajo).
    list_display = (
        'user_name', 'user_email', 'course_name', 'total_del_usuario',
        'notificado', 'intentos', 'fecha_emision',
    )
    list_filter = ('notificado', 'course_id')
    search_fields = ('user_id', 'user_name', 'user_email', 'course_id', 'course_name')
    # El estado del aviso solo se cambia con la accion de reenvio: editarlo a
    # mano dejaria el registro mintiendo sobre si el correo salio o no.
    readonly_fields = ('archivo', 'token', 'intentos', 'fecha_emision', 'notificado', 'notificacion_error')
    actions = ('reenviar_aviso',)
    # Sin enlaces en las filas: no se entra al detalle de un certificado. Antes
    # la primera columna linkeaba a la pagina de cambio, que ademas tenia un
    # enlace "Descargar PDF" armado con `reverse` y `format_html` que nunca se
    # importaron: abrir un certificado en /admin tiraba NameError.
    list_display_links = None

    def get_queryset(self, request):
        # Cuantos certificados tiene ese mismo alumno, consultado en la query
        # con una subconsulta y no con un `.count()` por fila: el listado crece
        # con cada emision y un N+1 aca se nota.
        total = (
            Certificado.objects
            .filter(user_id=OuterRef('user_id'))
            .values('user_id')
            .annotate(n=Count('id'))
            .values('n')
        )
        return (
            super().get_queryset(request)
            .annotate(total_del_usuario=Subquery(total))
        )

    @admin.display(description='Certificados del usuario', ordering='total_del_usuario')
    def total_del_usuario(self, obj):
        return obj.total_del_usuario

    def change_view(self, request, object_id, form_url='', extra_context=None):
        # La pagina de detalle no se abre: muestra los datos de la emision y
        # antes colgaba de ahi la descarga del PDF. Se vuelve al listado, que es
        # donde esta el conteo por alumno, en vez de dejar la URL muerta.
        messages.warning(
            request,
            'El detalle de un certificado no esta disponible desde /admin.',
        )
        return HttpResponseRedirect(reverse('admin:courses_certificado_changelist'))

    @admin.action(description='Reenviar aviso de certificado')
    def reenviar_aviso(self, request, queryset):
        enviados, omitidos, sin_archivo, fallidos = 0, 0, 0, 0

        for certificado in queryset:
            if certificado.notificado:
                omitidos += 1
                continue

            # El archivo puede haberse borrado del disco a mano. Se reporta
            # aparte para que RH sepa por que ese certificado no se pudo
            # avisar, en vez de verlos todos acumulados como fallos de SMTP.
            if not certificado.archivo or not default_storage.exists(certificado.archivo):
                sin_archivo += 1
                certificado.notificacion_error = 'El archivo ya no esta en el disco: no se puede verificar el certificado.'
                certificado.save(update_fields=['notificacion_error'])
                continue

            certificado.intentos += 1
            adjunto = _adjunto_certificado(certificado)
            motivo = 'reenvío manual desde el panel'

            # Al estudiante se le manda con con_internos=False porque el aviso
            # de RH va aparte: si no, los internos recibirian dos correos.
            error_estudiante = ''
            if certificado.user_email:
                ok_estudiante, error_estudiante = _enviar(
                    f"Tu certificado de {certificado.course_name}",
                    _cuerpo_certificado(request, certificado, motivo, para_estudiante=True),
                    adjunto,
                    destinatario=certificado.user_email,
                    con_internos=False,
                )
            else:
                error_estudiante = ''

            notificado, error = _enviar(
                f"[Certificación completada] {certificado.user_name or certificado.user_id}",
                _cuerpo_certificado(request, certificado, motivo),
                adjunto,
            )
            certificado.notificado = notificado
            certificado.notificacion_error = error or error_estudiante or ''
            certificado.save()

            if notificado:
                enviados += 1
            else:
                fallidos += 1

        self.message_user(
            request,
            f'{enviados} reenviado(s), {fallidos} con error de SMTP, '
            f'{omitidos} ya notificados (omitidos), {sin_archivo} sin archivo en disco.',
            level='warning' if (fallidos or sin_archivo) else 'info',
        )

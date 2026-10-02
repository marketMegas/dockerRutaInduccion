from django.contrib import admin
from django.core.files.storage import default_storage
from .models import Course, Module, Lesson, UserProgress, Calificacion, Certificado
from .views import _adjunto_certificado, _cuerpo_certificado, _enviar
from evaluaciones.models import Evaluacion

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'video_url', 'duration', 'content_text', 'order')
    ordering = ('order',)

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    fields = ('title', 'order')
    ordering = ('order',)

class EvaluacionInline(admin.TabularInline):
    # Banco de preguntas del curso. Antes las preguntas estaban escritas en el
    # JSX del frontend, asi que un curso nuevo creado desde aca salia sin nada
    # que evaluar. La evaluacion se edita en su propia pagina (tiene preguntas
    # y opciones anidadas); aca solo se declara que este curso tiene una.
    model = Evaluacion
    extra = 1
    fields = ('titulo', 'puntaje_aprobacion', 'activa', 'orden')
    ordering = ('orden',)
    show_change_link = True
    verbose_name = "Evaluación"
    verbose_name_plural = "Evaluaciones"

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'badge', 'level', 'icon_type', 'duration', 'created_at')
    list_filter = ('badge', 'level', 'icon_type')
    search_fields = ('title', 'description')
    fieldsets = (
        ('Contenido', {'fields': ('title', 'description', 'cover_image')}),
        ('Presentación', {'fields': ('icon_type', 'accent_color', 'badge', 'level', 'duration')}),
    )
    inlines = [ModuleInline, EvaluacionInline]

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title',)
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'module', 'order')
    list_filter = ('module__course', 'module')
    search_fields = ('title',)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'course_id', 'lesson_id', 'completado', 'fecha_actualizacion')
    list_filter = ('completado', 'course_id')
    search_fields = ('user_id', 'course_id', 'lesson_id')

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
    # Los certificados notificados se consultan desde aca, y el enlace del
    # correo apunta a la fila (/admin/courses/certificado/<id>/change/), asi que
    # el registro tiene que existir aunque el aviso nunca haya salido.
    list_display = ('user_name', 'user_email', 'course_name', 'notificado', 'intentos', 'fecha_emision')
    list_filter = ('notificado', 'course_id')
    search_fields = ('user_id', 'user_name', 'user_email', 'course_id', 'course_name')
    # El estado del aviso solo se cambia con la accion de reenvio: editarlo a
    # mano dejaria el registro mintiendo sobre si el correo salio o no.
    readonly_fields = ('archivo', 'token', 'enlace_descarga', 'intentos', 'fecha_emision', 'notificado', 'notificacion_error')
    actions = ('reenviar_aviso',)

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

    @admin.display(description='Enlace de descarga')
    def enlace_descarga(self, obj):
        if not obj or not obj.token:
            return '—'
        url = reverse(
            'descargar_certificado',
            args=[obj.user_id, obj.course_id, obj.token],
        )
        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">Descargar PDF</a>',
            url,
        )

from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from django.utils.safestring import mark_safe

from .models import Evaluacion, Opcion, Pregunta
from .serializers import total_correctas


class EvaluacionIncompleta(ValidationError):
    """La activacion quedaria colgada: no hay banco completo que corregir.

    Sale de save_related, que corre dentro de la transaccion del admin: al
    subirla, la transaccion ya se revirtio, asi que EvaluacionAdmin la
    atrapa y vuelve al formulario sin dejar nada a medias.
    """


class OpcionFormSet(forms.BaseInlineFormSet):
    """Exige exactamente una opcion correcta por pregunta.

    `es_correcta` es una bandera en la opcion (y no una FK desde la pregunta)
    para poder marcar la respuesta en la misma pantalla donde se escriben las
    opciones, sin guardar la pregunta antes. El precio es que nada impide
    marcar dos o ninguna, y una pregunta sin correcta es imposible de
    aprobar: le traba el certificado al estudiante para siempre. Eso se
    valida aca.

    Se usa en PreguntaAdmin, donde el inline es de primer nivel. Acá
    `self.instance` es siempre la pregunta dueña de estas opciones.
    """

    def clean(self):
        super().clean()

        # Formularios extra vacios (los `extra=2` de abajo) no cuentan.
        if not any(form.has_changed() for form in self.forms):
            return

        correctas = [
            form for form in self.forms
            if form.cleaned_data.get('es_correcta')
        ]

        if len(correctas) == 1:
            return

        texto = (self.instance.texto or '')[:60] or '(sin texto)'
        if not correctas:
            raise ValidationError(
                f'La pregunta "{texto}" no tiene ninguna opción marcada como '
                'correcta.'
            )
        raise ValidationError(
            f'La pregunta "{texto}" tiene {len(correctas)} opciones marcadas '
            'como correctas. Solo puede tener una.'
        )


class OpcionInline(admin.TabularInline):
    model = Opcion
    formset = OpcionFormSet
    extra = 2
    fields = ('texto', 'es_correcta', 'orden')
    ordering = ('orden',)


class PreguntaInline(admin.StackedInline):
    """Preguntas de la evaluación, editables junto a ella.

    SIN inline de opciones adentro, a propósito. Django ignora el atributo
    `inlines` de un InlineModelAdmin: no soporta inlines anidados y no avisa.
    Con el que estaba puesto, la pantalla de evaluación salía sin un solo campo
    de opción, sin error, y no había forma de marcar la correcta desde ahí.

    Las opciones se cargan entrando a cada pregunta (enlace "modificar" de
    abajo), donde OpcionInline sí funciona por ser de primer nivel. El
    `save_related` de EvaluacionAdmin es lo que avisa al final si al activar
    falta alguna correcta.
    """

    model = Pregunta
    extra = 1
    fields = ('texto', 'contexto', 'es_larga', 'orden')
    ordering = ('orden',)
    show_change_link = True


@admin.register(Evaluacion)
class EvaluacionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'course', 'puntaje_aprobacion', 'activa',
                    'total_preguntas', 'orden')
    list_filter = ('activa', 'course')
    search_fields = ('titulo', 'course__title')
    fieldsets = (
        ('Evaluación', {
            'fields': ('course', 'titulo', 'activa', 'orden'),
            'description': (
                'Primero guardá la evaluación con sus preguntas y la dejá '
                'inactiva. Después entrá a cada pregunta con el enlace '
                '<b>modificar</b> para cargarle las opciones y marcar cuál es '
                'la correcta: Django no permite poner opciones en esta misma '
                'pantalla. Al volver, activá la evaluación; si alguna pregunta '
                'quedó sin correcta, el guardado se rechaza y te dice '
                'cuántas son.'
            ),
        }),
        ('Aprobación', {
            'fields': ('puntaje_aprobacion',),
            'description': (
                'Porcentaje que necesita el estudiante para aprobar. La '
                'corrección la hace el backend comparando contra este valor.'
            ),
        }),
    )
    inlines = [PreguntaInline]

    @admin.display(description='Preguntas')
    def total_preguntas(self, obj):
        total = obj.total_preguntas
        if not total:
            # mark_safe y no format_html: sin marcadores que sustituir,
            # format_html() sin argumentos lanza TypeError en Django 6 y
            # tiraba el changelist entero (500) en cuanto habia una
            # evaluacion sin preguntas.
            return mark_safe('<b style="color:#c00">0 (sin preguntas)</b>')
        return f'{total}'

    def save_related(self, request, form, formsets, change):
        """No deja activar una evaluación sin un banco corregible.

        Va DESPUES de super(), cuando preguntas y opciones ya están en la
        base: total_correctas consulta las filas reales, no el formulario.

        Sin esta comprobación, activar desde /admin una evaluación recién
        creada es el camino natural, y el estudiante se encuentra un quiz sin
        preguntas o con preguntas que nadie puede acertar.
        """
        super().save_related(request, form, formsets, change)

        evaluacion = form.instance
        if not evaluacion.activa:
            return

        total = evaluacion.total_preguntas
        if total == 0:
            raise EvaluacionIncompleta(
                'No se puede activar una evaluación sin preguntas. Agregá al '
                'menos una con sus opciones, o dejala inactiva mientras la '
                'cargas.'
            )

        correctas = total_correctas(evaluacion)
        if correctas != total:
            raise EvaluacionIncompleta(
                f'No se puede activar: {total - correctas} de las {total} '
                'preguntas no tienen exactamente una opción marcada como '
                'correcta.'
            )

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        """Muestra el error de activación como mensaje, no como error 500.

        ValidationError desde save_related sale con la transacción ya
        revertida (por eso no queda nada guardado a medias), pero Django no la
        traduce a algo visible en producción: se vería un 500 sin explicación.

        `object_id` va primero y se pasa explícito a super(): si se omite, el
        admin revienta con TypeError; si se corre un lugar, Django recibe el
        `form_url` como id, que en un alta es '' (no None), y busca un objeto
        con id vacío: en vez del formulario vuelve al índice.
        """
        try:
            return super().changeform_view(
                request, object_id, form_url, extra_context
            )
        except EvaluacionIncompleta as error:
            messages.error(request, ' '.join(error.messages))
            return HttpResponseRedirect(request.get_full_path())


@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'evaluacion', 'es_larga', 'orden')
    list_filter = ('es_larga', 'evaluacion__course')
    search_fields = ('texto', 'contexto')
    fieldsets = (
        ('Pregunta', {
            'fields': ('evaluacion', 'texto', 'contexto', 'es_larga', 'orden'),
            'description': (
                'Una pregunta siempre pertenece a una evaluación, así que el '
                'campo <b>Evaluación</b> es obligatorio. <br>'
                'Si el desplegable está vacío es que todavía no hay ninguna '
                'evaluación cargada: creá una desde '
                '<a href="../evaluacion/">Evaluaciones</a> (dejala inactiva y '
                'escribí las preguntas ahí mismo, es más rápido). Después '
                'volvé a esta pantalla solo para cargarle las opciones, que es '
                'lo único que se hace desde acá. <br>'
                'Orden de carga: evaluación inactiva con sus preguntas → '
                'opciones y correcta en cada pregunta → activar la evaluación.'
            ),
        }),
    )
    inlines = [OpcionInline]


@admin.register(Opcion)
class OpcionAdmin(admin.ModelAdmin):
    list_display = ('texto', 'pregunta', 'es_correcta', 'orden')
    list_filter = ('es_correcta', 'pregunta__evaluacion__course')
    search_fields = ('texto',)

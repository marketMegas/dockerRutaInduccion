from django.db import models

from courses.models import Course


class Evaluacion(models.Model):
    """Examen de un curso: el banco de preguntas vive aca, no en el frontend.

    Antes las preguntas estaban escritas en el JSX (frontend/src/components/
    EvaluacionCurso.jsx, antes QuizAutoGLP.jsx), en tres arrays fijos. Crear un
    curso desde /admin no-producia nada que evaluar y el estudiante se
    encontraba con "este curso aun no tiene evaluacion".
    """

    course = models.ForeignKey(
        Course, related_name='evaluaciones', on_delete=models.CASCADE,
        verbose_name="Curso",
    )
    # Decorativo: es lo que ve el estudiante arriba del quiz. Lo edita quien
    # administra desde /admin, no el codigo.
    titulo = models.CharField(max_length=255, verbose_name="Título")
    # Porcentaje necesario para aprobar. Antes estaba fijo en 90 dentro del
    # JSX, en tres comparaciones distintas (corregir, pintar y habilitar el
    # boton de siguiente). Con el valor aca hay una sola fuente.
    puntaje_aprobacion = models.PositiveSmallIntegerField(
        default=90, verbose_name="Puntaje de aprobación (%)",
    )
    # Solo se sirve la activa: permite dejar un banco de preguntas en Edition
    # sin que los estudiantes lo vean.
    activa = models.BooleanField(default=True, verbose_name="Activa")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = "Evaluación"
        verbose_name_plural = "Evaluaciones"

    def __str__(self):
        return f"{self.course.title} - {self.titulo}"

    @property
    def preguntas_ordenadas(self):
        return list(self.preguntas.all().order_by('orden', 'id'))

    @property
    def total_preguntas(self):
        return self.preguntas.count()


class Pregunta(models.Model):
    evaluacion = models.ForeignKey(
        Evaluacion, related_name='preguntas', on_delete=models.CASCADE,
        verbose_name="Evaluación",
    )
    texto = models.TextField(verbose_name="Pregunta")
    # Parrafo de apoyo (un caso de negocio, una situacion). Texto plano con
    # saltos de linea: el frontend lo pinta con whitespace-pre-line.
    contexto = models.TextField(blank=True, default="", verbose_name="Contexto")
    # Las preguntas con textos largos se renderizan en cuerpo pequeno para que
    # quepan las cuatro opciones sin que la tarjeta se desborde.
    es_larga = models.BooleanField(default=False, verbose_name="Texto largo")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = "Pregunta"
        verbose_name_plural = "Preguntas"

    def __str__(self):
        return f"{self.evaluacion.titulo} - {self.texto[:60]}"

    @property
    def opciones_ordenadas(self):
        return list(self.opciones.all().order_by('orden', 'id'))

    @property
    def opcion_correcta(self):
        return next((o for o in self.opciones_ordenadas if o.es_correcta), None)


class Opcion(models.Model):
    pregunta = models.ForeignKey(
        Pregunta, related_name='opciones', on_delete=models.CASCADE,
        verbose_name="Pregunta",
    )
    texto = models.TextField(verbose_name="Opción")
    # Bandera y no FK desde Pregunta: asi se marca la correcta en la misma
    # pantalla donde se escriben las opciones, sin guardar la pregunta antes.
    # El admin obliga a que haya exactamente una (ver admin.py).
    es_correcta = models.BooleanField(default=False, verbose_name="Correcta")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = "Opción"
        verbose_name_plural = "Opciones"

    def __str__(self):
        return self.texto[:60]

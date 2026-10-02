import secrets

from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    ICON_CHOICES = [
        ('Bot', 'Bot'),
        ('Users', 'Users'),
        ('Megaphone', 'Megaphone'),
        ('LineChart', 'LineChart'),
    ]

    title = models.CharField(max_length=255, verbose_name="Título")
    description = models.TextField(verbose_name="Descripción")
    cover_image = models.URLField(null=True, blank=True, verbose_name="URL de la imagen de portada")
    icon_type = models.CharField(
        max_length=50, choices=ICON_CHOICES, default='Bot', verbose_name="Icono"
    )
    accent_color = models.CharField(
        max_length=50, default='bg-[#f6811e]', verbose_name="Color (clase Tailwind)"
    )
    badge = models.CharField(max_length=50, default='Nuevo', verbose_name="Etiqueta")
    level = models.CharField(max_length=50, default='Básico', verbose_name="Nivel")
    duration = models.CharField(max_length=50, default='1h', verbose_name="Duración total")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"

class Module(models.Model):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE, verbose_name="Curso")
    title = models.CharField(max_length=255, verbose_name="Título del módulo")
    order = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ['order']
        verbose_name = "Módulo"
        verbose_name_plural = "Módulos"

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    module = models.ForeignKey(Module, related_name='lessons', on_delete=models.CASCADE, verbose_name="Módulo")
    title = models.CharField(max_length=255, verbose_name="Título de la lección")
    video_url = models.URLField(verbose_name="URL del video")
    duration = models.CharField(max_length=50, verbose_name="Duración (ej. 12:30)")
    content_text = models.TextField(blank=True, verbose_name="Contenido escrito")
    order = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ['order']
        verbose_name = "Lección"
        verbose_name_plural = "Lecciones"

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class UserProgress(models.Model):
    # El uid de Firebase de la persona. No es un campo libre: lo escribe
    # `@requiere_estudiante` con el `sub` del ID token verificado, asi que si
    # esta fila existe, es de alguien con sesion y con alta en Django.
    user_id = models.CharField(max_length=255, verbose_name="ID de Usuario")
    course_id = models.CharField(max_length=255, verbose_name="ID de Curso")
    lesson_id = models.CharField(max_length=255, verbose_name="ID de Lección")
    completado = models.BooleanField(default=False, verbose_name="Completado")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        unique_together = ('user_id', 'course_id', 'lesson_id')
        verbose_name = "Progreso de Usuario"
        verbose_name_plural = "Progresos de Usuarios"

    def __str__(self):
        return f"{self.user_id} - Curso {self.course_id} - Lección {self.lesson_id} ({'Completado' if self.completado else 'En curso'})"

class Calificacion(models.Model):
    user_id = models.CharField(max_length=255, verbose_name="ID de Usuario")
    # Identidad real del usuario: user_id es el uid de Firebase, opaco, y el
    # aviso de aprobacion necesita un nombre y un correo legibles.
    user_name = models.CharField(max_length=255, blank=True, default="", verbose_name="Nombre del Usuario")
    user_email = models.EmailField(blank=True, default="", verbose_name="Correo del Usuario")
    course_id = models.CharField(max_length=255, verbose_name="ID de Curso")
    course_name = models.CharField(max_length=255, verbose_name="Nombre del Curso")
    # Que evaluacion se rindio, cuando ya se rindio una. NULL a proposito: las
    # notas anteriores a este modulo no tienen evaluacion que apuntar, y la
    # ruta vieja de guardar_calificacion (que no manda respuestas) sigue
    # guardando notas sin evaluacion.
    evaluacion = models.ForeignKey(
        'evaluaciones.Evaluacion', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='calificaciones',
        verbose_name="Evaluación",
    )
    score = models.IntegerField(default=0, verbose_name="Puntaje")
    total_questions = models.IntegerField(default=0, verbose_name="Total Preguntas")
    percentage = models.IntegerField(default=0, verbose_name="Porcentaje")
    passed = models.BooleanField(default=False, verbose_name="Aprobado")
    fecha_creacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        unique_together = ('user_id', 'course_id')
        verbose_name = "Calificación"
        verbose_name_plural = "Calificaciones"

    def __str__(self):
        return f"{self.user_id} - {self.course_name}: {self.percentage}% ({'Aprobado' if self.passed else 'No aprobado'})"

class Certificado(models.Model):
    # Registro de cada certificado emitido. Antes el unico rastro era el PDF en
    # media/Certificados_Emitidos/, y si el SMTP se caia no quedaba nada de que
    # se habia emitido: el curso igual llegaba a 100% y el usuario descargaba
    # normal, pero internamente nadie se enteraba.
    user_id = models.CharField(max_length=255, verbose_name="ID de Usuario")
    user_name = models.CharField(max_length=255, blank=True, default="", verbose_name="Nombre del Usuario")
    user_email = models.EmailField(blank=True, default="", verbose_name="Correo del Usuario")
    course_id = models.CharField(max_length=255, verbose_name="ID de Curso")
    course_name = models.CharField(max_length=255, verbose_name="Nombre del Curso")
    # Ruta relativa dentro de MEDIA_ROOT, la que devuelve default_storage.save.
    archivo = models.CharField(max_length=500, verbose_name="Archivo")
    # El unico secreto de la fila, y por que el certificado NO se pide solo con
    # user_id + course_id: esta vista es la unica que no exige sesion (ver
    # courses.views.descargar_certificado), asi que sin este token cualquiera
    # que supiera el uid de otro estudiante se bajaba su documento. Con el resto
    # de la API ya cerrada por sesion, el token sigue haciendo falta igual: el
    # PDF se manda por correo y su enlace tiene que abrir sin sesion.
    # Va fuera del admin a proposito: editarlo a mano invalidaría los enlaces
    # ya repartidos.
    token = models.CharField(max_length=64, unique=True, editable=False, default='')
    notificado = models.BooleanField(default=False, verbose_name="Notificado")
    notificacion_error = models.TextField(blank=True, default="", verbose_name="Error de notificación")
    intentos = models.PositiveIntegerField(default=0, verbose_name="Intentos de envío")
    fecha_emision = models.DateTimeField(auto_now=True, verbose_name="Fecha de emisión")

    class Meta:
        # Reemitir actualiza la fila en vez de duplicarla: "Finalizar Curso" se
        # puede apretar muchas veces y lo que importa es el estado del ultimo
        # intento, no tener un historial de casi-identicos.
        unique_together = ('user_id', 'course_id')
        ordering = ['-fecha_emision']
        verbose_name = "Certificado"
        verbose_name_plural = "Certificados"

    def __str__(self):
        estado = 'notificado' if self.notificado else 'sin notificar'
        return f"{self.user_name or self.user_id} - {self.course_name} ({estado})"

    @staticmethod
    def nuevo_token():
        return secrets.token_urlsafe(32)

    def save(self, *args, **kwargs):
        # El token se genera aqui y no en la vista: `token` es unique y las
        # filas viejas quedaron en '', asi que si dependiera de que cada
        # camino de alta se acuerde, el segundo certificado choca contra la
        # restriccion y el alta muere con un error de integridad que no explica
        # nada. Ademas, si el token estuviera regenerandose en cada guardado,
        # un reenvio desde el panel invalidaria los enlaces ya repartidos: solo
        # se genera cuando esta vacio.
        if not self.token:
            self.token = self.nuevo_token()
        super().save(*args, **kwargs)


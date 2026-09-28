from django.db import models


class Thread(models.Model):
    """Tema del foro."""
    titulo = models.CharField(max_length=255)
    contenido = models.TextField()
    autor = models.CharField(max_length=150)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Tema'
        verbose_name_plural = 'Temas'

    def __str__(self):
        return f"[{self.id}] {self.titulo} — {self.autor}"


class Post(models.Model):
    """Comentario dentro de un tema."""
    tema = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name='comentarios'
    )
    contenido = models.TextField()
    autor = models.CharField(max_length=150)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['fecha_creacion']
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'

    def __str__(self):
        return f"Comentario de {self.autor} en Tema #{self.tema_id}"

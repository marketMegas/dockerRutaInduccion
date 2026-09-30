"""Carga uno de los bancos de preguntas del JSON a un curso.

Las preguntas de los 3 cursos vivian escritas en el frontend
(frontend/src/components/QuizAutoGLP.jsx, antes de existir este modulo) en tres
arrays fijos. Este comando las trae a la base, de a un banco por curso:

    manage.py cargar_evaluaciones --listar
    manage.py cargar_evaluaciones --curso 1 --banco 1
    manage.py cargar_evaluaciones --curso 2 --banco 2 --puntaje 80

Por que un comando y no una migracion automatica: los ids de curso no son
estables. En la base de trabajo el pk 2 se titula "Curso 1", y una migracion
que asigna por pk le cuelga el banco del curso 2 al curso que en pantalla se
llama "Curso 1", sin avisar. Con un comando, el que carga el banco mira el
titulo del curso antes de confirmar, y equivocarse es visible.

Es idempotente: si el curso ya tiene una evaluacion activa con ese titulo, no
hace nada y lo dice. Con --reemplazar la borra y la vuelve a cargar.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from courses.models import Course

from evaluaciones.models import Evaluacion, Opcion, Pregunta

# evaluations/management/commands/cargar_evaluaciones.py -> la app es
# parents[2] (0=commands, 1=management, 2=evaluaciones).
RUTA_SEED = Path(__file__).resolve().parents[2] / 'datos' / 'quizzes_existentes.json'


def leer_bancos():
    """Los bancos del JSON de seed, ya validados para poder cargarse."""
    datos = json.loads(RUTA_SEED.read_text(encoding='utf-8'))
    bancos = datos.get('bancos') or []

    for entrada in bancos:
        numero = entrada.get('banco')
        if numero is None:
            raise CommandError(f'El JSON tiene un banco sin número: {entrada}')

        for i, pregunta in enumerate(entrada.get('preguntas') or [], start=1):
            correctas = [o for o in pregunta.get('opciones') or [] if o.get('es_correcta')]
            if len(correctas) != 1:
                raise CommandError(
                    f'Banco {numero}, pregunta {i}: tiene {len(correctas)} '
                    'opciones marcadas como correctas y necesita exactamente '
                    'una. No se carga nada.'
                )

    return bancos


class Command(BaseCommand):
    help = 'Carga un banco de preguntas del JSON de seed a un curso.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--listar', action='store_true',
            help='Muestra los bancos disponibles y los cursos de la base, y sale.',
        )
        parser.add_argument(
            '--curso', type=int,
            help='pk del curso destino. Es el número que sale en /admin → Cursos.',
        )
        parser.add_argument(
            '--banco', type=int,
            help='Número de banco del JSON (ver --listar).',
        )
        parser.add_argument(
            '--titulo',
            help='Título de la evaluación. Por defecto, el del banco.',
        )
        parser.add_argument(
            '--puntaje', type=int,
            help='Porcentaje para aprobar. Por defecto, el del banco (90).',
        )
        parser.add_argument(
            '--reemplazar', action='store_true',
            help='Borra la evaluación del curso con el mismo título y la vuelve a cargar.',
        )

    def handle(self, *args, **opciones):
        bancos = leer_bancos()

        if opciones['listar']:
            self._listar(bancos)
            return

        if not opciones['curso'] or not opciones['banco']:
            raise CommandError(
                'Falta --curso o --banco. Usa --listar para ver qué hay.'
            )

        banco = next((b for b in bancos if b['banco'] == opciones['banco']), None)
        if banco is None:
            raise CommandError(
                f'No existe el banco {opciones["banco"]}. Hay: '
                + ', '.join(str(b['banco']) for b in bancos)
            )

        curso = Course.objects.filter(pk=opciones['curso']).first()
        if curso is None:
            raise CommandError(
                f'No existe el curso con pk {opciones["curso"]}. '
                'Fijate en el número de la URL de /admin → Cursos.'
            )

        titulo = opciones['titulo'] or banco['titulo']
        self._cargar(curso, banco, titulo, opciones)

    def _listar(self, bancos):
        self.stdout.write(self.style.MIGRATE_HEADING('Bancos disponibles'))
        for banco in bancos:
            self.stdout.write(
                f'  banco {banco["banco"]}: {len(banco["preguntas"])} preguntas, '
                f'título "{banco["titulo"]}"\n      {banco["descripcion"]}'
            )

        self.stdout.write(self.style.MIGRATE_HEADING('Cursos en la base'))
        cursos = Course.objects.all().order_by('id')
        if not cursos:
            self.stdout.write('  (no hay cursos)')
            return
        for curso in cursos:
            activas = curso.evaluaciones.filter(activa=True)
            estado = ', '.join(f'"{e.titulo}"' for e in activas) or 'sin evaluación'
            self.stdout.write(
                f'  pk {curso.id}: {curso.title} '
                f'({curso.modules.count()} módulos) -> {estado}'
            )

        self.stdout.write(
            '\nPara cargar: manage.py cargar_evaluaciones --curso <pk> --banco <n>'
        )

    def _cargar(self, curso, banco, titulo, opciones):
        existente = curso.evaluaciones.filter(titulo=titulo).first()
        if existente and not opciones['reemplazar']:
            raise CommandError(
                f'El curso ya tiene una evaluación llamada "{titulo}" '
                f'(pk {existente.id}, {existente.total_preguntas} preguntas). '
                'Usá --reemplazar si querés recargarla.'
            )

        puntaje = opciones['puntaje']
        if puntaje is None:
            puntaje = banco.get('puntaje_aprobacion', 90)
        if not 0 < puntaje <= 100:
            raise CommandError(
                f'El puntaje de aprobación tiene que estar entre 1 y 100; llegó {puntaje}.'
            )

        # Todo o nada: una carga a medias dejaría una evaluación activa con la
        # mitad de las preguntas, que es justo lo que el admin no deja guardar.
        with transaction.atomic():
            if existente:
                self.stdout.write(
                    self.style.WARNING(
                        f'Reemplazando "{titulo}" (pk {existente.id}): sus '
                        f'{existente.total_preguntas} preguntas se borran. Las '
                        'notas ya guardadas quedan huerfanas (no se pierden).'
                    )
                )
                existente.delete()

            evaluacion = Evaluacion.objects.create(
                course=curso,
                titulo=titulo,
                puntaje_aprobacion=puntaje,
                activa=True,
                orden=0,
            )

            preguntas = 0
            opciones_creadas = 0
            for i, pregunta in enumerate(banco['preguntas'], start=1):
                nueva = Pregunta.objects.create(
                    evaluacion=evaluacion,
                    texto=pregunta['texto'],
                    contexto=pregunta.get('contexto', ''),
                    es_larga=pregunta.get('es_larga', False),
                    orden=i,
                )
                for j, opcion in enumerate(pregunta['opciones'], start=1):
                    Opcion.objects.create(
                        pregunta=nueva,
                        texto=opcion['texto'],
                        es_correcta=opcion['es_correcta'],
                        orden=j,
                    )
                    opciones_creadas += 1
                preguntas += 1

        self.stdout.write(self.style.SUCCESS(
            f'Cargado en "{curso.title}" (pk {curso.id}): "{titulo}" con '
            f'{preguntas} preguntas y {opciones_creadas} opciones. '
            f'Aprueba con {puntaje}%.'
        ))
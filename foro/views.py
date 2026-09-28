import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404

from .models import Thread, Post


# ──────────────────────────────────────────────
# HELPER: serializar un Thread a dict
# ──────────────────────────────────────────────
def thread_to_dict(thread):
    return {
        'id': thread.id,
        'titulo': thread.titulo,
        'contenido': thread.contenido,
        'autor': thread.autor,
        'fecha_creacion': thread.fecha_creacion.isoformat(),
    }


# ──────────────────────────────────────────────
# HELPER: serializar un Post a dict
# ──────────────────────────────────────────────
def post_to_dict(post):
    return {
        'id': post.id,
        'tema_id': post.tema_id,
        'contenido': post.contenido,
        'autor': post.autor,
        'fecha_creacion': post.fecha_creacion.isoformat(),
    }


# ──────────────────────────────────────────────
# GET  /api/foro/temas/      → listar todos los temas
# POST /api/foro/temas/      → crear un nuevo tema
# ──────────────────────────────────────────────
@csrf_exempt
@require_http_methods(["GET", "POST"])
def temas(request):
    if request.method == "GET":
        todos = Thread.objects.all()
        data = [thread_to_dict(t) for t in todos]
        return JsonResponse(data, safe=False)

    # POST
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    titulo = body.get('titulo', '').strip()
    contenido = body.get('contenido', '').strip()
    autor = body.get('autor', '').strip()

    if not titulo or not contenido or not autor:
        return JsonResponse(
            {'error': 'Los campos titulo, contenido y autor son obligatorios.'},
            status=400
        )

    thread = Thread.objects.create(
        titulo=titulo,
        contenido=contenido,
        autor=autor,
    )
    return JsonResponse(thread_to_dict(thread), status=201)


# ──────────────────────────────────────────────
# GET  /api/foro/temas/<tema_id>/comentarios/  → listar comentarios del tema
# POST /api/foro/temas/<tema_id>/comentarios/  → crear comentario en el tema
# ──────────────────────────────────────────────
@csrf_exempt
@require_http_methods(["GET", "POST"])
def comentarios(request, tema_id):
    tema = get_object_or_404(Thread, pk=tema_id)

    if request.method == "GET":
        posts = tema.comentarios.all()
        data = [post_to_dict(p) for p in posts]
        return JsonResponse(data, safe=False)

    # POST
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    contenido = body.get('contenido', '').strip()
    autor = body.get('autor', '').strip()

    if not contenido or not autor:
        return JsonResponse(
            {'error': 'Los campos contenido y autor son obligatorios.'},
            status=400
        )

    post = Post.objects.create(
        tema=tema,
        contenido=contenido,
        autor=autor,
    )
    return JsonResponse(post_to_dict(post), status=201)

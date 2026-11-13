#!/bin/bash
# ============================================================
#  deploy.sh — despliegue en el VPS.
#
#  Este archivo, docker-compose.prod.yml y backup.sh estan en la
#  raiz del repo a proposito: un `git clone` los deja donde se
#  necesitan y este script corre sin instalar nada a mano.
#
#  Uso:
#    /root/induccion-megas/deploy.sh
#
#  Rollback:
#    APP_VERSION=<commit anterior> docker compose \
#      -f /root/induccion-megas/docker-compose.prod.yml up -d
#    (si el deploy corrio migraciones, restaurar antes el backup
#     de db.sqlite3 que hizo backup.sh)
# ============================================================
set -euo pipefail

APP_DIR=/root/induccion-megas
cd "$APP_DIR"

# --- Preflight ------------------------------------------------
# Todo lo que sigue falla con un error incomprensible si falta una
# de estas cosas, asi que se comprueba antes de tocar nada.

[ -f docker-compose.prod.yml ] || { echo "FALTA docker-compose.prod.yml en $APP_DIR" >&2; exit 1; }
[ -f backup.sh ]              || { echo "FALTA backup.sh en $APP_DIR" >&2; exit 1; }

if [ ! -f .env ]; then
    echo "FALTA .env en $APP_DIR" >&2
    echo "  Plantilla: filesParaDeploy/.env.produccion (trae marcadores CAMBIAR_*)" >&2
    echo "  Copiala, rellena SECRET_KEY con 'openssl rand -base64 48' y chmod 600" >&2
    exit 1
fi

# El compose usa la sintaxis :? en SECRET_KEY y FIREBASE_PROJECT_ID, asi
# que si faltan el arranque falla con un error del shell que no dice que
# es el .env. Se avisa aqui, donde si se entiende.
for v in SECRET_KEY FIREBASE_PROJECT_ID EMAIL_HOST_USER EMAIL_HOST_PASSWORD NOTIF_DESTINATARIOS; do
    if [ -z "$(grep -E "^$v=" .env | cut -d= -f2-)" ]; then
        echo "FALTA $v en .env (el compose no levanta el backend sin ella)" >&2
        exit 1
    fi
done

# data/ y media/ estan fuera de git (ahi vive el estado de la app). El
# touch NO es opcional: si data/db.sqlite3 no existe como ARCHIVO, docker
# crea un DIRECTORIO con ese nombre y el backend no arranca.
mkdir -p "$APP_DIR/data" "$APP_DIR/media"
[ -f "$APP_DIR/data/db.sqlite3" ] || touch "$APP_DIR/data/db.sqlite3"

# Un pull con cambios locales se negate en vez de sobrescribirlos, y un
# `set -e` a media ejecucion deja la app en un estado raro. Se corta antes.
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "HAY CAMBIOS LOCALES sin commitear. El pull los pisaria." >&2
    git status --short >&2
    exit 1
fi

# --- Deploy ---------------------------------------------------

echo "==> Bajando codigo"
git pull --ff-only

# Etiqueta las imagenes con el commit: dos deploys del mismo commit dan
# las mismas imagenes, y volver atras es cambiar una variable.
export APP_VERSION=$(git rev-parse --short HEAD)
echo "==> Version: $APP_VERSION"

echo "==> Backup previo al deploy (por si hay migraciones)"
"$APP_DIR/backup.sh" || echo "AVISO: el backup fallo, revisar antes de seguir"

echo "==> Construyendo imagenes"
docker compose -f docker-compose.prod.yml build

echo "==> Levantando servicios"
docker compose -f docker-compose.prod.yml up -d

echo "==> Limpiando imagenes viejas"
# `docker image prune -f` SOLO borra imagenes huerfanas. Como cada deploy
# etiqueta las suyas con el commit, sin esto se acumulan ~400 MB por
# deploy y el disco del VPS se llena a los pocos deploys.
# Se conservan la actual y la anterior para que el rollback documentado
# siga teniendo con que correr.
docker image prune -f
mapfile -t viejos < <(
    docker images --filter reference='induccion-megas-*' --format '{{.CreatedAt}}|{{.Tag}}' \
        | grep -v '<none>' | sort -r | tail -n +3 | cut -d'|' -f2 | sort -u
)
for t in "${viejos[@]}"; do
    echo "    borrando induccion-megas-*:$t"
    docker image rm -f "induccion-megas-backend:$t" "induccion-megas-frontend:$t" 2>/dev/null || true
done

echo "==> Listo. Verificacion rapida:"
echo "    docker compose -f docker-compose.prod.yml ps"
echo "    docker compose -f docker-compose.prod.yml logs --tail=40 backend"
echo "    curl -s https://megas.com.co/api/cursos/ | head -c 200"
#!/bin/bash
# ============================================================
#  deploy.sh — despliegue en el VPS.
#
#  Instalacion:
#    cp filesParaDeploy/deploy.sh /root/induccion-megas/deploy.sh
#    chmod +x /root/induccion-megas/deploy.sh
#
#  Uso:
#    /root/induccion-megas/deploy.sh
#
#  Rollback:
#    APP_VERSION=<commit_anterior> docker compose \
#      -f /root/induccion-megas/docker-compose.prod.yml up -d
#    (si el deploy corrio migraciones, restaurar antes el backup
#     de db.sqlite3 que hizo backup.sh)
# ============================================================
set -euo pipefail

APP_DIR=/root/induccion-megas
cd "$APP_DIR"

echo "==> Bajando codigo"
git pull

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
docker image prune -f

echo "==> Listo. Verificacion rapida:"
echo "    curl -s https://megas.com.co/api/cursos/ | head -c 200"
echo "    docker compose -f docker-compose.prod.yml ps"

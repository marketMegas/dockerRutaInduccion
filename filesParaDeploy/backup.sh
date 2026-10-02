#!/bin/bash
# ============================================================
#  backup.sh — backup diario de la base y los certificados.
#
#  db.sqlite3 y media/ son TODO el estado de la aplicacion: estan
#  fuera de las imagenes y de git. Si se pierden, no hay rebuild
#  que los recupere.
#
#  Instalacion:
#    cp filesParaDeploy/backup.sh /root/induccion-megas/backup.sh
#    chmod +x /root/induccion-megas/backup.sh
#    # cron diario a las 3:00 AM:
#    (crontab -l; echo "0 3 * * * /root/induccion-megas/backup.sh") | crontab -
#
#  Requiere sqlite3 en el host:  sudo apt install -y sqlite3
# ============================================================
set -euo pipefail

APP_DIR=/root/induccion-megas
BACKUP_ROOT=/root/backups
RETENCION_DIAS=14

TS=$(date +%Y%m%d-%H%M)
DEST="$BACKUP_ROOT/$TS"
mkdir -p "$DEST"

# .backup de sqlite3 y NO cp: cp puede copiar la base en mitad de una
# escritura y dejar un archivo corrupto que parece backup valido.
sqlite3 "$APP_DIR/data/db.sqlite3" ".backup '$DEST/db.sqlite3'"

# Certificados PDF emitidos.
cp -r "$APP_DIR/media" "$DEST/media"

# Retencion: borra backups de mas de RETENCION_DIAS.
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -mtime +$RETENCION_DIAS -exec rm -rf {} \;

echo "Backup creado en $DEST"

# Recomendado: copia fuera del VPS (un backup en el mismo disco no salva
# de un VPS perdido). Ejemplo con rclone configurado:
#   rclone copy "$DEST" remote:backups-gmax/$TS

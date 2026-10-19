#!/usr/bin/env bash
# Arranque local en Linux (sin Docker), equivalente de dev.ps1.
# Backend Django en 127.0.0.1:8000 y dev server de Vite en 5173, que ya hace
# proxy de /api hacia el backend (frontend/vite.config.js).
#
# Uso:
#   ./dev.sh              arranca backend + frontend
#   ./dev.sh -solo-backend  solo Django
#   ./dev.sh -solo-frontend solo Vite
#   ./dev.sh -detener     para los dos
#
# Por que carga el .env a mano: core_project/settings.py lee de os.environ y
# python-dotenv NO esta en requirements.txt. El .env solo lo interpreta Docker
# Compose. Sin esto, SECRET_KEY cae al fallback de desarrollo y DEBUG se queda
# en False.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root"

solo_backend=false
solo_frontend=false
detener=false
for arg in "$@"; do
    case "$arg" in
        -solo-backend|-SoloBackend) solo_backend=true ;;
        -solo-frontend|-SoloFrontend) solo_frontend=true ;;
        -detener|-Detener) detener=true ;;
        *) echo "Opcion desconocida: $arg" >&2; exit 1 ;;
    esac
done

log_dir="$root/scratch/logs"

function detener_todo {
    pkill -f "manage.py runserver 127.0.0.1:8000" 2>/dev/null || true
    # Repetir hasta que no quede nada: con autoreload hay un reloader padre que
    # relanza al hijo si este muere, y matando en una sola pasada podia quedar
    # vivo un reloader serviendo codigo viejo (ver dev.ps1).
    for _ in $(seq 1 10); do
        pgrep -f "manage.py runserver" >/dev/null || break
        pkill -9 -f "manage.py runserver" 2>/dev/null || true
        sleep 0.5
    done
    pkill -f "frontend/node_modules/.bin/vite" 2>/dev/null || true
    pkill -f "frontend/node_modules/vite/bin" 2>/dev/null || true
}

if $detener; then
    detener_todo
    echo "Backend y frontend detenidos."
    exit 0
fi

if $solo_backend && $solo_frontend; then
    echo "Usa -solo-backend o -solo-frontend, no los dos." >&2
    exit 1
fi

# --- Cargar .env al entorno del proceso -------------------------
if [[ ! -f .env ]]; then
    echo "No existe .env. Copia .env.produccion y ajusta DEBUG y ALLOWED_HOSTS." >&2
    exit 1
fi
set -a
# shellcheck disable=SC1091
. ./.env
set +a
echo "DEBUG=$DEBUG  ALLOWED_HOSTS=$ALLOWED_HOSTS"

if ! $solo_frontend; then
    py="$root/.venv/bin/python"
    if [[ ! -x "$py" ]]; then
        echo "No existe $py. Crea el venv: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
        exit 1
    fi

    mkdir -p "$log_dir"
    out_log="$log_dir/backend.out.log"
    err_log="$log_dir/backend.err.log"

    detener_todo
    # Con autoreload (sin --noreload): el watcher de Django relanza el backend
    # solo cuando cambia un .py, igual que en dev.ps1.
    "$py" manage.py runserver 127.0.0.1:8000 >"$out_log" 2>"$err_log" &
    proc=$!

    listo=false
    for _ in $(seq 1 30); do
        sleep 0.5
        # -o /dev/null y sin -f: se busca el 200 del admin, que responde
        # siempre; el foro puede dar 401 si firebase no esta disponible.
        code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 \
            http://127.0.0.1:8000/admin/login/ 2>/dev/null || echo 000)
        if [[ "$code" != "000" ]]; then listo=true; break; fi
        kill -0 "$proc" 2>/dev/null || break
    done

    if $listo; then
        echo "Backend   listo en http://127.0.0.1:8000"
    else
        echo "Backend   NO respondio. Log:" >&2
        tail -n 20 "$err_log" >&2 || true
        exit 1
    fi
fi

if ! $solo_backend; then
    echo
    echo "Frontend  http://localhost:5173/rutainduccion/"
    echo "Admin     http://127.0.0.1:8000/admin/"
    echo "Ctrl+C para parar el frontend (el backend sigue en background)."
    echo
    cd "$root/frontend"
    exec npm run dev
fi

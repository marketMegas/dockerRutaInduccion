# ============================================================
#  Arranque local en Windows (sin Docker).
#  Levanta el backend Django en 127.0.0.1:8000 y el dev server
#  de Vite en 5173, que ya hace proxy de /api hacia el backend.
#
#  Uso:
#    .\dev.ps1              arranca backend + frontend
#    .\dev.ps1 -SoloBackend solo Django
#    .\dev.ps1 -SoloFrontend solo Vite
#    .\dev.ps1 -Detener     para los dos
#
#  Por que carga el .env a mano: core_project/settings.py lee de
#  os.environ y python-dotenv NO esta en requirements.txt. El .env
#  solo lo interpreta Docker Compose. Sin esto, SECRET_KEY cae al
#  fallback de desarrollo y DEBUG se queda en False.
# ============================================================
param(
    [switch]$SoloBackend,
    [switch]$SoloFrontend,
    [switch]$Detener
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$envFile = Join-Path $root '.env'
$logDir = Join-Path $root 'scratch\logs'

function Stop-Node {
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
        Where-Object { $_.CommandLine -like "*$root\frontend*" } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

    # Repetir hasta que no quede nada, en vez de una sola pasada.
    # Con autoreload hay un reloader padre que relanza al hijo si este muere
    # (restart_with_reloader respawna en loop). Matando en una sola pasada y en
    # orden arbitrario, era cuestión de tiempo que un reloader sobreviviera a
    # su hijo: cada corrida de dev.ps1 dejaba un nivel más de runserver
    # encadenado, y el que atendía el puerto 8000 era el más viejo, sirviendo
    # código viejo. Por eso el bucle.
    for ($i = 0; $i -lt 10; $i++) {
        $servidores = Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
            Where-Object { $_.CommandLine -like '*manage.py*runserver*' }
        if (-not $servidores) { break }
        $servidores | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Milliseconds 500
    }
}

if ($Detener) {
    Stop-Node
    Write-Host 'Backend y frontend detenidos.' -ForegroundColor Yellow
    exit 0
}

if ($SoloBackend -and $SoloFrontend) {
    Write-Error 'Usa -SoloBackend o -SoloFrontend, no los dos.'
    exit 1
}

# --- Cargar .env al entorno del proceso -------------------------
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $i = $line.IndexOf('=')
        if ($i -gt 0) {
            [Environment]::SetEnvironmentVariable(
                $line.Substring(0, $i).Trim(),
                $line.Substring($i + 1).Trim(),
                'Process'
            )
        }
    }
}
Write-Host "DEBUG=$env:DEBUG  ALLOWED_HOSTS=$env:ALLOWED_HOSTS" -ForegroundColor DarkGray

$frontendUrl = 'http://localhost:5173/rutainduccion/'

if (-not $SoloFrontend) {
    $py = Join-Path $root '.venv\Scripts\python.exe'
    if (-not (Test-Path $py)) {
        Write-Error "No existe $py. Crea el venv: py -3.14 -m venv .venv"
        exit 1
    }

    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    $outLog = Join-Path $logDir 'backend.out.log'
    $errLog = Join-Path $logDir 'backend.err.log'

    Stop-Node
    # Con autoreload (sin --noreload): el watcher de Django relanza el backend
    # solo cuando cambia un .py. Antes fijabamos el proceso en el codigo del
    # arranque y hacia falta reiniciar a mano, que es la forma facil de
    # perder tiempo depurando cambios que ya estaban aplicados.
    # Stop-Node sigue limpiando los dos procesos: el padre y el hijo que
    # lanza el watcher relanzan con `python -m django manage.py runserver ...`,
    # que tambien matchea *manage.py*runserver*.
    $proc = Start-Process -FilePath $py `
        -ArgumentList 'manage.py', 'runserver', '127.0.0.1:8000' `
        -WorkingDirectory $root `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -WindowStyle Hidden -PassThru

    $ready = $false
    foreach ($_ in 1..30) {
        Start-Sleep -Milliseconds 500
        try {
            $r = Invoke-WebRequest 'http://127.0.0.1:8000/api/foro/temas/' -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -lt 500) { $ready = $true; break }
        } catch {
            if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -lt 500) { $ready = $true; break }
        }
        if ($proc.HasExited) { break }
    }

    if ($ready) {
        Write-Host 'Backend   listo en http://127.0.0.1:8000' -ForegroundColor Green
    } else {
        Write-Host 'Backend   NO respondio. Log:' -ForegroundColor Red
        Get-Content $errLog -Tail 20 -ErrorAction SilentlyContinue
        exit 1
    }
}

if (-not $SoloBackend) {
    Write-Host ''
    Write-Host 'Frontend  http://localhost:5173/rutainduccion/' -ForegroundColor Green
    Write-Host 'Admin     http://127.0.0.1:8000/admin/' -ForegroundColor Green
    Write-Host 'Ctrl+C para parar el frontend (el backend sigue en background).' -ForegroundColor DarkGray
    Write-Host ''
    Push-Location (Join-Path $root 'frontend')
    try { & npm.cmd run dev } finally { Pop-Location }
}

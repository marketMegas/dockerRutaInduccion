# dockerRutaInduccion

Plataforma de la Ruta de Inducción: backend Django, frontend React (Vite), autenticación con
Firebase y despliegue en Docker.

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Backend | Django + gunicorn | 8000 (interno, nunca publicado) |
| Frontend | React + Vite + Tailwind, servido por nginx | 5137 (loopback) |
| Base de datos | SQLite | `data/db.sqlite3` (fuera de git) |
| Autenticación | Firebase Auth (cliente) + verificación de token en Django | — |

---

## Estructura

```
.
├── core_project/           settings.py, urls.py, wsgi.py
├── courses/                cursos, calificaciones, certificados
├── evaluaciones/           evaluaciones de los cursos
├── foro/                   foro
├── usuarios/               permisos y verificación del token de Firebase
├── frontend/               SPA de React
│   ├── src/config/firebase.js    config del cliente web
│   └── tests/                    pruebas de las reglas de Firestore
├── filesParaDeploy/        lo que se copia al VPS (ver "Despliegue")
├── nginx.conf              nginx del contenedor frontend
├── docker-compose.yml      desarrollo
├── dev.sh / dev.ps1        arranque local SIN Docker
└── requirements.txt        versiones fijadas a propósito
```

---

## Desarrollo local (sin Docker)

```bash
./dev.sh                    # backend + frontend
./dev.sh -solo-backend      # solo Django
./dev.sh -solo-frontend     # solo Vite
./dev.sh -detener           # parar ambos
```

Deja el backend en `127.0.0.1:8000` y el frontend en `http://localhost:5173/rutainduccion/`.
El dev server de Vite ya proxea `/api` al backend (`frontend/vite.config.js`).

### Por qué `dev.sh` carga el `.env` a mano

`core_project/settings.py` lee de `os.environ`, y **`python-dotenv` NO está en
`requirements.txt`**. El `.env` solo lo interpreta Docker Compose. Sin las líneas

```bash
set -a; . ./.env; set +a
```

`SECRET_KEY` cae al fallback `'dev-only-insecure-cambiar-en-produccion'` y `DEBUG` se queda en
`False`, que en tu máquina es un error silencioso.

Dos detalles más que `dev.sh` resuelve y que conviene no perder al portarlo a otro lenguaje:

- **Espera a que el backend responda** antes de arrancar el frontend, sondeando
  `/admin/login/`. Ese endpoint es el correcto porque el foro puede devolver `401` si Firebase
  no está disponible, el admin siempre responde.
- **`detener_todo` repite el `pkill` hasta 10 veces.** Con `--autoreload` Django deja un proceso
  padre que relanza al hijo; matar en una sola pasada puede dejar vivo al padre sirviendo código
  viejo.

---

## Docker

Hay dos composes y **no son intercambiables**:

| | `docker-compose.yml` | `docker-compose.prod.yml` |
|---|---|---|
| Uso | tu máquina | el VPS |
| Código | bind mount `.:/app` (edición en caliente) | la **imagen** es la fuente de verdad |
| Datos | `./db.sqlite3` | `/root/induccion-megas/data/db.sqlite3` |
| Tag de imagen | ninguna | `APP_VERSION` = commit, para poder hacer rollback |
| Extrae solo | bind mount + variables | **migrate + collectstatic + prune** |

Ensaya con el de producción si lo que quieres validar es el camino real de despliegue.

### El truco del contexto de build: los `../` no salen de `frontend/`

`Dockerfile.frontend` hace:

```dockerfile
WORKDIR /app
COPY frontend/ ./          # solo el CONTENIDO de frontend/
```

Ese `COPY` arrastra `frontend/` y nada más. Un archivo que viva en la **raíz del repo no
entra en la imagen**. Por eso un import así funciona en tu máquina y rompe el build:

```jsx
// frontend/src/pages/LoginPage.jsx
import logoMegas from '../../../nuevoLOGOMegas.png';   // ✗ en Docker
```

| Entorno | Base | `../../../` resuelve a |
|---|---|---|
| Local | `frontend/src/pages/` | raíz del repo — el archivo está ahí, funciona |
| Docker | `/app/src/pages/` | `/` — fuera de la imagen, `UNRESOLVED_IMPORT` |

La regla: **un asset que se importa desde el código del frontend tiene que vivir dentro de
`frontend/`**, y la ruta tiene que funcionar en los dos entornos. Con `../../` funciona en ambos.

Este fallo es silencioso en local y **nunca funcionó en Docker**, en ninguna máquina. Si agregas
otro archivo fuera de `frontend/` y lo importas desde el SPA, va a pasar lo mismo.

### El estado de la aplicación vive fuera de git

`data/db.sqlite3`, `media/` y `.env` son lo único que no se puede reconstruir con un build.
Viven en un bind mount para sobrevivir a los redeploys. Por eso `backup.sh` los respalda.

Antes del primer `up`:

```bash
mkdir -p /root/induccion-megas/data /root/induccion-megas/media
touch /root/induccion-megas/data/db.sqlite3
```

El `touch` no es opcional: si el archivo no existe, Docker crea un **directorio** llamado
`db.sqlite3` y el backend no arranca.

---

## Reglas de Firestore

`frontend/src/pages/CalificacionesPage.jsx` lee las notas **directamente del navegador** con el
SDK web, sin pasar por Django. Eso significa que las reglas de Firestore son la única barrera
entre "mis notas" y "las notas de todos".

### El problema que cierran

Un alumno abre la consola del navegador y cambia el `where('userId', '==', miUid)` por el de
otro. Sin reglas que comprueben la condición, se leen todas las calificaciones de la plataforma.
Es un IDOR del lado del cliente, el mismo que `usuarios/permisos.py` cierra para el backend.

### Qué hace `firestore.rules`

```javascript
match /calificaciones/{calificacionId} {
  allow get, list: if request.auth != null
                   && request.auth.uid == resource.data.userId;
  allow write: if false;
}

// Cualquier otra colección: cerrada.
match /{document=**} { allow read, write: if false; }
```

Cuatro capas:

1. **`request.auth != null`** — sin sesión, `request.auth` es `null`, y `null == null` dejaría
   leer todos los documentos que no tengan `userId`.
2. **`request.auth.uid == resource.data.userId`** — solo el dueño.
3. **`allow write: if false`** — nadie escribe desde el cliente, la nota la corrige Django.
4. **El `catch-all`** cierra cualquier colección nueva. Sin él, una colección creada desde la
   consola nace con las reglas por defecto del proyecto, que pueden venir en
   `allow read, write: if true`.

No hay que filtrar nada en la regla: Firestore no filtra *después*, concede la lectura solo si
puede **probar** la condición contra tu query. Un `list()` de la colección entera se deniega,
que es justo lo que se quiere.

**Ojo:** un service account con el Admin SDK escribe igual, porque las reglas no aplican a quien
administra la base. Hoy el backend no escribe en Firestore (`firebase-admin` no está en
`requirements.txt`; `google-auth` solo *verifica* el token, en `usuarios/firebase.py`). Si alguna
vez se agrega, este `allow write: if false` deja de proteger y la protección real pasa a ser el
service account.

### Las pruebas

```bash
cd frontend
npm install
npm run test:rules
```

11 casos contra el emulador, con tokens reales del emulador de Auth. Nunca contra producción:
`firebase emulators:exec` levanta el emulador con `firestore.rules`, corre las pruebas y lo
apaga.

El detalle que hace que estas pruebas sirvan de algo:

> el emulador **no** devuelve un error de permisos, sino un **documento vacío**.

Por eso los casos de denegación usan `assertFails()`. Sin eso, una regla completamente abierta
como `allow read: if true` pasaría todas las pruebas y nadie se enteraría.

### El emulador y Docker

`firebase.json` amarra el emulador a `127.0.0.1`. **Eso no funciona desde un contenedor**: dentro
de un contenedor `127.0.0.1` es el propio contenedor, no el host. Para probarlas dentro de
Docker hay que usar `network_mode: host` o `host.docker.internal`. Fuera de Docker funciona tal
cual.

---

## Despliegue

Todo lo de `filesParaDeploy/` está pensado para copiarse al VPS. Los archivos ya traen el
procedimiento completo en sus propios comentarios; esta es la secuencia.

### En el VPS

| Ruta | Qué |
|---|---|
| `/root/induccion-megas/` | raíz de la aplicación (el repo) |
| `/root/induccion-megas/data/db.sqlite3` | base de datos |
| `/root/induccion-megas/media/` | certificados PDF emitidos |
| `/root/induccion-megas/.env` | secretos, `chmod 600`, nunca en git |
| `/root/induccion-megas/deploy.sh` | despliegue |
| `/root/induccion-megas/backup.sh` | respaldo diario |
| `/root/induccion-megas/docker-compose.prod.yml` | compose de producción |
| `/root/backups/` | respaldos, 14 días de retención |

Ojo con el layout: `deploy.sh` espera `docker-compose.prod.yml` **en la raíz** de la app, pero el
archivo vive en `filesParaDeploy/`. Hay que copiarlo:

```bash
cp filesParaDeploy/docker-compose.prod.yml /root/induccion-megas/
cp filesParaDeploy/deploy.sh           /root/induccion-megas/ && chmod +x /root/induccion-megas/deploy.sh
cp filesParaDeploy/backup.sh           /root/induccion-megas/ && chmod +x /root/induccion-megas/backup.sh
```

### Las variables del `.env` no son todas opcionales

El compose usa la sintaxis `:?`, que **hace fallar el arranque** si la variable falta o está
vacía:

```yaml
SECRET_KEY=${SECRET_KEY:?falta SECRET_KEY en .env}
EMAIL_HOST_USER=${EMAIL_HOST_USER:?falta EMAIL_HOST_USER en .env}
EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD:?falta EMAIL_HOST_PASSWORD en .env}
NOTIF_DESTINATARIOS=${NOTIF_DESTINATARIOS:?falta NOTIF_DESTINATARIOS en .env}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:?falta FIREBASE_PROJECT_ID en .env}
```

Es deliberado: `settings.py` tiene un `SECRET_KEY` de desarrollo por defecto, y `:?` impide que
un VPS suba a internet con esa clave.

`FIREBASE_PROJECT_ID` merece atención aparte: si falta, el backend no puede auditar ningún token
y **toda la API responde `503`**, no `401`. El síntoma no dice "no estás autorizado" sino "no hay
por dónde pasar", que es el fallo más caro de diagnosticar porque no señala la causa.

Para un entorno de pruebas se pueden poner valores falsos **pero no vacíos** (`EMAIL_HOST_PASSWORD`
deja de ser opcional aunque no se vaya a enviar correo).

`ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` tienen como default `megas.com.co`. Si se accede por IP
o por un túnel hay que sobreescribirlos o Django responde `DisallowedHost`.

### El flujo de deploy

```bash
/root/induccion-megas/deploy.sh
```

Hace, en orden: `git pull` → tag `APP_VERSION` con el commit → `backup.sh` → `build` →
`up -d` → `prune` de imágenes viejas.

Lo que **no** es automático:

- **`migrate` sí lo es**: corre dentro del `command` del contenedor, así que el esquema se
  aplica solo en cada arranque.
- **`createsuperuser` no**: hay que hacerlo a mano la primera vez.

El rollback es cambiar el tag, sin reconstruir:

```bash
APP_VERSION=<commit anterior> docker compose -f docker-compose.prod.yml up -d
```

Si ese deploy corrió migraciones, hay que restaurar antes el `db.sqlite3` del backup.

### Backups

```bash
crontab -e
0 3 * * * /root/induccion-megas/backup.sh
```

Requiere `sqlite3` en el host (`sudo apt install -y sqlite3`).

Usa `.backup` de sqlite3 y **no `cp`**: `cp` puede copiar la base a mitad de una escritura y
dejar un archivo corrupto que parece un backup válido.

Y un backup en el mismo disco no salva de un VPS perdido. Conviene copiarlo fuera
(`rclone copy "$DEST" remote:backups-gmax/$TS`).

### TLS

El nginx del **host** termina el TLS y reenvía en claro a `127.0.0.1:5137`. Ver
`filesParaDeploy/nginx-host.conf`, que trae el procedimiento completo incluido el `certbot`.

El `X-Forwarded-Proto: https` que ese nginx manda **no es opcional**:
`SECURE_PROXY_SSL_HEADER` de Django depende de él. Sin esa cabecera, todo lo que sale por correo
—enlaces de certificados, avisos— lleva `http://` y la comprobación de Referer de CSRF queda
relajada. Sin TLS no hay forma de validar esa parte.

En Firebase Console > Authentication > Authorized domains hay que agregar el dominio, o el login
falla **solo en producción**.

### Acceso al VPS por SSH

El `deploy.sh` hace `git pull`, así que el VPS se autentica en GitHub. Con SSH:

```bash
# /root/.ssh/config
Host github.com
    HostName github.com
    User git
    IdentityFile /root/.ssh/id_ed25519_marketmegas
    IdentitiesOnly yes
```

Tres cosas que hacen fallar esto si no están:

- **`User git` es obligatorio.** GitHub exige ese usuario literal, sin importar qué cuenta uses.
- **`IdentitiesOnly yes` es lo que hace funcionar las claves múltiples.** Sin eso SSH ofrece
  *todas* las llaves y GitHub responde `Too many authentication failures` sin llegar a probar la
  correcta.
- **La privada en `chmod 600`.** SSH se niega a usar una clave legible por otros. Es el mismo
  error que hace que un `.pem` con `664` sea descartado en silencio.

Un detalle al probar: `ssh -T git@github.com` devuelve **exit code 1 en el éxito**, porque GitHub
responde `Hi <usuario>!` pero no ofrece shell. En un script con `set -e` eso aborta.

Como el repositorio es privado, `git ls-remote origin` es la prueba real de que la
autenticación funciona: sin credenciales devolvería `403`.

---

## Git y datos sensibles

### Los patrones de exclusión deben coincidir con el nombre real

`.gitignore` y `.dockerignore` excluyen `db.sqlite3-*` (guion), pero los backups se llaman
`db.sqlite3.bak-*` (punto). **El patrón no coincide** y las bases se cuelan.

Peor: `Dockerfile.backend` hace `COPY . .`, y el compose de producción no monta el código, así que
lo que se cuela en el contexto de build **queda horneado en la imagen**.

Corregido a:

```
db.sqlite3
db.sqlite3-*
db.sqlite3.*      # <- el que faltaba
data/
```

Un archivo ya trackeado no lo protege ningún `.gitignore`: hay que sacarlo del índice con
`git rm --cached`. Y sacar del índice no lo saca del historial.

### Nunca confíes la contraseña por chat ni la commitees

`filesParaDeploy/.env.produccion` es una **plantilla con marcadores `CAMBIA...`**, no el `.env`
real. El `.env` del VPS nunca se sube.

⚠️ El repo ya sufrió una fuga de este tipo: una contraseña de aplicación de Gmail quedó escrita en
el historial de git y hay que revocarla en Google > Seguridad > Contraseñas de aplicación. Si
filtras una, revócala en la fuente y genera otra — no solo la borres del archivo.

Si se necesita una en el servidor, que la escriba la persona directamente y no pase por un
registro:

```bash
read -rsp 'Contraseña: ' PW && echo && \
  sed -i "s|^EMAIL_HOST_PASSWORD=.*|EMAIL_HOST_PASSWORD=$PW|" .env && unset PW
```

`read -rsp` no hace eco y, como el valor se escribe en el prompt y no como parte del comando, no
queda en el historial del shell.

---

## Recursos del VPS

Una instancia pequeña (2 vCPU, ~1 GB de RAM, disco de 6.7 GB) **apenas puede** construir el
frontend: `npm install` + `vite build` de un proyecto con Firebase, jsPDF y html2pdf es lo más
pesado de todo el build.

Dos advertencias:

- **El swap se descuenta del disco.** Poner 3 GB de swap en un disco de 6.7 GB lo llena y el build
  deja de tener espacio. Dimensionar las dos cosas juntas.
- **Limitado el `NODE_OPTIONS`** si el build se pasa de memoria.

Para producción conviene una instancia con 4 GB de RAM o más.
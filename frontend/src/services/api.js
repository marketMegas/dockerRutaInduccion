// Toda llamada a la API de Django sale de aca.
//
// Antes cada fetch se escribia suelto y sin credencial, y la API no miraba quien
// llamaba. Ahora el backend exige el ID token de Firebase en el header
// Authorization y decide con el si ese correo tiene alta en Django, asi que un
// fetch sin este header no falla de forma rara: responde 401 y se nota.
//
// El token se pide en cada llamada y no se cachea a mano porque expira cada
// hora; `getIdToken()` lo refresca solo cuando hace falta. Un token guardado
// en una variable del modulo seria el bug clasico: anduvo toda la tarde y a las
// siete de la tarde dejo de andar sin que nadie tocara nada.
import { auth } from '../config/firebase';

// Un 401 casi nunca es "sesion invalida de verdad": el ID token pudo vencer en
// el medio de la peticion. Por eso se reintenta UNA vez con un token forzando
// el refresh (`getIdToken(true)`), y solo si ese tambien falla se rinde. Sin
// ese reintento, un alumno que abriera la app justo cuando se le vencio el
// token tendria que recargar a mano.
export const apiFetch = async (ruta, opciones = {}) => {
  const usuario = auth.currentUser;

  if (!usuario) {
    const error = new Error('No hay sesion iniciada.');
    error.status = 401;
    // `codigo` propio y no el del backend: este 401 no viene de Django, sale de
    // aca y la peticion ni siquiera salio del navegador. Sin marcarlo, era
    // indistinguible del 401 del backend y el diagnostico daba vueltas.
    error.codigo = 'sesion_local_ausente';
    throw error;
  }

  const enviar = async (forzar) => {
    const token = await usuario.getIdToken(forzar);
    return fetch(ruta, {
      ...opciones,
      headers: {
        ...(opciones.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  let res = await enviar(false);
  if (res.status === 401) {
    res = await enviar(true);
  }
  return res;
};

// El catálogo de cursos lo sirve Django, no el frontend: lo que se crea en
// /admin tiene que aparecer en la app sin tocar código. La misma ruta relativa
// funciona en dev (el proxy de Vite) y en produccion (el proxy de nginx).
const CURSOS_URL = '/api/cursos/';
const EVALUACIONES_URL = '/api/cursos/evaluaciones/';

// El status va pegado al error: el componente distingue el 404 de un curso sin
// evaluación ("aún no tiene evaluación") del 409 de un banco con una pregunta
// sin respuesta correcta. Con un mensaje plano los dos casos son el mismo
// "algo falló" y el estudiante no puede hacer nada.
const leerJson = async (res) => {
  if (!res.ok) {
    const error = new Error(`Error ${res.status} al pedir ${res.url}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const api = {
  // GET /api/cursos/  ->  lista el catalogo con sus modulos y lecciones aplanados
  getCourses: async () => {
    const res = await apiFetch(CURSOS_URL);
    return leerJson(res);
  },

  // GET /api/cursos/<id>/  ->  un curso con sus lecciones
  getCourseById: async (id) => {
    const res = await apiFetch(`${CURSOS_URL}${id}/`);
    if (res.status === 404) {
      throw new Error('Curso no encontrado');
    }
    return leerJson(res);
  },

  // Django no tiene un endpoint de progreso por curso: el progreso se persiste
  // leccion por leccion con POST /api/cursos/progreso/ (markLessonComplete en
  // useCourseStore). Esta funcion no guarda nada, solo devuelve lo que el store
  // ya calculo para que pueda pintar el estado local. Antes mutaba un array
  // mock que no ida a ningun lado.
  updateProgress: async (id, progressData) => {
    return { success: true, data: { id: parseInt(id, 10), ...progressData } };
  },

  // GET /api/cursos/evaluaciones/<id>/  ->  el banco del curso, SIN las
  // respuestas correctas. Las preguntas viven en Django y se editan desde
  // /admin, no en el codigo: por eso no hay ningun array aca.
  getEvaluacion: async (courseId) => {
    const res = await apiFetch(`${EVALUACIONES_URL}${courseId}/`);
    return leerJson(res);
  },

  // POST /api/cursos/evaluaciones/<id>/entregar/  ->  la nota ya corregida.
  // Se mandan las respuestas crudas ({id_pregunta: id_opcion}): el veredicto
  // sale de comparar contra la base, no de lo que diga el cliente. Devuelve
  // el JSON entero y no solo `data`, porque el componente necesita `detalle` para
  // mostrar que preguntas fallaron.
  //
  // `user` ya no se usa: de quien es la nota lo saca el backend del token, asi
  // que mandarlo solo abriria la puerta a que el `user_id` del body fuera
  // otro. Se deja el parametro para no tocar las llamadas.
  entregarEvaluacion: async (courseId, respuestas, user = {}) => {
    const res = await apiFetch(`${EVALUACIONES_URL}${courseId}/entregar/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestas }),
    });
    return leerJson(res);
  },

  // GET /api/cursos/calificaciones/<userId>/  ->  las notas del usuario con,
  // en cada una, si tiene certificado emitido y el token para bajarlo.
  // El <userId> de la URL ya no decide nada: el backend devuelve las notas de
  // quien mando el token. Sigue en la URL por compatibilidad.
  getCalificaciones: async (userId) => {
    const res = await apiFetch(`${CURSOS_URL}calificaciones/${userId}/`);
    return leerJson(res);
  },

  // POST /api/cursos/enviar-certificado/  ->  registra el PDF y manda el
  // aviso. Solo lo acepta si hay Calificacion.passed para el curso: la nota es
  // la puerta, no el progreso de lecciones.
  registrarCertificado: async (blob, { nombreUsuario, emailUsuario, curso, userId, courseId }) => {
    const form = new FormData();
    form.append('certificado', blob, `Certificado_${nombreUsuario}.pdf`);
    form.append('curso', curso);
    form.append('courseId', String(courseId));
    const res = await apiFetch(`${CURSOS_URL}enviar-certificado/`, {
      method: 'POST',
      body: form,
    });
    return leerJson(res);
  },

  // Descarga el PDF que el backend ya guardo, usando el token de la fila. Se
  // hace con fetch + blob y no abriendo la URL directo para poder manejar el
  // 404 con mensaje: si el archivo se borro del servidor, abrirlo en una
  // pestana nueva muestra una pagina de error sin contexto.
  //
  // Esta SI va sin `apiFetch`, y es a proposito: `descargar_certificado` es la
  // unica vista que no exige sesion, porque el enlace del certificado se manda
  // por correo y tiene que abrir en una pestana donde nadie esta logueado. El
  // token de la URL es lo que abre ese archivo.
  descargarCertificado: async (url, nombreArchivo) => {
    const res = await fetch(url);
    if (!res.ok) {
      let mensaje = 'No se pudo descargar el certificado.';
      try {
        const cuerpo = await res.json();
        if (cuerpo?.error) mensaje = cuerpo.error;
      } catch {
        // Respuesta sin JSON (un 500, por ejemplo): nos quedamos con el
        // mensaje por defecto en vez de romper el catch.
      }
      const error = new Error(mensaje);
      error.status = res.status;
      throw error;
    }
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = href;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    // Revocar el object URL: sin esto el blob queda en memoria y en una
    // pagina donde se descarga varias veces se acumulan.
    URL.revokeObjectURL(href);
  },

  // ── La puerta ──────────────────────────────────────────────────

  // POST /api/auth/correo-autorizado/  ->  ese correo esta dado de alta en
  // Django. Lo consulta RegisterPage ANTES de crear la cuenta en Firebase.
  correoAutorizado: async (email) => {
    const res = await fetch('/api/auth/correo-autorizado/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const error = new Error('No se pudo verificar el correo con el servidor.');
      error.status = res.status;
      throw error;
    }
    return (await res.json()).autorizado === true;
  },

  // POST /api/auth/verificar/  ->  la sesion de Firebase, contra la lista de
  // Django. Responde 403 con codigo 'sin_alta' cuando el correo no esta dado de
  // alta, y 401 con 'token_invalido' cuando el token no sirvio ni refrescando.
  verificarAcceso: async () => {
    const res = await apiFetch('/api/auth/verificar/', { method: 'POST' });
    const cuerpo = await res.json().catch(() => ({}));

    if (res.status === 403) {
      return { autorizado: false, ...cuerpo };
    }
    if (!res.ok) {
const error = new Error(cuerpo?.error || 'No se pudo verificar el acceso.');
    error.status = res.status;
    error.codigo = cuerpo?.codigo;
    error.detalle = cuerpo?.detalle;
    throw error;
    }
    return { autorizado: true, ...cuerpo };
  },
};

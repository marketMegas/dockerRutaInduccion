// El catálogo de cursos lo sirve Django, no el frontend: lo que se crea en
// /admin tiene que aparecer en la app sin tocar código. La misma ruta relativa
// funciona en dev (el proxy de Vite) y en produccion (el proxy de nginx).
const CURSOS_URL = '/api/cursos/';

const leerJson = async (res) => {
  if (!res.ok) {
    throw new Error(`Error ${res.status} al pedir ${res.url}`);
  }
  return res.json();
};

export const api = {
  // GET /api/cursos/  ->  lista el catalogo con sus modulos y lecciones aplanados
  getCourses: async () => {
    const res = await fetch(CURSOS_URL);
    return leerJson(res);
  },

  // GET /api/cursos/<id>/  ->  un curso con sus lecciones
  getCourseById: async (id) => {
    const res = await fetch(`${CURSOS_URL}${id}/`);
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
  }
};

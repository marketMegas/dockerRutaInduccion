import { create } from 'zustand';
import { api, apiFetch } from '../services/api';
import { auth } from '../config/firebase';



const fetchProgressFromDjango = async (userId) => {
  if (!userId) return [];
  try {
    const res = await apiFetch(`/api/cursos/progreso/${userId}/`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error fetching progress in store:", err);
  }
  return [];
};

// El total sale del backend. Antes caia a 4 cuando el curso venia con 0
// lecciones (curso recien creado), asi que el progreso arrancaba en un 0/4
// inventado. Con total 0 el progreso se queda en 0.
const calcularProgreso = (completedCount, total) => {
  if (!total) return 0;
  return Math.min(100, Math.round((completedCount / total) * 100));
};

const mergeProgress = (coursesList, progressList) => {
  return coursesList.map(course => {
    const courseProgress = progressList.filter(p => String(p.course_id) === String(course.id) && p.completado);
    const completedCount = courseProgress.length;
    const total = course.totalLessons ?? course.lessonsCount ?? 0;

    return {
      ...course,
      completedLessons: completedCount,
      progress: calcularProgreso(completedCount, total)
    };
  });
};

const mergeCourseProgress = (course, progressList) => {
  if (!course) return null;
  const courseProgress = progressList.filter(p => String(p.course_id) === String(course.id) && p.completado);
  const completedCount = courseProgress.length;
  const total = course.totalLessons ?? course.lessonsCount ?? 0;

  return {
    ...course,
    completedLessons: completedCount,
    progress: calcularProgreso(completedCount, total)
  };
};

export const useCourseStore = create((set, get) => ({
  courses: [],
  currentCourse: null,
  isLoading: false,
  error: null,

  fetchCourses: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getCourses();
      const activeUserId = userId || auth.currentUser?.uid;
      if (activeUserId) {
        const progressList = await fetchProgressFromDjango(activeUserId);
        const merged = mergeProgress(data, progressList);
        set({ courses: merged, isLoading: false });
      } else {
        set({ courses: data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCourseById: async (id, userId) => {
    set({ isLoading: true, error: null, currentCourse: null });
    try {
      const data = await api.getCourseById(id);
      const activeUserId = userId || auth.currentUser?.uid;
      if (activeUserId) {
        const progressList = await fetchProgressFromDjango(activeUserId);
        const merged = mergeCourseProgress(data, progressList);
        set({ currentCourse: merged, isLoading: false });
      } else {
        set({ currentCourse: data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCurrentCourse: () => {
    set({ currentCourse: null, error: null });
  },

  // Guarda una lección específica como completada en Django y actualiza el estado local
  markLessonComplete: async (courseId, lessonId, userId) => {
    const activeUserId = userId || auth.currentUser?.uid;
    if (!activeUserId || !courseId || !lessonId) return;

    try {
      // El `user_id` del cuerpo ya no decide de quien es el progreso: el
      // backend lo saca del token del header y lo ignora. Se sigue mandando
      // para no cambiar el contrato de un endpoint que ya anda.
      const res = await apiFetch('/api/cursos/progreso/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeUserId,
          course_id: String(courseId),
          lesson_id: String(lessonId),
          completado: true
        })
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Error guardando progreso en Django:', err);
      } else {
        // Recargar progreso desde Django y actualizar el estado local
        const progressList = await fetchProgressFromDjango(activeUserId);
        const { courses, currentCourse } = get();
        if (courses.length > 0) {
          const mergedCourses = mergeProgress(courses, progressList);
          set({ courses: mergedCourses });
        }
        if (currentCourse && String(currentCourse.id) === String(courseId)) {
          const mergedCourse = mergeCourseProgress(currentCourse, progressList);
          set({ currentCourse: mergedCourse });
        }
      }
    } catch (err) {
      console.error('Error de red al guardar progreso:', err);
    }
  },


  updateCourseProgress: async (id, progressData) => {
    const { courses, currentCourse } = get();
    const currentProgress = courses.find((c) => c.id === parseInt(id))?.progress
      ?? currentCourse?.progress
      ?? 0;

    // Solo actualizar si el nuevo progreso es mayor al actual
    if (progressData.progress > currentProgress) {
      try {
        const response = await api.updateProgress(id, progressData);
        if (response.success) {
          set((state) => ({
            courses: state.courses.map((c) =>
              c.id === parseInt(id) ? { ...c, ...progressData } : c
            ),
            currentCourse: state.currentCourse?.id === parseInt(id)
              ? { ...state.currentCourse, ...progressData }
              : state.currentCourse
          }));
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  }
}));

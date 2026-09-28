// Mock data
const mockCourses = [
  {
    id: 4,
    color: 'bg-[#5fbd44]',
    iconType: 'Bot',
    badge: 'Nuevo',
    title: 'pruebaCreacion28',
    description: 'Curso de prueba para validar el flujo completo de creación de nuevos cursos: lecciones, videos, materiales y evaluación.',
    lessonsCount: 3,
    duration: '45m',
    level: 'Prueba',
    progress: 0,
    completedLessons: 0,
    totalLessons: 3,
    lessons: [
      { id: 1, title: 'Lección 1: Introducción a la prueba', duration: '10:00 min', path: '', videoId: 'LXH0upydj0g' },
      { id: 2, title: 'Lección 2: Contenido de prueba', duration: '15:00 min', path: '/leccion/2', videoId: '' },
      { id: 3, title: 'Lección 3: Evaluación de prueba', duration: '20:00 min', path: '/leccion/3', videoId: '' }
    ]
  }
];

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // GET /cursos
  getCourses: async () => {
    // En producción se usaría algo como: return axios.get('/api/cursos').then(res => res.data);
    await delay(1000); // Simulando red
    return [...mockCourses];
  },

  // GET /curso/:id
  getCourseById: async (id) => {
    await delay(800);
    const course = mockCourses.find(c => c.id === parseInt(id));
    if (!course) throw new Error('Curso no encontrado');
    return { ...course };
  },

  // POST /progreso
  updateProgress: async (id, progressData) => {
    await delay(500);
    const courseIndex = mockCourses.findIndex(c => c.id === parseInt(id));
    if (courseIndex !== -1) {
      mockCourses[courseIndex] = {
        ...mockCourses[courseIndex],
        ...progressData
      };
      return { success: true, data: mockCourses[courseIndex] };
    }
    throw new Error('Curso no encontrado');
  }
};

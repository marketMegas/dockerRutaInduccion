import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Django backend URL for course progress
const API_BASE = '/api/cursos/progreso';

export const useProgress = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [error, setError] = useState(null);

  // Read progress from Django backend when user changes
  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      if (!currentUser) {
        setProgress({});
        setLoadingProgress(false);
        return;
      }

      setLoadingProgress(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/${currentUser.uid}/`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // Transform list of progress records from Django to the expected state structure
        const formattedProgress = {};
        data.forEach(item => {
          const cId = item.course_id;
          const lId = item.lesson_id;
          const completed = item.completado;

          if (completed) {
            if (!formattedProgress[cId]) {
              formattedProgress[cId] = { completedLessons: [], lastAccessed: null };
            }
            if (!formattedProgress[cId].completedLessons.includes(lId)) {
              formattedProgress[cId].completedLessons.push(lId);
            }
            if (!formattedProgress[cId].lastAccessed || new Date(item.fecha_actualizacion) > new Date(formattedProgress[cId].lastAccessed)) {
              formattedProgress[cId].lastAccessed = item.fecha_actualizacion;
            }
          }
        });

        if (isMounted) {
          setProgress(formattedProgress);
        }
      } catch (err) {
        console.error("Error fetching progress from Django API:", err);
        if (isMounted) {
          setError("No se pudo cargar el progreso.");
        }
      } finally {
        if (isMounted) {
          setLoadingProgress(false);
        }
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Mark lesson as complete in Django backend
  const markLessonComplete = async (courseId, lessonId) => {
    if (!currentUser) {
      console.warn("No authenticated user to save progress.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.uid,
          course_id: String(courseId),
          lesson_id: String(lessonId),
          completado: true
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Update local state optimistically
      setProgress((prevProgress) => {
        const courseProgress = prevProgress[courseId] || { completedLessons: [] };
        const updatedLessons = courseProgress.completedLessons.includes(lessonId)
          ? courseProgress.completedLessons
          : [...courseProgress.completedLessons, lessonId];

        return {
          ...prevProgress,
          [courseId]: {
            ...courseProgress,
            completedLessons: updatedLessons,
            lastAccessed: new Date().toISOString()
          }
        };
      });

      return true;
    } catch (err) {
      console.error(`Error marking lesson ${lessonId} as complete:`, err);
      setError("No se pudo guardar el progreso.");
      throw err;
    }
  };

  return {
    progress,
    loadingProgress,
    error,
    markLessonComplete
  };
};

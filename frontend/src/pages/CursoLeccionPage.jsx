import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Play, Lock } from 'lucide-react';
import { useCourseStore } from '../store/useCourseStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { TextoEnParrafos } from '../components/shared/TextoEnParrafos';
import { useAuth } from '../context/AuthContext';
import { EvaluacionCurso } from '../components/EvaluacionCurso';

import { CourseProgress } from '../components/CourseProgress';

export const CursoLeccionPage = () => {
  const { id, leccionId } = useParams();
  const navigate = useNavigate();
  const { currentCourse: course, isLoading, error, fetchCourseById, clearCurrentCourse, updateCourseProgress, markLessonComplete } = useCourseStore();
  const { currentUser } = useAuth();
  const parsedLeccionId = parseInt(leccionId);
  const esUltimaLeccion = course && parsedLeccionId === course.totalLessons;
  const tieneEvaluacion = Boolean(course?.tieneEvaluacionActiva);

  useEffect(() => {
    if (id) {
      fetchCourseById(id, currentUser?.uid);
    }
    return () => clearCurrentCourse();
  }, [id, currentUser]);

  useEffect(() => {
    if (course && course.id === parseInt(id)) {
      const totalLessonsForCourse = course.totalLessons;
      const completed = parsedLeccionId - 1;
      if (completed > (course.completedLessons || 0)) {
        const progress = Math.round((completed / totalLessonsForCourse) * 100);
        updateCourseProgress(id, { completedLessons: completed, totalLessons: totalLessonsForCourse, progress: progress });
      }
    }
  }, [course, parsedLeccionId, id]);

  const handleCompleteCourse = async () => {
    if (id && course) {
      if (course.lessons) {
        for (const lesson of course.lessons) {
          await markLessonComplete(id, lesson.id, currentUser?.uid);
        }
      }

      await updateCourseProgress(id, {
        completedLessons: course.totalLessons,
        totalLessons: course.totalLessons,
        progress: 100
      });
    }
  };

  // El quiz vive SOLO en la última lección. Al aprobar se finaliza el curso;
  // el certificado lo gestiona el propio componente de la evaluación.
  const manejarAprobacion = () => {
    handleCompleteCourse();
  };

  if (isLoading || !course) return <LoadingSpinner text="Cargando tu lección..." />;

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p className="font-bold">Error al cargar el curso:</p>
        <p>{error}</p>
        <button onClick={() => navigate('/cursos')} className="mt-4 text-[#f6811e] underline">Volver a mis cursos</button>
      </div>
    );
  }

  const currentLesson = course.lessons?.find(l => l.id === parsedLeccionId) || {
    id: parsedLeccionId,
    title: `Lección ${parsedLeccionId}`,
    videoId: ''
  };

  const tieneContenido = Boolean(currentLesson.content_text && currentLesson.content_text.trim());

  const prevLesson = parsedLeccionId > 1 ? course.lessons?.find(l => l.id === parsedLeccionId - 1) : null;
  const backPath = prevLesson ? (prevLesson.path ? `/curso/${id}${prevLesson.path}` : `/curso/${id}`) : `/curso/${id}`;

  const renderLessonContent = () => {
    if (course.description) {
      return (
        <div className="py-6 flex flex-col gap-8 w-full">
          <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight break-words">
              Sobre este curso
            </h2>
            <TextoEnParrafos
              texto={course.description}
              className="mt-4 space-y-3"
              parrafoClassName="text-gray-700 leading-relaxed break-words"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="py-6 flex flex-col gap-8 w-full">
        <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800">Contenido de la Lección {parsedLeccionId} del Curso {course.id} en desarrollo</h2>
        </div>
      </div>
    );
  };

  const renderBottomNavButton = () => {
    if (course.progress === 100) return null;

    if (parsedLeccionId === course.totalLessons) {
      // La evaluación de la última lección reemplaza el botón de finalizar.
      if (tieneEvaluacion) return null;
      return (
        <button
          onClick={handleCompleteCourse}
          className="flex items-center gap-2 bg-[#10b981] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 group cursor-pointer"
        >
          Finalizar Curso
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      );
    }

    if (parsedLeccionId < course.totalLessons) {
      return (
        <button
          onClick={async () => {
            await markLessonComplete(id, currentLesson.id, currentUser?.uid);
            navigate(`/curso/${id}/leccion/${parsedLeccionId + 1}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 bg-[#f6811e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5fbd44] transition-all shadow-lg shadow-[#f6811e]/20 group cursor-pointer"
        >
          Siguiente Lección
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start w-full max-w-[1600px] mx-auto">
      <div className="w-full min-w-0 lg:col-span-2 flex flex-col gap-6">
        <div>
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center text-[#f6811e] hover:underline font-bold text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a la Lección {parsedLeccionId - 1}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight break-words">
            {currentLesson.id}. {currentLesson.title.replace(/^\d+\.\s*/, '')}
          </h1>
          {course.progress !== 100 && !(parsedLeccionId === course.totalLessons && tieneEvaluacion) && (
            <button
              onClick={parsedLeccionId === course.totalLessons ? handleCompleteCourse : async () => {
                await markLessonComplete(id, currentLesson.id, currentUser?.uid);
                navigate(`/curso/${id}/leccion/${parsedLeccionId + 1}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#f6811e] text-[#f6811e] rounded-lg font-medium transition-colors hover:bg-green-50 whitespace-nowrap w-full sm:w-auto text-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {parsedLeccionId === course.totalLessons ? 'Finalizar Curso' : 'Marcar como completada'}
            </button>
          )}
        </div>

        {currentLesson.mediaType === 'imagen' ? (
          <div className="relative w-full aspect-video bg-black rounded-[24px] overflow-hidden shadow-2xl border-[6px] border-white/10">
            {currentLesson.videoId ? (
              <img
                src={currentLesson.videoId}
                alt={currentLesson.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Play className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Imagen en desarrollo</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video w-full bg-black rounded-[24px] overflow-hidden shadow-2xl border-[6px] border-white/10">
            {currentLesson.videoId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentLesson.videoId}`}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Play className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Video en desarrollo</p>
              </div>
            )}
          </div>
        )}

        {currentLesson.content_text && currentLesson.content_text.trim() && (
          <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm min-w-0">
            <h2 className="text-sm font-black text-[#f6811e] uppercase tracking-widest mb-4">Contenido</h2>
            <div className="text-gray-600 leading-relaxed text-base whitespace-pre-line break-words overflow-wrap-anywhere">{currentLesson.content_text}</div>
          </div>
        )}

        {!tieneContenido && (
          <div className="flex flex-col gap-8">
            {renderLessonContent()}
          </div>
        )}

        {/* Evaluación: solo en la última lección y si el curso tiene una
            evaluación activa. Nunca antes, para cumplir "UNA evaluación al
            final de cada curso". */}
        {esUltimaLeccion && tieneEvaluacion && (
          <div className="mt-6 border-t border-gray-100 pt-8">
            <EvaluacionCurso
              onPass={manejarAprobacion}
              courseId={course.id}
              courseName={course.title || `Curso ${course.id}`}
              nextPath="/cursos"
            />
          </div>
        )}
      </div>

      <div className="w-full min-w-0 lg:col-span-1 flex flex-col gap-6">
        <CourseProgress
          totalLessons={course.totalLessons}
          completedLessons={course.completedLessons}
        />

        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-gray-900">Lecciones del curso</h3>
          <div className="flex flex-col gap-3">
            {course.lessons && course.lessons.map((lesson, index) => {
              const lessonNumber = index + 1;
              const currentLessonNumber = parsedLeccionId;
              const isCompleted = lessonNumber < currentLessonNumber;
              const isActive = lessonNumber === currentLessonNumber;

              if (isCompleted || isActive) {
                return (
                  <div key={lesson.id} onClick={() => navigate(`/curso/${id}${lesson.path}`)} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-shadow hover:shadow-md ${isActive ? 'bg-[#f3fff0] border border-[#5fbd44]' : 'bg-white border border-gray-100 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${isActive ? 'bg-white text-[#f6811e]' : 'bg-white text-[#10b981] border border-gray-100'}`}>
                        {isActive ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[15px] break-words text-gray-900">{lesson.id}. {lesson.title}</p>
                        <p className={`text-[13px] font-semibold mt-0.5 ${isActive ? 'text-[#f6811e]' : 'text-[#10b981]'}`}>{isActive ? 'En curso' : 'Completada'}</p>
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#10b981] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent opacity-60">
                  <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 border border-gray-200">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-700 text-[15px] break-words">{lesson.id}. {lesson.title}</p>
                    <p className="text-[13px] text-gray-400 mt-0.5">Pendiente</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end w-full lg:col-span-3">
        {renderBottomNavButton()}
      </div>
    </div >
  );
};

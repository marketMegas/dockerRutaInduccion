import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Play, Lock } from 'lucide-react';
import { useCourseStore } from '../store/useCourseStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { EvaluacionCurso } from '../components/EvaluacionCurso';
import { RecursosMultimedia } from '../components/RecursosMultimedia';
import { CourseProgress } from '../components/CourseProgress';
import { Course1Leccion2Content } from '../components/course/lessons/Course1Leccion2Content';
import { Course1Leccion3Content } from '../components/course/lessons/Course1Leccion3Content';
import { Course2Leccion2Content } from '../components/course/lessons/Course2Leccion2Content';
import { Course2Leccion3Content } from '../components/course/lessons/Course2Leccion3Content';
import { Course2Leccion4Content } from '../components/course/lessons/Course2Leccion4Content';
import { Course3Leccion2Content } from '../components/course/lessons/Course3Leccion2Content';
import { Course3Leccion3Content } from '../components/course/lessons/Course3Leccion3Content';
import { Course3Leccion4Content } from '../components/course/lessons/Course3Leccion4Content';
import { Course3Leccion5Content } from '../components/course/lessons/Course3Leccion5Content';

export const CursoLeccionPage = () => {
  const { id, leccionId } = useParams();
  const navigate = useNavigate();
  const { currentCourse: course, isLoading, error, fetchCourseById, clearCurrentCourse, updateCourseProgress, markLessonComplete } = useCourseStore();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  const parsedLeccionId = parseInt(leccionId);
  // La evaluación se muestra en la última lección del curso, sin excepciones
  // por id: el caso especial del curso 3 apuntando al 4 quedó desactualizado
  // cada vez que el catálogo cambió.
  const isEvalLesson = course && parsedLeccionId === course.totalLessons;

  useEffect(() => {
    if (id) {
      fetchCourseById(id, currentUser?.uid);
    }
    return () => clearCurrentCourse();
  }, [id, currentUser]);

  useEffect(() => {
    setActiveTab(0);
    setQuizPassed(false);
  }, [leccionId]);

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

  const handleQuizPass = (passed) => {
    setQuizPassed(passed);
    if (passed && id) {
      markLessonComplete(id, parsedLeccionId, currentUser?.uid);
      // Nunca 100: la última lección del curso es la evaluación, y marcarla
      // como completada antes de evaluarse hacía que el botón de "descargar
      // certificado" apareciera sin que nadie hubiera aprobado nada.
      updateCourseProgress(id, {
        completedLessons: course.totalLessons - 1,
        totalLessons: course.totalLessons,
        progress: 99,
      });
    }
  };

  const handleCompleteCourse = async () => {
    if (id && course) {
      // Guardar TODAS las lecciones del curso como completadas en Django
      if (course.lessons) {
        for (const lesson of course.lessons) {
          await markLessonComplete(id, lesson.id, currentUser?.uid);
        }
      }

      // Actualizar el estado local al 100%
      await updateCourseProgress(id, {
        completedLessons: course.totalLessons,
        totalLessons: course.totalLessons,
        progress: 100
      });

      // El certificado NO se genera acá. Antes esta función armaba el PDF y lo
      // subía al backend, así que completar lecciones bastaba para obtener un
      // certificado sin haber aprobado la evaluación. Ahora lo emite la
      // evaluación, que es la que verifica la nota contra el banco.
    }
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

  // Find the current lesson object
  const currentLesson = course.lessons?.find(l => l.id === parsedLeccionId) || {
    id: parsedLeccionId,
    title: `Lección ${parsedLeccionId}`,
    videoId: ''
  };

  // Find previous lesson for the "Volver" button
  const prevLesson = parsedLeccionId > 1 ? course.lessons?.find(l => l.id === parsedLeccionId - 1) : null;
  const backPath = prevLesson ? (prevLesson.path ? `/curso/${id}${prevLesson.path}` : `/curso/${id}`) : `/curso/${id}`;

  const tabs = ['Resumen', 'Recursos', 'Evaluación'];

  // Function to render the correct content component
  const renderLessonContent = () => {
    if (course.id === 1) {
      if (parsedLeccionId === 2) return <Course1Leccion2Content />;
      if (parsedLeccionId === 3) return <Course1Leccion3Content />;
    }

    if (course.id === 2) {
      if (parsedLeccionId === 2) return <Course2Leccion2Content />;
      if (parsedLeccionId === 3) return <Course2Leccion3Content />;
      if (parsedLeccionId === 4) return <Course2Leccion4Content />;
    }

    if (course.id === 3) {
      if (parsedLeccionId === 2) return <Course3Leccion2Content />;
      if (parsedLeccionId === 3) return <Course3Leccion3Content />;
      if (parsedLeccionId === 4) return <Course3Leccion4Content />;
      if (parsedLeccionId === 5) return <Course3Leccion5Content />;
    }

    return (
      <div className="py-6 flex flex-col gap-8 w-full">
        <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800">Contenido de la Lección {parsedLeccionId} del Curso {course.id} en desarrollo</h2>
        </div>
      </div>
    );
  };

  // La evaluación vive en la última lección del curso. Course 3 la tenía
  // hardcodeada en el 4 en tres lugares distintos (pestaña, botón y gate de
  // navegación); si el catálogo cambiaba, esas rutas se quedaban atrás.
  const irAEvaluacion = () => {
    setActiveTab(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "Ir a evaluación" solo tiene sentido si el estudiante todavía no está ahí y
  // todavía no la rindió. Si ya está en la pestaña le llevaba a donde ya está,
  // y después de aprobar lo mandaba a repetir algo que ya había terminado.
  const mostrarIrAEvaluacion = activeTab !== 2 && !quizPassed;

  // Lógica para determinar qué botón de navegación inferior mostrar
  const renderBottomNavButton = () => {
    // El progreso al 100% no es una nota: lo único que puede hacer es llevar a
    // la evaluación. El botón decía "Descargar Certificado" y generaba un PDF
    // en el navegador sin que nadie hubiera aprobado.
    if (course.progress === 100) {
      if (!mostrarIrAEvaluacion) return null;
      return (
        <button
          onClick={irAEvaluacion}
          className="flex items-center gap-2 bg-[#f6811e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5fbd44] transition-all shadow-lg shadow-[#f6811e]/20 group cursor-pointer"
        >
          Ir a Evaluación
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      );
    }

    if (isEvalLesson && quizPassed) {
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
            // Guardar la lección actual como completada antes de avanzar
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

      {/* --- COLUMNA PRINCIPAL (CONTENIDO) --- */}
      <div className="w-full lg:col-span-2 flex flex-col gap-6">

        {/* 1. Enlace de retorno */}
        <div>
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center text-[#f6811e] hover:underline font-bold text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a la Lección {parsedLeccionId - 1}
          </button>
        </div>

        {/* 2. Título principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {currentLesson.id}. {currentLesson.title.replace(/^\d+\.\s*/, '')}
          </h1>
          {course.progress === 100 ? (
            // El progreso al 100% ya no significa "certificate listo": el
            // certificado depende de la nota. Este botón lleva a la evaluación,
            // que es donde el estudiante lo descarga o lo pide por correo.
            // Se oculta si ya estás en la pestaña de evaluación o si ya la
            // terminaste, por el mismo motivo que el de abajo.
            mostrarIrAEvaluacion ? (
              <button
                onClick={irAEvaluacion}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#f6811e] text-[#f6811e] rounded-lg font-bold transition-colors hover:bg-green-50 whitespace-nowrap w-full sm:w-auto text-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ir a mi evaluación
              </button>
            ) : null
          ) : (
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


        {/* 3. Reproductor de Video */}
        {!((course.id === 2 && parsedLeccionId === 2) || (course.id === 3 && parsedLeccionId === 4)) && (
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

        {/* 4. Navegación de pestañas */}
        <div className="border-b border-gray-100 mt-2">
          <ul className="flex gap-8 overflow-x-auto hide-scrollbar">
            {tabs.map((tab, i) => {
              const isEvalTab = tab === 'Evaluación';
              if (isEvalTab && !isEvalLesson) return null;
              return (
                <li key={i}>
                  <button
                    onClick={() => setActiveTab(i)}
                    className={`pb-4 text-[15px] font-bold border-b-[3px] transition-colors ${activeTab === i ? 'border-[#f6811e] text-[#f6811e]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 5. Contenido de pestañas */}
        {activeTab === 0 && (
          <div className="flex flex-col gap-8">
            {renderLessonContent()}
          </div>
        )}

        {activeTab === 1 && (
          <div className="py-6 w-full">
            <RecursosMultimedia courseId={course?.id} />
          </div>
        )}

        {activeTab === 2 && (
          <div className="py-6">
            <EvaluacionCurso
              onPass={handleQuizPass}
              courseId={course.id}
              courseName={course.title || `Curso ${course.id}`}
              // El quiz no sabe a donde seguir: eso lo decide la pagina, que
              // es la unica que sabe si esta es la ultima leccion del curso.
              // Antes estava hardcodeado por curso en el JSX del quiz, con
              // rutas que ya no existen (/curso/3/leccion/5 daba 404).
              nextPath={parsedLeccionId === course.totalLessons ? '/cursos' : `/curso/${id}/leccion/${parsedLeccionId + 1}`}
              buttonText={parsedLeccionId === course.totalLessons ? 'SIGUIENTE CURSO' : 'SIGUIENTE LECCIÓN'}
            />
          </div>
        )}

      </div >

      {/* --- SIDEBAR DERECHO --- */}
      <div className="w-full lg:col-span-1 flex flex-col gap-6">

        {/* Widget: Tu progreso actual dinámico */}
        <CourseProgress 
          totalLessons={course.totalLessons} 
          completedLessons={course.completedLessons} 
        />

        {/* Widget: Lecciones del módulo */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-gray-900">Lecciones del módulo</h3>
          <div className="flex flex-col gap-3">
            {course.lessons && course.lessons.map((lesson, index) => {
              const lessonNumber = index + 1;
              const currentLessonNumber = parsedLeccionId;
              const isCompleted = lessonNumber < currentLessonNumber;
              const isActive = lessonNumber === currentLessonNumber;
              const isLocked = lessonNumber > currentLessonNumber;

              if (isCompleted || isActive) {
                return (
                  <div key={lesson.id} onClick={() => navigate(`/curso/${id}${lesson.path}`)} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-shadow hover:shadow-md ${isActive ? 'bg-[#f3fff0] border border-[#5fbd44]' : 'bg-white border border-gray-100 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${isActive ? 'bg-white text-[#f6811e]' : 'bg-white text-[#10b981] border border-gray-100'}`}>
                        {isActive ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-bold text-[15px] ${isActive ? 'text-gray-900' : 'text-gray-900'}`}>{lesson.id}. {lesson.title}</p>
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
                  <div>
                    <p className="font-bold text-gray-700 text-[15px]">{lesson.id}. {lesson.title}</p>
                    <p className="text-[13px] text-gray-400 mt-0.5">Pendiente</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* BOTONES DE NAVEGACIÓN INFERIOR DINÁMICOS */}
      <div className="mt-4 flex justify-end w-full lg:col-span-3">
        {renderBottomNavButton()}
      </div>
    </div >
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Target, Zap, CircleDollarSign, RefreshCw, Fuel, Diamond, Play, Lock, Volume2, Maximize, Users, User, Briefcase, Cog, Globe, Truck, Building2, MapPin, Megaphone, Leaf, Handshake, Award, Store, Wrench, Building, Headset, Package, CreditCard, Star, BarChart, Car, Gift, ClipboardList, HelpCircle, FileText } from 'lucide-react';
import { useCourseStore } from '../store/useCourseStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { RecursosMultimedia } from '../components/RecursosMultimedia';
import { CourseProgress } from '../components/CourseProgress';
import { Course1Summary } from '../components/course/summaries/Course1Summary';
import { Course2Summary } from '../components/course/summaries/Course2Summary';
import { Course3Summary } from '../components/course/summaries/Course3Summary';

// Solo los cursos que ya traian su resumen en el codigo. Un curso nuevo (creado
// desde /admin) no debe caer en un resumen hardcodeado: antes el else final era
// <Course1Summary />, asi que cualquier curso unknown terminaba mostrando el
// contenido GLP del curso 1. Sin entrada aqui, se pinta la descripcion del admin.
const CURSO_CON_RESUMEN = {
  1: Course1Summary,
  2: Course2Summary,
  3: Course3Summary,
};

export const CursoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCourse: course, isLoading, error, fetchCourseById, clearCurrentCourse, updateCourseProgress } = useCourseStore();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCourseById(id, currentUser?.uid);
    }
    return () => clearCurrentCourse(); // Limpiar al desmontar
  }, [id, currentUser]);

  useEffect(() => {
    // Con 0 lecciones la division daba NaN y el progreso se rompia, asi que un
    // curso recien creado (aun sin contenido) no fuerza la leccion 1.
    if (course && course.id === parseInt(id) && course.totalLessons > 0) {
      updateCourseProgress(id, { 
        completedLessons: 1, 
        totalLessons: course.totalLessons, 
        progress: Math.round((1 / course.totalLessons) * 100) 
      });
    }
  }, [course, id]);

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

  const tabs = ['Resumen', 'Recursos'];

  // Sin video configurado se muestra un placeholder. Antes caia a un ID de
  // YouTube fijo, asi que todo curso sin video embebia el mismo clip de prueba.
  const lesson1VideoId = course.lessons && course.lessons.length > 0
    ? course.lessons[0].videoId
    : (course.videoId || '');

  const ResumenDelCurso = CURSO_CON_RESUMEN[course.id];


  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start w-full max-w-[1600px] mx-auto">

      {/* --- COLUMNA PRINCIPAL (CONTENIDO) --- */}
      <div className="w-full lg:col-span-2 flex flex-col gap-6">

        {/* 1. Enlace de retorno */}
        <div>
          <button
            onClick={() => navigate('/cursos')}
            className="inline-flex items-center text-[#f6811e] hover:underline font-bold text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a mis cursos
          </button>
        </div>

        {/* 2. Título principal */}
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          1. Introducción: {course.title}
        </h1>

        {/* 3. Reproductor de Video (YouTube Real) */}
        <div className="relative aspect-video w-full bg-black rounded-[24px] overflow-hidden shadow-2xl border-[6px] border-white/10">
          {lesson1VideoId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${lesson1VideoId}`}
              title={course.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <Play className="w-14 h-14 text-[#f6811e]" />
              <p className="text-white font-bold text-lg">Este curso aún no tiene video</p>
              <p className="text-gray-400 text-sm">
                Agrega una URL de YouTube en la lección para que aparezca aquí.
              </p>
            </div>
          )}
        </div>

        {/* 4. Navegación de pestañas */}
        <div className="border-b border-gray-100 mt-2">
          <ul className="flex gap-8 overflow-x-auto hide-scrollbar">
            {tabs.map((tab, i) => (
              <li key={i}>
                <button
                  onClick={() => setActiveTab(i)}
                  className={`pb-4 text-[15px] font-bold border-b-[3px] transition-colors ${activeTab === i ? 'border-[#f6811e] text-[#f6811e]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Contenido de pestañas */}
        <div className="py-6 flex flex-col gap-8">

          {/* TAB: RESUMEN */}
          {activeTab === 0 && (
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
              {ResumenDelCurso ? (
                <ResumenDelCurso />
              ) : course.description ? (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Sobre este curso
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {course.title}
                  </h2>
                  <p className="mt-4 text-gray-500 leading-relaxed">
                    Este curso todavía no tiene una descripción. Agrégala desde el
                    panel de administración para que los estudiantes vean el
                    resumen aquí.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: RECURSOS */}
          {activeTab === 1 && (
            <div className="py-6">
              <RecursosMultimedia courseId={course.id} />
            </div>
          )}



        </div>

        {/* BOTÓN SIGUIENTE LECCIÓN */}
        {course.lessons && course.lessons.length > 1 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate(`/curso/${id}${course.lessons[1].path}`)}
              className="flex items-center gap-2 bg-[#f6811e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5fbd44] transition-all shadow-lg shadow-[#f6811e]/20 group"
            >
              Siguiente Módulo
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

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
              const isCompleted = index < course.completedLessons;
              const isActive = index === course.completedLessons;
              const isLocked = index > course.completedLessons;

              if (isCompleted || isActive) {
                return (
                  <div key={lesson.id} onClick={() => navigate(`/curso/${id}${lesson.path}`)} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-shadow hover:shadow-md ${isActive ? 'bg-[#f3fff0] border border-[#5fbd44]' : 'bg-white border border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${isActive ? 'bg-white text-[#f6811e]' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                        {isActive ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <span className="font-bold">{lesson.id}</span>}
                      </div>
                      <div>
                        <p className={`font-bold text-[15px] ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{lesson.id}. {lesson.title}</p>
                        <p className="text-[13px] text-[#f6811e] font-semibold mt-0.5">{lesson.duration}</p>
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

              // Locked state
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
            
            {!course.lessons && (
              <p className="text-gray-500 text-sm">Lecciones no disponibles.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
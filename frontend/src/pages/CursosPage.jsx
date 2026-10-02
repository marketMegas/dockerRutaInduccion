import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, BarChart, MoreVertical, Bot, Users, Megaphone, LineChart } from 'lucide-react';
import { useCourseStore } from '../store/useCourseStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// Helper local para mapear strings de icono a componentes Lucide
const getIconComponent = (iconName) => {
  const icons = { Bot, Users, Megaphone, LineChart };
  return icons[iconName] || Bot;
};

// Helper para resaltar 'autoglp' y 'glp' en color cian
const highlightText = (text) => {
  if (!text) return text;
  const parts = text.split(/(autoglp|glp)/gi);
  return parts.map((part, i) =>
    /(autoglp|glp)/i.test(part) ? (
      <span key={i} className="text-[#f6811e] lowercase">{part}</span>
    ) : part
  );
};

export const CursosPage = () => {
  const navigate = useNavigate();
  const { courses, isLoading, error, fetchCourses } = useCourseStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchCourses(currentUser.uid);
    } else {
      fetchCourses();
    }
  }, [currentUser, fetchCourses]);

  if (isLoading) return <LoadingSpinner text="Cargando tus cursos..." />;

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p className="font-bold">Error al cargar los cursos:</p>
        <p>{error}</p>
        <button onClick={() => fetchCourses()} className="mt-4 text-[#f6811e] underline font-bold">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      {/* 1. Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis cursos</h1>
        <p className="text-gray-500">Aquí encontrarás todos los cursos en los que estás inscrito.</p>
      </div>

      {/* 2. Filtros y Ordenamiento */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <div className="flex gap-6 border-b border-gray-200 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {['En progreso'].map((tab, i) => (
            <button
              key={i}
              className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${i === 0
                ? 'border-[#f6811e] text-[#f6811e]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Lista de Tarjetas dinámicas */}
      <div className="flex flex-col gap-5 mt-2">
        {courses.map((course) => {
          const Icon = getIconComponent(course.iconType);

          return (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow relative">

              <button className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 hidden lg:block transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Columna 1: Imagen/Ilustración */}
              <div className={`w-full lg:w-[260px] h-48 lg:h-[180px] rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-sm ${!course.imageUrl ? course.color : ''}`}>
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                ) : (
                  <>
                    <Icon className="w-16 h-16 text-white opacity-90 drop-shadow-lg" />
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-white/10"></div>
                    <div className="absolute top-8 left-8 w-3 h-3 rounded-full bg-white/30"></div>
                  </>
                )}
              </div>

              {/* Columna 2: Info del curso */}
              <div className="flex-1 flex flex-col justify-center py-2">
                <span className="inline-block bg-[#e8fde2] text-[#f6811e] px-2.5 py-1 rounded-md text-xs font-bold w-max mb-3">
                  {course.badge}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{highlightText(course.title)}</h2>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed pr-0 lg:pr-8">
                  {highlightText(course.description)}
                </p>

                <div className="flex flex-wrap items-center gap-6 mt-auto">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{course.lessonsCount} lecciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <BarChart className="w-4 h-4" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              {/* Columna 3: Progreso y Acción */}
              <div className="w-full lg:w-[260px] flex flex-col justify-center lg:border-l lg:border-gray-100 lg:pl-8 mt-4 lg:mt-0">
                <div className="flex items-center gap-4 w-full">
                  <div className="relative w-[68px] h-[68px] flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-[#f6811e]" strokeDasharray={`${course.progress}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[14px] font-black text-gray-900 leading-none" translate="no">
                        {course.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Progreso</p>
                    <p className="text-[13px] text-gray-500 mt-1">{course.completedLessons} de {course.totalLessons} lecciones</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/curso/${course.id}`)}
                  className="w-full mt-6 py-2.5 border-2 border-[#f6811e] text-[#f6811e] hover:bg-[#f6811e] hover:text-white rounded-lg font-bold text-sm transition-colors text-center"
                >
                  Continuar aprendiendo
                </button>
              </div>

            </div>
          );
        })}
      </div>

      <div className="text-center mt-6 mb-8">
        <p className="text-gray-500 text-[15px]">
          ¿No encuentras tu curso? <a href="#" className="text-[#f6811e] font-bold hover:underline">Ver todos mis cursos</a>
        </p>
      </div>

    </div>
  );
};

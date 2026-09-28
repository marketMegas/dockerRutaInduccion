import React from 'react';

export const CourseProgress = ({ totalLessons = 0, completedLessons = 0 }) => {
  // Calcular porcentaje automáticamente
  const percentage = totalLessons > 0 
    ? Math.floor((completedLessons / totalLessons) * 100) 
    : 0;

  // Determinar mensaje dinámico
  let message = "¡Empecemos!";
  if (percentage > 70) {
    message = "¡Excelente trabajo!";
  } else if (percentage >= 30) {
    message = "¡Vas muy bien!";
  }

  // Configuración del círculo SVG
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-4 animate-in fade-in duration-500">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Tu progreso actual</h3>
      
      <div className="flex items-center gap-6">
        {/* Círculo de Progreso SVG */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90 transition-all duration-1000" viewBox="0 0 36 36">
            {/* Fondo del círculo */}
            <path
              className="text-gray-100"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progreso del círculo */}
            <path
              className="text-[#f6811e] transition-all duration-1000 ease-out"
              strokeWidth="4"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          
          {/* Porcentaje Central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[22px] font-black text-[#f6811e]">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Textos Informativos */}
        <div className="flex flex-col">
          <p className="text-base font-bold text-gray-900 leading-tight mb-1">
            {message}
          </p>
          <p className="text-sm text-gray-500 leading-tight">
            Has completado<br />
            <span className="font-bold text-gray-700">{completedLessons} de {totalLessons}</span> lecciones
          </p>
        </div>
      </div>
    </div>
  );
};

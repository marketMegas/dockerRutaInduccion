import { FlaskConical, CheckCircle2 } from 'lucide-react';

export const Course4Summary = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-6 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
          <FlaskConical className="w-9 h-9" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter">
          Curso de prueba pruebaCreacion28
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        <p className="text-lg font-medium text-gray-800 leading-relaxed text-left">
          Este es un curso <span className="text-[#f6811e] font-bold">de prueba</span> creado para validar
          el flujo completo de creación de nuevos cursos en la plataforma: catálogo, lecciones,
          materiales y evaluación.
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-[#f6811e] shadow-sm">
          <p>
            Al recorrer sus lecciones podrás comprobar cómo se integran los videos, los recursos
            multimedia y la evaluación final (<span className="font-bold">90% o más</span> para aprobar)
            en un curso nuevo sin modificar el resto de la plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            'Lección 1: Introducción',
            'Lección 2: Contenido',
            'Lección 3: Evaluación'
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-800 text-lg leading-tight">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
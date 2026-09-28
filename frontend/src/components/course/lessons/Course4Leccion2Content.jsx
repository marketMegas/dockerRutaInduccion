import { CheckCircle2 } from 'lucide-react';

export const Course4Leccion2Content = () => {
  return (
    <div className="py-6 flex flex-col gap-8 w-full">
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🧪</span>
          </div>
          <div>
            <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Contenido • Prueba</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter mb-4">
              Lección 2: Contenido de prueba
            </h2>
            <p className="text-gray-600 leading-relaxed text-base">
              Esta es la segunda lección del curso de prueba. Su propósito es comprobar que el contenido
              de cada lección se renderiza correctamente para un curso nuevo.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight mb-6">
          Puntos clave
        </h3>
        <ul className="space-y-4">
          {[
            'El catálogo carga el curso desde el mock de datos',
            'Cada lección tiene su propio componente de contenido',
            'Los recursos multimedia se asocian por courseId'
          ].map((item, index) => (
            <li key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-base text-gray-700 font-bold leading-tight">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
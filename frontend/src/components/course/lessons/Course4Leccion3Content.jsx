import { CheckCircle2 } from 'lucide-react';

export const Course4Leccion3Content = () => {
  return (
    <div className="py-6 flex flex-col gap-8 w-full">
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">✅</span>
          </div>
          <div>
            <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Evaluación • Prueba</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter mb-4">
              Lección 3: Evaluación de prueba
            </h2>
            <p className="text-gray-600 leading-relaxed text-base">
              En esta última lección encontrarás la evaluación del curso. Debes aprobar con un mínimo del{" "}
              <span className="text-[#f6811e] font-bold">90%</span> para completar el curso.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#f2ffef] rounded-[20px] border border-[#f6811e]/20 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-white text-[#f6811e] flex items-center justify-center flex-shrink-0 border border-[#f6811e]/20 shadow-sm">
            <span className="text-2xl font-black leading-none">!</span>
          </div>
          <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-xl lg:text-2xl leading-tight">
            Cómo completar el curso
          </h3>
        </div>
        <ul className="space-y-4">
          {[
            'Abre la pestaña Evaluación',
            'Responde las preguntas del quiz',
            'Obtén 90% o más para aprobar',
            'El botón final te devuelve a Mis Cursos'
          ].map((item, index) => (
            <li key={index} className="flex gap-4 items-center bg-white p-4 rounded-xl border border-[#f6811e]/10">
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
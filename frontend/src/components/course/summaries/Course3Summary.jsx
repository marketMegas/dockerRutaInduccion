import React from 'react';
import { Gem, Quote, Landmark, HelpCircle, Star } from 'lucide-react';

export const Course3Summary = () => {
  // Helper to highlight 'autoglp' and 'glp'
  const highlightText = (text) => {
    if (!text) return text;
    const parts = text.split(/(autoglp|glp)/gi);
    return parts.map((part, i) =>
      /(autoglp|glp)/i.test(part) ? (
        <span key={i} className="text-[#f6811e] lowercase font-bold">{part}</span>
      ) : part
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Cabecera Oportunidad */}
      <div className="flex items-center gap-6 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
          <Gem className="w-9 h-9" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter">
          {highlightText("¿Por qué la posventa es clave en AutoGLP?")}
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        {/* Frase Destacada (Quote Style) */}
        <div className="relative">
          <div className="absolute -top-6 -left-2 text-6xl text-[#f6811e]/20 font-serif">“</div>
          <div className="bg-[#f6811e]/5 p-8 rounded-3xl border border-[#f6811e]/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f6811e]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <p className="text-lg md:text-xl font-black text-[#f6811e] leading-tight uppercase tracking-tighter">
              "El 68% de los clientes que se van lo hacen por indiferencia percibida, no por precio."
            </p>
          </div>
        </div>

        {/* Primera Información (Pregunta Retórica) */}
        <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-[#f6811e] shadow-sm flex items-start gap-4 text-left">
          <p className="text-gray-700 leading-relaxed text-lg font-medium">
            <strong>¿Cuántas veces hemos escuchado que conseguir un cliente nuevo cuesta cinco veces más que mantener uno existente?</strong> En AutoGLP lo sabemos, y por eso la posventa no es el «último paso» del proceso comercial: es el primer paso de la siguiente venta.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Card 1 */}
          <div className="flex-1 min-w-[250px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-[#5fbd44] flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold">1</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-base text-justify">
              La posventa es el momento más importante del ciclo comercial de GASMAX AutoGLP.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex-1 min-w-[250px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold">2</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-base text-justify">
              A diferencia de otros productos, la conversión de un vehículo a GLP genera una relación de largo plazo entre el cliente, el sistema instalado y GASMAX como empresa proveedora. Un cliente satisfecho en la posventa vale, en promedio, 3 referencias directas adicionales en los primeros 6 meses.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex-1 min-w-[250px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold">3</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-base text-justify">
              Este MODULO está diseñado, para que todo técnico o vendedor de GASMAX entienda exactamente qué debe hacerse después de la instalación, con qué frecuencia, qué documentar y cómo convertir cada visita de mantenimiento en una oportunidad de referidos y ventas adicionales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

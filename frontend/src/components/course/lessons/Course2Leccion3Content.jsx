import React from 'react';
import { Users } from 'lucide-react';

export const Course2Leccion3Content = () => {
  return (
    <div className="py-6 flex flex-col gap-8 w-full">
      {/* TÍTULO PRINCIPAL */}
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0">
            <Users className="w-10 h-10" />
          </div>
          <div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter mb-4">VENTA CONSULTIVA</h2>
            <p className="text-gray-600 leading-relaxed text-base">
              La venta consultiva es una metodología comercial que transforma al vendedor en un asesor estratégico. Su objetivo es identificar los problemas, necesidades, oportunidades y motivaciones del cliente para construir una propuesta de valor clara, personalizada y convincente.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: INVESTIGACIÓN DEL CLIENTE */}
      <div className="bg-white rounded-[32px] border border-[#f6811e]/10 p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 border border-[#f6811e]/20 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
            Investigación del cliente
          </h2>
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-6">
          Antes del primer contacto, el vendedor debe investigar lo máximo posible.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {[
            "Qué tipo de empresa es.",
            "Dónde está ubicada.",
            "Qué productos o servicios ofrece.",
            "Qué tamaño tiene.",
            "Qué problemas podría tener.",
            "Qué competidores podrían atenderla.",
            "Qué oportunidades existen para la empresa.",
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#f6811e]/20">
                <span className="text-xs font-black">{idx + 1}</span>
              </div>
              <p className="text-gray-700 text-base leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#f2ffef] rounded-2xl p-5 border border-[#f6811e]/20">
          <p className="text-gray-700 text-base leading-relaxed font-semibold">
            Esta preparación permite llegar con preguntas inteligentes y generar una mejor primera impresión.
          </p>
        </div>
      </div>

      {/* SECCIÓN: AUDIENCIA Y CLIENTES */}
      <div className="bg-[#f3fff0] rounded-[32px] border border-[#f6811e]/20 p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Público Objetivo
            </h2>
            <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-widest mt-1">
              Perfil del Cliente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tarjeta 1 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f2ffef] flex items-center justify-center">
              <span className="text-xl">🚗</span>
            </div>
            <div>
              <h3 className="font-bold text-[#f6811e] uppercase text-[15px] mb-2">Parque automotor</h3>
              <p className="text-gray-600 font-medium leading-snug">
                Más de <span className="font-black text-[#f6811e] text-lg">18 millones</span> de vehículos.
              </p>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f2ffef] flex items-center justify-center">
              <span className="text-xl">🚕</span>
            </div>
            <div>
              <h3 className="font-bold text-[#f6811e] uppercase text-[15px] mb-2">Primeros sectores de adopción</h3>
              <p className="text-gray-600 font-medium leading-snug">
                Taxis, transporte público, empresas de logística y particulares que buscan ahorro.
              </p>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f2ffef] flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h3 className="font-bold text-[#f6811e] uppercase text-[15px] mb-2">Contexto del Mercado</h3>
              <p className="text-gray-600 font-medium leading-snug">
                Altos costos de gasolina / Incremento de GNV <span className="mx-1 text-[#f6811e] font-bold">→</span> Necesidad de alternativas.
              </p>
            </div>
          </div>

          {/* Tarjeta 4 (Conductores) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f2ffef] flex items-center justify-center">
              <span className="text-xl">👨‍✈️</span>
            </div>
            <div>
              <h3 className="font-bold text-[#f6811e] uppercase text-[15px] mb-2">Conductores</h3>
              <p className="text-gray-600 font-medium leading-snug">
                Mover la conversación del <span className="font-bold line-through text-gray-400">"precio por galón"</span> al <span className="font-black text-[#f6811e] bg-[#f2ffef] px-2 py-0.5 rounded ml-1">"costo total de propiedad y calidad de vida"</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NUEVA SECCIÓN: ARQUITECTURA DE PROMESA COMERCIAL */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-8 sm:p-10 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 border border-[#f6811e]/10 shadow-sm">
              <span className="text-2xl font-black">!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter">
              Arquitectura de promesa comercial
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="bg-[#f6811e] p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/20">
                <h3 className="text-white font-black uppercase tracking-wider text-center">Promesa</h3>
              </div>
              <div className="bg-gray-300 p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/20">
                <h3 className="text-white font-black uppercase tracking-wider text-center">Qué significa para el cliente</h3>
              </div>
              <div className="bg-[#f6811e] p-4 flex items-center justify-center">
                <h3 className="text-white font-black uppercase tracking-wider text-center">Cómo debe explicarla el asesor</h3>
              </div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 bg-white text-center">
                  <p className="text-[#f6811e] font-black text-lg uppercase tracking-tight leading-tight">Max Potencia</p>
                </div>
                <div className="p-6 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Responder mejor, trabajar más fino, sentir el vehículo confiable en operación real.</p>
                </div>
                <div className="p-6 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Instalación bien afinada, calibración y tuning correcto, respuesta stable y confianza para jornadas largas.</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 bg-white text-center">
                  <p className="text-[#f6811e] font-black text-lg uppercase tracking-tight leading-tight">Max Economía</p>
                </div>
                <div className="p-6 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Reducir costo operativo y proteger el ingreso del conductor.</p>
                </div>
                <div className="p-6 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Hasta 40% frente a gasolina sujeto a validación; comparativo diario, semanal y mensual; retorno estimado.</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 bg-white text-center">
                  <p className="text-[#f6811e] font-black text-lg uppercase tracking-tight leading-tight">Max Espacio</p>
                </div>
                <div className="p-6 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Libertad para operar con solución dual GLP + gasolina.</p>
                </div>
                <div className="p-6 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Continuidad operativa, flexibilidad ante ruta, cobertura y menor ansiedad por depender de una sola fuente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: PROPUESTA VALOR */}
      <div className="bg-[#f2ffef]/50 rounded-[32px] border border-[#f6811e]/10 p-8 sm:p-10 shadow-sm mt-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-white text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/10">
            <span className="text-3xl">💎</span>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Propuesta Valor
            </h2>
            <div className="h-1.5 w-24 bg-[#f6811e] mt-2 rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {/* Objetivo Estratégico */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f6811e]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <h3 className="text-[#f6811e] font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f6811e]"></span>
              Objetivo Estratégico
            </h3>
            <p className="text-[#f6811e] text-xl sm:text-2xl font-bold leading-tight relative z-10">
              Mover la conversación del <span className="text-gray-400 line-through decoration-2 mr-2">"precio por galón"</span>
              al <span className="text-[#f6811e]">"costo total de propiedad y calidad de vida"</span>.
            </p>
          </div>

          {/* Posicionamiento */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-[#f6811e] font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f6811e]"></span>
                Posicionamiento
              </h3>
              <p className="text-gray-700 text-lg font-medium leading-relaxed max-w-3xl">
                Posicionaremos <span className="font-black text-[#f6811e]">G-MAX</span> como la solución que ofrece mayor eficiencia y desempeño para el profesional del volante. Nuestra promesa de valor se centra en:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "MAX POTENCIA", imgUrl: "https://g-max.com.co/g3/g-max3-01.png" },
                { title: "MAX ECOMONÍA", imgUrl: "https://g-max.com.co/g3/g-max3-02.png" },
                { title: "MAX ESPACIO", imgUrl: "https://g-max.com.co/g3/g-max3-03.png" }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                  <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-500">
                    <img
                      src={item.imgUrl}
                      alt={item.title}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  <h4 className="font-black text-[#f6811e] text-lg tracking-tight uppercase">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Estrategia Mayor */}
          <div className="bg-[#f6811e] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h3 className="text-white/80 font-black uppercase tracking-widest text-sm mb-4">
                Estrategia Mayor
              </h3>
              <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-white">
                "G-MAX no es solo un combustible, es la modernización del transporte urbano."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const Course1Leccion2Content = () => {
  return (
    <div className="py-6 flex flex-col gap-8 w-full">
      {/* SECCIÓN 1: ENCABEZADO DE LA LEY */}
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0">
            {/* Icono de Documento/Ley */}
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Marco Legal • Resumen</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter mb-4">Ley 2128 de 2021</h2>
            <p className="text-gray-600 leading-relaxed text-base">
              Regulación para el uso de combustibles gaseosos como GLP, Gas Natural y <span className="text-[#f6811e] font-bold lowercase">autoglp</span> orientada a movilidad, industria, comercio y sostenibilidad energética.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: PUNTOS 1 Y 2 (GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* PUNTO 1: OBJETIVO PRINCIPAL */}
        <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">Objetivo principal</h3>
              <p className="text-xs text-[#f6811e] font-black uppercase tracking-widest mt-1">Punto 1</p>
            </div>
          </div>

          <p className="text-base text-gray-700 leading-relaxed mb-6 font-medium">
            La ley busca promover el uso del gas combustible (GLP y gas natural) para mejorar:
          </p>

          <ul className="space-y-4">
            {["El medio ambiente", "La salud de la población", "La calidad de vida", "El acceso a energía limpia"].map((item, index) => (
              <li key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-base text-[#f6811e] font-bold leading-tight">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* PUNTO 2: TIPOS DE COMBUSTIBLES */}
        <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">Tipos de combustibles</h3>
              <p className="text-xs text-[#f6811e] font-black uppercase tracking-widest mt-1">Punto 2</p>
            </div>
          </div>
          <ul className="space-y-4 mb-6">
            {[
              { label: "GLP (Gas Propano)", desc: "uso doméstico, comercial e industrial" },
              { label: "Gas natural", desc: "redes públicas y domiciliarias" },
              { label: "Gas vehicular", desc: "enfocado en transporte masivo y particular" }
            ].map((item, index) => (
              <li key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <p className="text-base text-gray-700 leading-tight font-medium">
                  <span className="font-bold text-[#f6811e] uppercase text-sm block mb-0.5">{item.label}</span>
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>

          <div className="bg-[#f2ffef] border border-[#f6811e]/20 rounded-xl p-4">
            <p className="text-[#f6811e] font-semibold text-[13px] leading-snug">
              👉 Esto es clave porque abre legalmente el uso del GLP en transporte y nuevas aplicaciones.
            </p>
          </div>
        </div>

      </div>

      {/* SECCIÓN 3: PUNTO MÁS IMPORTANTE (NUEVOS USOS) */}
      <div className="bg-[#f3fff0] rounded-[20px] border border-[#f6811e]/20 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-2xl">🚗</span>
          </div>
          <div>
            <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">Nuevos usos</h3>
            <p className="text-xs text-[#f6811e] font-black uppercase tracking-widest mt-1">Punto Más Importante</p>
          </div>
        </div>

        <p className="text-base text-gray-700 mb-8 font-medium">
          La ley impulsa el uso del gas en:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Movilidad */}
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🚘</span>
              <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-lg">Movilidad</h4>
            </div>
            <ul className="space-y-3">
              {[
                "Vehículos convertidos a gas (autoglp)",
                "Transporte público y carga",
                "Incentivos tributarios (ej: impuestos)"
              ].map((li, i) => (
                <li key={i} className="text-base text-gray-700 leading-snug flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f2ffef] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6811e]"></div>
                  </div>
                  <span className="font-medium">{li}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comercio */}
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🏪</span>
              <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-lg">Comercio y servicios</h4>
            </div>
            <ul className="space-y-3">
              {[
                "Cocción de alimentos (restaurantes)",
                "Negocios pequeños y medianos"
              ].map((li, i) => (
                <li key={i} className="text-base text-gray-700 leading-snug flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f2ffef] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6811e]"></div>
                  </div>
                  <span className="font-medium">{li}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Industria */}
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🏭</span>
              <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-lg">Industria</h4>
            </div>
            <ul className="space-y-3">
              <li className="text-base text-gray-700 leading-snug flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#f2ffef] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f6811e]"></div>
                </div>
                <span className="font-medium">Procesos productivos más limpios</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <section>
        {/* --- CONTINUACIÓN DEL RESUMEN DE LA LEY --- */}
        <div className="py-2 flex flex-col gap-8 w-full mt-4">

          <div className="bg-[#f2ffef] border border-[#f6811e]/30 rounded-[20px] p-8 shadow-sm flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-white text-[#f6811e] flex items-center justify-center flex-shrink-0 border border-[#f6811e]/20 shadow-sm">
              <span className="text-3xl font-black leading-none">!</span>
            </div>
            <div>
              <h4 className="text-[#f6811e] font-black uppercase tracking-widest text-sm mb-2">En Resumen</h4>
              <p className="text-[#f6811e] text-lg font-bold leading-tight">
                La <span className="text-[#f6811e]">Ley 2128</span> permite que el <span className="lowercase">autoglp</span> compita en igualdad de condiciones con otros combustibles, dándole seguridad al cliente y al inversionista.
              </p>
            </div>
          </div>

          {/* GRID DE 3 COLUMNAS PARA PUNTOS 4, 5 Y 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* PUNTO 4: ENFOQUE AMBIENTAL Y SOCIAL */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h3 className="font-black tracking-tighter text-[#10b981] uppercase text-left text-xl lg:text-2xl leading-tight">Enfoque ambiental<br />y social</h3>
                  <p className="text-[11px] text-[#10b981] font-black uppercase tracking-wider mt-1">Punto 4</p>
                </div>
              </div>

              <div className="self-start">
                <p className="text-[14px] text-[#10b981] font-black uppercase tracking-wide mb-4 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                  Sostenibilidad integral
                </p>
              </div>

              <p className="text-base text-gray-700 mb-4 font-medium">
                La ley posiciona el gas como:
              </p>

              <ul className="space-y-3 mb-6">
                {[
                  { label: "Energía de transición", desc: "(más limpia que gasolina)" },
                  { label: "Reducción de emisiones", desc: "(compromiso ambiental)" },
                  { label: "Mejora de la salud", desc: "(menos humo y hollín)" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start bg-emerald-50/50 py-2.5 px-3 rounded-xl border border-emerald-100/50">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    <p className="text-sm text-gray-700 leading-tight">
                      <span className="font-bold text-[#065f46] uppercase text-[11px] block mb-0.5">{item.label}</span>
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                <p className="text-[14px] text-gray-900 font-bold mb-2">👉 Beneficio principal:</p>
                <p className="text-[14px] text-gray-600 leading-snug">
                  Mejora en la calidad del aire y mayor bienestar para las comunidades vulnerables.
                </p>
              </div>
            </div>

            {/* PUNTO 5: SUBSIDIOS Y COBERTURA */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-2xl">🏡</span>
                </div>
                <div>
                  <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">Subsidios y cobertura</h3>
                  <p className="text-[11px] text-[#f6811e] font-black uppercase tracking-widest mt-1">Punto 5</p>
                </div>
              </div>

              <div className="self-start">
                <p className="text-[14px] text-[#f6811e] font-black uppercase tracking-wide mb-4 bg-[#f2ffef] px-3 py-1.5 rounded-lg inline-block">
                  Muy clave para GLP en cilindros
                </p>
              </div>

              <p className="text-base text-gray-700 mb-4 font-medium">La ley establece:</p>

              <ul className="space-y-3 mb-6">
                {[
                  "Subsidios hasta el 50% para estrato 1 y 40% para estrato 2",
                  "Expansión del GLP en zonas sin redes de gas",
                  "Alianzas público-privadas para zonas rurales"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#f6811e] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-tight font-medium">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                <p className="text-[14px] text-gray-900 font-bold mb-2">👉 Esto impacta directamente:</p>
                <p className="text-[14px] text-gray-600 leading-snug">
                  Tenderos, Negocios informales, Zonas vulnerables.
                </p>
              </div>
            </div>

            {/* PUNTO 6: SUSTITUCIÓN DE COMBUSTIBLES */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">Sustitución de combustibles</h3>
                  <p className="text-[11px] text-[#f6811e] font-black uppercase tracking-widest mt-1">Punto 6</p>
                </div>
              </div>

              <div className="self-start">
                <p className="text-[14px] text-[#f6811e] font-black uppercase tracking-wide mb-4 bg-[#f2ffef] px-3 py-1.5 rounded-lg inline-block">
                  Transición a energías limpias
                </p>
              </div>

              <p className="text-base text-gray-700 mb-4 font-medium">
                El gobierno debe promover el cambio de:
              </p>

              <div className="flex items-center justify-center gap-6 mb-6 bg-gray-50 py-4 px-3 rounded-xl border border-gray-100 min-h-[104px]">
                <ul className="text-[13px] text-gray-600 font-medium space-y-2">
                  <li>❌ Leña</li>
                  <li>❌ Carbón</li>
                </ul>
                <span className="text-xl">➡️</span>
                <div className="text-[#f6811e] font-black text-[14px] text-center leading-tight">
                  GAS<br />COMBUSTIBLE
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                <p className="text-[14px] text-gray-900 font-bold mb-2">👉 Esto es clave para:</p>
                <p className="text-[14px] text-gray-600 leading-snug">
                  Cocinas de negocios pequeños, emprendimientos de comida y sectores populares.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section>
        {/* --- CONTINUACIÓN: PUNTOS FINALES Y CONCLUSIÓN --- */}
        <div className="py-2 flex flex-col gap-8 w-full mt-2">

          {/* GRID DE 2 COLUMNAS PARA PUNTOS 7 Y 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* PUNTO 7: INNOVACIÓN Y NUEVAS TECNOLOGÍAS */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h3 className="font-black tracking-tighter text-[#f59e0b] uppercase text-left text-xl lg:text-2xl leading-tight">Innovación y<br />nuevas tecnologías</h3>
                  <p className="text-[11px] text-[#f59e0b] font-black uppercase tracking-widest mt-1">Punto 7</p>
                </div>
              </div>

              <div className="self-start">
                <p className="text-[14px] text-[#f59e0b] font-black uppercase tracking-wide mb-4 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                  Avance tecnológico
                </p>
              </div>

              <p className="text-base text-gray-700 mb-4 font-medium">
                La ley impulsa y promueve:
              </p>

              <ul className="space-y-3 mb-6">
                {[
                  "Desarrollo de nuevas tecnologías con gas",
                  "Cofinanciación de proyectos estatales",
                  "Uso del gas en nuevos sectores industriales"
                ].map((li, i) => (
                  <li key={i} className="flex gap-4 items-start bg-amber-50/50 py-3 px-4 rounded-xl border border-amber-100/50 transition-all hover:bg-white hover:shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-[#f59e0b] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-[14px] text-gray-700 leading-tight font-bold">
                      {li}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                <p className="text-[14px] text-gray-900 font-bold mb-2">👉 Oportunidad:</p>
                <p className="text-[14px] text-gray-600 leading-snug">
                  Apertura de nuevos mercados y modernización del sector energético.
                </p>
              </div>
            </div>

            {/* PUNTO 8: MENSAJE ESTRATÉGICO */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#5fbd44] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-black tracking-tighter text-[#5fbd44] uppercase text-left text-xl lg:text-2xl leading-tight">Mensaje estratégico<br />de la ley</h3>
                  <p className="text-[11px] text-[#5fbd44] font-black uppercase tracking-widest mt-1">Punto 8</p>
                </div>
              </div>

              <div className="self-start">
                <p className="text-[14px] text-[#5fbd44] font-black uppercase tracking-wide mb-4 bg-purple-50 px-3 py-1.5 rounded-lg inline-block">
                  Visión a futuro
                </p>
              </div>

              <p className="text-base text-gray-700 mb-4 font-medium">
                El propósito fundamental de la normativa:
              </p>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-center gap-4 mb-6 min-h-[188px]">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xl">❌</span>
                  <p className="text-[14px] text-gray-500 line-through decoration-gray-400 font-medium">
                    De ser un simple servicio básico…
                  </p>
                </div>
                <div className="flex justify-center -my-1">
                  <span className="text-2xl">⬇️</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5fbd44] text-xl mt-0.5 font-bold">✔️</span>
                  <p className="text-[15px] text-gray-800 font-black leading-snug">
                    A convertirse en un motor de desarrollo económico, social y ambiental.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                <p className="text-[14px] text-gray-900 font-bold mb-2">👉 Conclusión:</p>
                <p className="text-[14px] text-gray-600 leading-snug">
                  El gas es un pilar indispensable para la competitividad del país.
                </p>
              </div>
            </div>

          </div> {/* <--- AQUÍ ESTABA EL ERROR: ESTE DIV DEBE CERRAR EL GRID 7/8 ANTES DE ABRIR EL SIGUIENTE */}

          {/* GRID FINAL: CONCLUSIÓN Y NEGOCIO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">

            {/* CONCLUSIÓN CLARA */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center shadow-sm flex-shrink-0 border border-[#f6811e]/10">
                  <span className="text-3xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Conclusión clara</h3>
                  <p className="text-[14px] text-gray-500 font-medium mt-1">La Ley 2128:</p>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">Legaliza y promueve el uso del GLP en más sectores</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">Impulsa la movilidad a gas (autoglp)</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">Apoya a poblaciones vulnerables con subsidios</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">Busca reemplazar combustibles contaminantes</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">Posiciona el gas como energía clave en la transición energética</p>
                </li>
              </ul>
            </div>

            {/* TRADUCCIÓN A NEGOCIO */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col h-full">
              {/* ENCABEZADO */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center shadow-sm flex-shrink-0 border border-[#f6811e]/10">
                  <span className="text-3xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase leading-tight">
                    Traducción a negocio
                  </h3>
                  <p className="text-[14px] text-gray-500 font-medium mt-1">
                    Esta ley te da respaldo para:
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-6">
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">
                    Promover GLP en tenderos
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">
                    Impulsar autoglp en transporte
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">✔</span>
                  <p className="text-[14px] text-gray-700 leading-tight font-medium">
                    Crear programas sociales (como el que diseñamos)
                  </p>
                </li>
              </ul>

              {/* NOTA IMPORTANTE */}
              <div className="bg-[#f6811e] p-4 rounded-[16px] shadow-lg shadow-[#f6811e]/20 flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-[#f6811e] text-xl font-black">!</span>
                </div>
                <div>
                  <p className="text-[14px] text-[#f6811e] font-black uppercase tracking-wide leading-tight">
                    Argumentar ahorro + sostenibilidad
                  </p>
                  <p className="text-[14px] text-[#f6811e]/80 font-bold uppercase tracking-widest">
                    (Muy importante para ti)
                  </p>
                </div>
              </div>
            </div>

          </div> {/* CIERRE GRID FINAL */}

        </div>
      </section>
    </div>
  );
};
import React from 'react';
import { Users, Calendar, MessageSquare, CheckSquare, Shield, Target } from 'lucide-react';

export const Course3Leccion4Content = () => {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 sm:p-10 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left mb-8">
        <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/10">
          <Target className="w-10 h-10" />
        </div>
        <div>
          <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Objetivos y Seguimiento • Módulo 3</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f6811e] uppercase tracking-tighter">
            Estándares de calidad y tiempos de respuesta en AutoGLP
          </h2>
        </div>
      </div>

      <p className="text-gray-600 leading-relaxed text-base text-left mb-6">
        Los estándares de <span className="text-[#f6811e] font-semibold">autoglp</span> no son aspiraciones: son compromisos medibles.
        Su cumplimiento se monitorea semanalmente por el líder de equipo y se consolida en el reporte mensual de gestión. Conocerlos es el primer paso para cumplirlos sistemáticamente.
      </p>

      <div className="p-6 md:p-10 bg-gray-50/50 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2">
            <span className="text-3xl font-black text-[#f6811e]">&lt; 48 h</span>
            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Contacto post-entrega</p>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2">
            <span className="text-3xl font-black text-[#f6811e]">&lt; 4 h</span>
            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Respuesta a solicitudes</p>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2">
            <span className="text-3xl font-black text-[#f6811e]">≥ 70</span>
            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">NPS objetivo mensual</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ESTÁNDARES */}
      <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-green-50/40 p-8 sm:p-10 mt-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">

        {/* Glow decorativo */}



        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

          {/* ESTÁNDARES DE COMUNICACIÓN */}
          <div className="group rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-sm p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(246, 129, 30,0.10)]">

            <div className="mb-6 inline-flex items-center px-4 py-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#f6811e] uppercase tracking-tighter">
                Estándares de Comunicación
              </h2>
            </div>

            <ul className="space-y-5 text-base leading-relaxed text-slate-600 list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  Toda llamada o correo de un cliente debe recibir respuesta dentro de las{" "}
                  <strong className="font-bold text-slate-900">
                    primeras 4 horas
                  </strong>{" "}
                  hábiles.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  El primer contacto posventa (post-entrega del vehículo) se realiza dentro de las{" "}
                  <strong className="font-bold text-slate-900">
                    48 horas siguientes
                  </strong>
                  , sin excepción.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  Cada interacción con el cliente debe quedar registrada en el CRM{" "}
                  <strong className="font-bold text-slate-900">
                    antes de cerrar la jornada laboral del mismo día
                  </strong>
                  .
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  El lenguaje utilizado con el cliente debe ser claro, positivo y{" "}
                  <strong className="font-bold text-slate-900">
                    libre de tecnicismos
                  </strong>{" "}
                  que generen confusión.
                </span>
              </li>
            </ul>
          </div>

          {/* ESTÁNDARES DE SERVICIO TÉCNICO */}
          <div className="group rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-sm p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(246, 129, 30,0.10)]">

            <div className="mb-6 inline-flex items-center  px-4 py-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#f6811e] uppercase tracking-tighter">
                Estándares de Servicio Técnico
              </h2>
            </div>

            <ul className="space-y-5 text-base leading-relaxed text-slate-600 list-none">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  El tiempo máximo de espera para programar una cita de mantenimiento preventivo es de{" "}
                  <strong className="font-bold text-slate-900">
                    5 días hábiles
                  </strong>
                  .
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  El cliente{" "}
                  <strong className="font-bold text-slate-900">
                    must be informado del (debe ser informado del)
                  </strong>{" "}
                  estado de su vehículo al menos una vez durante el proceso de servicio, sin necesidad de que él pregunte.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  Cualquier trabajo adicional al acordado debe ser consultado y{" "}
                  <strong className="font-bold text-slate-900">
                    aprobado por el cliente
                  </strong>{" "}
                  antes de ejecutarse.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 min-w-[8px] rounded-full bg-[#f6811e]" />
                <span>
                  El vehículo se entrega{" "}
                  <strong className="font-bold text-slate-900">
                    limpio, con todas las novedades explicadas
                  </strong>{" "}
                  y documentadas en el registro de servicio.
                </span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">

        {/* CARD 1 */}
        <div className="relative overflow-hidden rounded-[40px] bg-white border border-slate-200 p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">

          {/* DECORACIÓN */}
          <div className="absolute top-0 left-0 h-1.5 w-full bg-[#5fbd44]" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#5fbd44]/5 blur-3xl" />

          {/* HEADER */}
          <div className="flex items-center gap-6 mb-12">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f6fff3]">
              <svg
                className="w-12 h-12 text-[#5fbd44]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#f6811e] uppercase tracking-tighter">
                Estándares de Satisfacción
              </h2>
              <div className="mt-4 h-1.5 w-28 rounded-full bg-[#5fbd44]" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="relative pl-10 space-y-14">
            {/* Línea vertical */}
            <div className="absolute left-[10px] top-2 bottom-2 w-px bg-slate-200" />

            {/* ITEM */}
            <div className="relative">
              <div className="absolute -left-10 top-2 h-5 w-5 rounded-full border-4 border-white bg-[#5fbd44] shadow-md" />
              <p className="text-slate-800 text-base leading-relaxed font-normal">
                La encuesta NPS debe enviarse dentro de las 24 horas siguientes a la entrega del vehículo tras un servicio.
              </p>
            </div>

            {/* ITEM */}
            <div className="relative">
              <div className="absolute -left-10 top-2 h-5 w-5 rounded-full border-4 border-white bg-[#5fbd44] shadow-md" />
              <p className="text-slate-800 text-base leading-relaxed font-normal">
                Los comentarios negativos (puntuación NPS 0–6) requieren contacto del asesor dentro de las 24 horas para gestión de la insatisfacción.
              </p>
            </div>

            {/* ITEM */}
            <div className="relative">
              <div className="absolute -left-10 top-2 h-5 w-5 rounded-full border-4 border-white bg-[#5fbd44] shadow-md" />
              <p className="text-slate-800 text-base leading-relaxed font-normal">
                El índice de retención de clientes activos debe mantenerse por encima del 75% mensual en el área de posventa.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="relative overflow-hidden rounded-[40px] bg-white border-2 border-[#5fbd44] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">

          {/* DECORACIÓN */}
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#5fbd44]/5 blur-3xl" />

          {/* HEADER */}
          <div className="flex items-center gap-6 mb-12">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f6fff3]">
              <svg
                className="w-12 h-12 text-[#5fbd44]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.285-3.95a1 1 0 00-.363-1.118l-3.36-2.44c-.784-.57-.38-1.81.588-1.81h4.153a1 1 0 00.951-.69l1.286-3.95z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#f6811e] uppercase tracking-tighter">
                Buenas Prácticas
              </h2>
              <div className="mt-4 h-1.5 w-28 rounded-full bg-[#5fbd44]" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="space-y-6">
            <p className="text-slate-800 text-base leading-relaxed font-normal">
              El mercado de conversiones a{" "}
              <span className="font-bold text-[#5fbd44]">autoglp</span>{" "}
              en América Latina ha madurado significativamente en los últimos años.
            </p>

            <p className="text-slate-700 italic text-base leading-relaxed font-normal">
              Distribuidores líderes en Colombia, Ecuador y Perú han desarrollado prácticas que{" "}
              <span className="text-[#5fbd44] font-medium">autoglp</span>{" "}
              puede adaptar para elevar su propuesta de valor posventa. Una de las más relevantes, es el
            </p>

            <p className="text-base leading-relaxed font-black text-slate-900 uppercase tracking-wide">
              Seguimiento estructurado a los 30–60–90 días
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
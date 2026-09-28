import React from 'react';
import { Target, TrendingUp, PhoneCall, Users, CheckCircle2, Award, Calendar } from 'lucide-react';

export const Course3Leccion3Content = () => {
  const kpis = [
    {
      title: "Contactos nuevos",
      target: "5 diarias / 20 semanales",
      desc: "Prospección real",
      icon: <PhoneCall className="w-6 h-6 text-[#f6811e]" />,
      bgColor: "bg-[#f2ffee]"
    },
    {
      title: "Diagnósticos efectivos",
      target: "1 diario / 5 semanales",
      desc: "Calidad de conversación.",
      icon: <Users className="w-6 h-6 text-[#10b981]" />,
      bgColor: "bg-[#f0fdf4]"
    },
    {
      title: "Cotizaciones Emitidas",
      target: "5 semanales",
      desc: "Avance comercial.",
      icon: <Target className="w-6 h-6 text-[#ff9800]" />,
      bgColor: "bg-[#fffbeb]"
    },
    {
      title: "Cierres",
      target: "1 diario / 5 semanales",
      desc: "Conversión",
      icon: <Award className="text-base text-[#5fbd44]" />,
      bgColor: "bg-[#f6fff3]"
    }
  ];

  return (
    <div className="py-6 flex flex-col w-full gap-8">
      {/* CARD PRINCIPAL DE BIENVENIDA */}





      {/* METAS / OBJETIVOS - ADAPTADO DE LA IMAGEN */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col p-6 sm:p-8">

        {/* Encabezado */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f6fff3] text-[#5fbd44] flex items-center justify-center border border-[#5fbd44]/10 shadow-sm">
              <Calendar className="w-7 h-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f6811e] uppercase tracking-tighter">
              Metas / Objetivos
            </h2>

          </div>
        </div>

        {/* METAS Y KPIS CLAVE - Tarjetas Grises con mejor Padding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-start gap-6 hover:bg-gray-100/80 transition-colors"
            >
              <div className={`p-4 rounded-2xl ${kpi.bgColor} shrink-0`}>
                {kpi.icon}
              </div>
              <div className="text-left">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Meta recomendada</span>
                <h3 className="text-xl font-bold text-[#f6811e] mt-0.5">{kpi.title}</h3>
                <p className="text-2xl font-black text-[#f6811e] mt-1 mb-2">{kpi.target}</p>
                <p className="text-gray-500 text-base leading-relaxed">{kpi.desc}</p>
              </div>
            </div>
          ))}
        </div>


        <div className="p-6 md:p-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

            {/* Cabecera de la tabla */}
            <div className="hidden md:grid md:grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="p-4 font-black uppercase text-xs tracking-wider text-gray-600 text-center">Indicador</div>
              <div className="p-4 font-black uppercase text-xs tracking-wider text-white bg-[#f6811e] text-center border-l border-r border-[#f6811e]">Meta</div>
              <div className="p-4 font-black uppercase text-xs tracking-wider text-gray-600 text-center">Lectura gerencial</div>
            </div>

            <div className="flex flex-col">

              {/* Fila 4 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-4 md:p-6 flex items-center bg-white">
                  <span className="font-bold text-[#f6811e] text-base">Pruebas sociales enviadas</span>
                </div>
                <div className="p-4 md:p-6 flex items-center md:border-l md:border-r border-gray-200 bg-gray-50 md:bg-white text-left md:text-center">
                  <p className="text-[#f6811e] font-bold text-base w-full">5 semanales</p>
                </div>
                <div className="p-4 md:p-6 flex items-center bg-white text-left">
                  <p className="text-gray-600 text-base">Construcción de confianza.</p>
                </div>
              </div>

              {/* Fila 6 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-4 md:p-6 flex items-center bg-white">
                  <span className="font-bold text-[#f6811e] text-base">Audios o llamadas auditadas</span>
                </div>
                <div className="p-4 md:p-6 flex items-center md:border-l md:border-r border-gray-200 bg-gray-50 md:bg-white text-left md:text-center">
                  <p className="text-[#f6811e] font-bold text-base w-full">3 por semana</p>
                </div>
                <div className="p-4 md:p-6 flex items-center bg-white text-left">
                  <p className="text-gray-600 text-base">Calidad del lenguaje.</p>
                </div>
              </div>

              {/* Fila 7 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-4 md:p-6 flex items-center bg-white">
                  <span className="font-bold text-[#f6811e] text-base">Asistencia a formación</span>
                </div>
                <div className="p-4 md:p-6 flex items-center md:border-l md:border-r border-gray-200 bg-gray-50 md:bg-white text-left md:text-center">
                  <p className="text-[#f6811e] font-bold text-base w-full">100%</p>
                </div>
                <div className="p-4 md:p-6 flex items-center bg-white text-left">
                  <p className="text-gray-600 text-base">Disciplina de academia.</p>
                </div>
              </div>

              {/* Fila 8 */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200">
                <div className="p-4 md:p-6 flex items-center bg-white">
                  <span className="font-bold text-[#f6811e] text-base">Recertificación al día</span>
                </div>
                <div className="p-4 md:p-6 flex items-center md:border-l md:border-r border-gray-200 bg-gray-50 md:bg-white text-left md:text-center">
                  <p className="text-[#f6811e] font-bold text-base w-full">100%</p>
                </div>
                <div className="p-4 md:p-6 flex items-center bg-white text-left">
                  <p className="text-gray-600 text-base">Sostenibilidad del estándar.</p>
                </div>
              </div>




            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { TrendingUp, BarChart3, LineChart, ShieldAlert } from 'lucide-react';

export const Course3Leccion5Content = () => {
  const data = [
    { city: "Bogotá - Sede Norte", projected: 45, real: 42, percentage: "93%" },
    { city: "Bogotá - Sede Sur", projected: 50, real: 48, percentage: "96%" },
    { city: "Cali", projected: 30, real: 28, percentage: "93%" },
    { city: "Medellín", projected: 35, real: 38, percentage: "108%" },
    { city: "Barranquilla", projected: 20, real: 15, percentage: "75%" }
  ];

  return (
    <div className="py-6 flex flex-col w-full gap-8">
      {/* CARD PRINCIPAL */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-8 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left mb-8">
          <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/10">
            <BarChart3 className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Proyecciones y Reportes • Módulo 5</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f6811e] uppercase tracking-tighter">Proyecciones y Datos</h2>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed text-base text-left mb-6">
          Las proyecciones comerciales sustentan la viabilidad operativa y financiera del negocio de <span className="text-[#f6811e] font-semibold">autoglp</span>. Nos permiten predecir las ventas del mes, el flujo de caja estimado de las cuotas de conversión y la planeación de la compra de insumos técnicos (tanques, reguladores, sensores y centralitas).
        </p>
      </div>

      {/* REPORTE DE EJEMPLO DE CUMPLIMIENTO */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col text-left">
        <div className="p-8 sm:p-10 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center border border-[#f6811e]/10 shadow-sm">
              <LineChart className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-[#f6811e] uppercase tracking-tighter">Ejemplo de Reporte Mensual de Conversión</h3>
          </div>
        </div>

        <div className="p-6 md:p-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 font-black uppercase text-xs tracking-wider text-gray-600">Sede / Ciudad</div>
              <div className="p-4 font-black uppercase text-xs tracking-wider text-gray-600 text-center">Meta Proyectada</div>
              <div className="p-4 font-black uppercase text-xs tracking-wider text-gray-600 text-center">Logrado (Real)</div>
              <div className="p-4 font-black uppercase text-xs tracking-wider text-gray-600 text-center">% Cumplimiento</div>
            </div>
            <div className="flex flex-col">
              {data.map((row, i) => (
                <div key={i} className="grid grid-cols-4 border-t border-gray-200">
                  <div className="p-4 flex items-center bg-white text-left font-bold text-gray-800 text-sm">{row.city}</div>
                  <div className="p-4 flex items-center justify-center bg-white font-medium text-gray-600 text-sm">{row.projected} vehículos</div>
                  <div className="p-4 flex items-center justify-center bg-white font-black text-gray-800 text-sm">{row.real} vehículos</div>
                  <div className="p-4 flex items-center justify-center bg-white">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      parseInt(row.percentage) >= 100 
                        ? 'bg-green-100 text-green-700' 
                        : (parseInt(row.percentage) >= 90 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                    }`}>
                      {row.percentage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IMPORTANCIA DE LA PLANEACIÓN DE STOCK */}
      <div className="bg-[#fffbeb] rounded-3xl border border-amber-200 p-8 text-left flex flex-col md:flex-row gap-6 items-start">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-amber-900 mb-2">Importancia Crítica: Abastecimiento del Taller</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            Las proyecciones de ventas no solo sirven para el seguimiento de cuotas de asesores. Su utilidad principal es el **abastecimiento de componentes**. Un taller con 15 citas de conversión agendadas para la semana no puede quedarse sin tanques toroidales o multiválvulas de repuesto, ya que cada día de retraso daña la confianza del cliente y genera un lucro cesante para el conductor.
          </p>
        </div>
      </div>
    </div>
  );
};

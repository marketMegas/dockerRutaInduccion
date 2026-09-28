import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';

export const Course1Summary = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
          <Flame className="w-9 h-9" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-[#f6811e]">
          ¿Qué es el autoglp?
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        {/* 1. Introducción y Definición */}
        <div className="space-y-4 text-gray-600 leading-relaxed text-base text-left">
          <p>
            El <strong className="text-gray-900 font-bold"><span className="text-[#f6811e]">autoglp</span> o Gas Licuado Propano para automoción <span className="text-[#f6811e]">(autoglp)</span></strong> es un combustible alternativo limpio y eficiente, utilizado en vehículos con motor de combustión interna, ya sea de forma exclusiva o bajo un sistema bicombustible (<span className="text-[#f6811e]">glp</span> + gasolina). Es una mezcla de hidrocarburos ligeros, compuesta principalmente por <span className="text-[#f6811e] font-semibold">propano y butano</span>.
          </p>
        </div>

        {/* 2. Ventaja Técnica (Destacado) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-[#f6811e]">
            <p className="text-sm text-gray-700 italic">
              "En <span className="text-[#f6811e]">autoglp</span>, el combustible se utiliza mediante un sistema de conversión certificado, diseñado para trabajar en conjunto con el motor original sin afectar su funcionamiento ni su durabilidad."
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border-l-4 border-[#5fbd44]">
            <p className="text-sm text-gray-700">
              Su ventaja técnica frente a los combustibles líquidos pesados es su estado físico: es un gas a temperatura ambiente que se licúa a baja presión. Esto permite almacenar gran cantidad de energía en <strong className="text-gray-800">tanques vehiculares compactos</strong>, sin requerir cilindros pesados de alta presión como los del Gas Natural Vehicular (GNV).
            </p>
          </div>
        </div>

        {/* 3. Compromiso Ambiental */}
        <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
          <p className="text-gray-700 text-base">
            Aunque proviene de fuentes fósiles, su combustión es excepcionalmente limpia, lo que lo clasifica como un combustible alternativo de bajas emisiones, vital para las estrategias de descarbonización a corto plazo.
          </p>
        </div>

        {/* 4. Crisis del Aire y Contaminantes */}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900">La Crisis del Aire Urbano y los "Enemigos Invisibles"</h3>
          </div>

          {/* Fijado a 16px exactos */}
          <p className="text-[16px] text-gray-600 mb-6">
            Para entender el valor ecológico del <span className="text-[#f6811e] font-bold">autoglp</span>, debemos conocer qué contaminan los motores de combustión interna tradicionales, los cuales emiten gases tóxicos que superan los límites de la <strong>OMS</strong>:
          </p>

          <div className="grid gap-4 sm:grid-cols-1">
            {[
              {
                label: "Óxidos de Nitrógeno (NOx)",
                desc: "Típicos del diésel. Causan problemas respiratorios severos y generan el 'smog' urbano."
              },
              {
                label: "Material Particulado (PM10 y PM2.5)",
                desc: "Hollín fino que penetra profundamente en los pulmones y el sistema circulatorio."
              },
              {
                label: "Monóxido de Carbono (CO)",
                desc: "Gas incoloro e inodoro resultante de la combustión incompleta."
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mt-1.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                </div>
                {/* Cambiado de text-sm a text-[16px] para igualar el tamaño del párrafo superior */}
                <p className="text-[16px] leading-relaxed text-gray-600 text-left">
                  <strong className="text-gray-900">{item.label}:</strong> {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Gem, Briefcase, Target, TrendingUp, MessageSquare, CheckCircle2 } from 'lucide-react';

export const Course2Summary = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Cabecera Oportunidad */}
      <div className="flex items-center gap-6 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
          <Gem className="w-9 h-9" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter">
          ¿Por qué autoglp es una Oportunidad?
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        {/* 1. Contexto y Potencial */}
        <div className="space-y-6 text-gray-700 leading-relaxed text-base text-left">
          <p className="text-lg font-medium text-gray-800">
            Con las nuevas <span className="text-[#f6811e] font-bold">Regulaciones Ambientales y de Movilidad</span> del País, el potencial es reemplazar hasta el <span className="text-2xl font-black text-[#f6811e]">50%</span> de la matriz energética de combustible en vehículos (gasolina y diésel) con un combustible alternativo (<span className="text-[#f6811e] font-bold lowercase">autoglp</span>).
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-[#f6811e] shadow-sm">
            <p>
              Esto disminuirá el impacto negativo en el medio ambiente <span className="font-bold">(GEI)</span>, mediante un nuevo producto para la EDS, en donde el consumidor tiene un <span className="text-[#f6811e] font-black text-xl">ahorro hasta del 40%</span>. Por lo anterior es viable establecer una red y un sistema de distribución en Colombia.
            </p>
          </div>
        </div>

        {/* 3. Proceso Comercial */}
        <div className="mt-12 flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
              <Briefcase className="w-9 h-9" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-[#f6811e] uppercase tracking-tighter">
              Proceso Comercial
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Punto 1 */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">
                La misión de ventas es convertir <span className="font-bold">gasto de combustible</span> en rentabilidad, continuidad operativa y tener una marca aspiracional.
              </p>
            </div>

            {/* Punto 2 */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">
                La propuesta central es ayudar al conductor a <span className="font-bold">ganar más con su carro</span> sin renunciar a autonomía ni desempeño.
              </p>
            </div>

            {/* Punto 3 */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">
                El vendedor debe actuar como <span className="font-bold">consultor comercial automotriz</span> y explicar técnica en términos de negocio.
              </p>
            </div>

            {/* Punto 4 */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">
                El lenguaje debe ser <span className="font-bold">directo, humano, aspiracional</span> y siempre vinculado a resultados reales del día a día.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Cita Estratégica (Quote) - ESTE ERA EL COMENTARIO ROTO */}

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-[#f6811e] mb-4">Administración del CRM</h3>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Card 1: Primer contacto posventa */}
            <div className="flex-1 min-w-[250px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-[#5fbd44] flex items-center justify-center">
                <span className="text-3xl font-bold">1</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-base text-justify">
                El primer contacto posventa ocurre dentro de las primeras 48 horas después de la entrega del vehículo. El objetivo no es vender nada: es confirmar que el cliente recibió lo que esperaba, que no tiene dudas sobre el funcionamiento de su sistema GLP y que sabe exactamente a quién llamar si tiene alguna inquietud. Este momento establece el tono de toda la relación futura.
              </p>
            </div>
            {/* Card 2: Diagnóstico */}
            <div className="flex-1 min-w-[250px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <span className="text-3xl font-bold">2</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-base text-justify">
                Diagnóstico: En esta etapa el asesor revisa el historial del cliente en el CRM: servicios pendientes, garantías activas, fecha de próximo mantenimiento y cualquier alerta técnica generada por el área de servicio. El diagnóstico no es reactivo — no esperamos a que el cliente llame. Tomamos la iniciativa de identificar lo que el cliente necesitará antes de que él mismo lo sepa.
              </p>
            </div>
            {/* Card 3: Gestión */}
            <div className="flex-1 min-w-[250px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center">
                <span className="text-3xl font-bold">3</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-base text-justify">
                Gestión: Es la ejecución del servicio acordado — mantenimientos, revisiones, reparaciones, actualizaciones de firmware GLP u otros servicios complementarios. Durante esta etapa, el asesor mantiene al cliente informado del avance, comunica cualquier novedad y registra cada interacción en el CRM. La trazabilidad es fundamental: lo que no está en el sistema, no existe.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 relative">
          <div className="absolute -top-6 -left-2 text-6xl text-[#f6811e]/20 font-serif">“</div>
          <div className="bg-[#f6811e]/5 p-10 rounded-[32px] border border-[#f6811e]/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f6811e]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <p className="text-xl md:text-2xl font-black text-[#f6811e] leading-tight mb-6 uppercase tracking-tighter">
              “LA CONVERGENCIA DE ENERGÍAS ALTERNATIVAS Y COMBUSTIBLES MÁS LIMPIOS SON EL CAMINO HACIA LA TRANSICIÓN EN LA MOVILIDAD”
            </p>

            <div className="flex flex-col items-center gap-2">
              <div className="h-px w-12 bg-[#f6811e]"></div>
              <p className="text-sm font-bold text-[#f6811e] tracking-[0.3em] uppercase">
                - NEWGEN SAS -
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
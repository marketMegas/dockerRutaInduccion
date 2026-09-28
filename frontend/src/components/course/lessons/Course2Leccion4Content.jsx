import React, { useState } from 'react';
import { 
  Filter, 
  Info, 
  Target, 
  Magnet, 
  MessageSquare, 
  ClipboardList, 
  Sparkles, 
  Award, 
  HeartHandshake, 
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import vendedorSuv from '../../../assets/vendedor-suv.png';

// Helper to highlight 'autoglp' and 'glp' in cian color and lowercase
const highlightText = (text) => {
  if (!text) return text;
  const parts = text.split(/(autoglp|glp)/gi);
  return parts.map((part, i) =>
    /(autoglp|glp)/i.test(part) ? (
      <span key={i} className="text-[#f6811e] lowercase font-semibold">{part.toLowerCase()}</span>
    ) : part
  );
};

export const Course2Leccion4Content = () => {
  const [activeStage, setActiveStage] = useState(1);

  const matrixData = [
    {
      always: "Solución dual GLP + gasolina",
      avoid: "Solo gas",
      reason: "La dualidad comunica versatilidad y continuidad."
    },
    {
      always: "Ahorro validado con tu vehículo y tu ruta",
      avoid: "Te vas a ahorrar exactamente X",
      reason: "Protege credibilidad y reduce sobrepromesa."
    },
    {
      always: "Instalación, afinación y respaldo",
      avoid: "Solo te montamos el equipo",
      reason: "Refuerza experiencia superior de servicio."
    },
    {
      always: "Mejora de costo operativo por kilómetro",
      avoid: "Gas barato",
      reason: "Sube el nivel consultivo del discurso."
    },
    {
      always: "Hasta 40% frente a gasolina",
      avoid: "40% fijo para todos",
      reason: "El claim debe mantenerse condicionado."
    },
    {
      always: "Tecnología italiana de alta precisión",
      avoid: "Eso nunca falla",
      reason: "Promueve valor sin absolutos riesgosos."
    }
  ];

  const funnelStages = [
    {
      id: 1,
      title: "Atracción",
      whatHappens: "El cliente conoce la marca por redes, publicidad, referidos,",
      commercialGoal: "Generar interés.",
      icon: Magnet,
      color: "from-[#5fbd44] to-[#f6811e]",
      widthClass: "md:w-full"
    },
    {
      id: 2,
      title: "Interés",
      whatHappens: "El cliente pide información, pregunta precios o muestra una necesidad.",
      commercialGoal: "Captar sus datos y entender qué necesita.",
      icon: MessageSquare,
      color: "from-[#5fbd44] to-[#f6811e]",
      widthClass: "md:w-[93%]"
    },
    {
      id: 3,
      title: "Diagnóstico",
      whatHappens: "El vendedor analiza el problema, consumo, presupuesto y urgencia del cliente.",
      commercialGoal: "Identificar si es una oportunidad real.",
      icon: ClipboardList,
      color: "from-[#5fbd44] to-[#f6811e]",
      widthClass: "md:w-[86%]"
    },
    {
      id: 4,
      title: "Propuesta",
      whatHappens: "Se presenta una solución ajustada a la necesidad del cliente.",
      commercialGoal: "Demostrar valor, no solo precio.",
      icon: Sparkles,
      color: "from-[#f6811e] to-[#5fbd44]",
      widthClass: "md:w-[79%]"
    },
    {
      id: 5,
      title: "Cierre",
      whatHappens: "El cliente acepta la oferta y realiza la compra o firma contrato.",
      commercialGoal: "Convertir la oportunidad en venta.",
      icon: Award,
      color: "from-[#f6811e] to-[#5fbd44]",
      widthClass: "md:w-[72%]"
    },
    {
      id: 6,
      title: "Fidelización",
      whatHappens: "Se hace seguimiento después de la compra.",
      commercialGoal: "Lograr recompra, retención y referidos.",
      icon: HeartHandshake,
      color: "from-[#5fbd44] to-[#f6811e]",
      widthClass: "md:w-[65%]"
    }
  ];

  return (
    <div className="py-6 flex flex-col gap-8 w-full">
      {/* TÍTULO PRINCIPAL */}
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0">
            <Filter className="w-10 h-10" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#f6811e] mb-2">Proceso comercial • módulo 2</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter mb-4">Embudo de Ventas</h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Aprende a gestionar cada etapa del proceso comercial, desde la prospección hasta el cierre exitoso y el seguimiento postventa, garantizando una alta tasa de conversión para sistemas autoglp.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: ¿QUÉ ES? */}
      <div className="bg-white rounded-[32px] border border-[#f6811e]/10 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f6811e]/5 rounded-bl-[100px] -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/20">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              ¿Qué es?
            </h2>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <p className="text-gray-700 text-base leading-relaxed">
            El embudo de ventas es el proceso que sigue un posible cliente desde que conoce una empresa hasta que finalmente compra y, después, puede volver a comprar o recomendar.
          </p>
          <div className="pl-6 border-l-4 border-[#f6811e]">
            <p className="text-gray-600 text-base leading-relaxed italic">
              Se llama "embudo" porque al inicio entran muchas personas interesadas, pero solo una parte avanza hasta convertirse en clientes.
            </p>
          </div>
          <p className="text-gray-700 text-base leading-relaxed">
            El embudo ayuda a que el equipo comercial no venda de forma desordenada. Permite saber cuántos clientes están interesados, cuántos recibieron propuesta, cuántos compraron y dónde se están perdiendo oportunidades.
          </p>

          <div className="mt-8 bg-gradient-to-br from-[#f2ffef] to-white rounded-2xl p-6 sm:p-8 border border-[#f6811e]/20 shadow-sm">
            <div className="flex items-start gap-4">
              <Target className="w-8 h-8 text-[#f6811e] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-bold text-[#f6811e] mb-2">En resumen:</h3>
                <p className="text-gray-700 text-base leading-relaxed font-semibold">
                  El embudo de ventas organiza el camino del cliente y permite convertir contactos en ventas reales mediante seguimiento, diagnóstico y una buena propuesta de valor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE CONTENIDO INTERACTIVO */}
      <div className="bg-[#f3fff0] rounded-[32px] border border-[#f6811e]/20 p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Etapas del Embudo
            </h2>
            <p className="text-sm font-bold text-[#f6811e] mt-1">
              Componente interactivo
            </p>
          </div>
        </div>

        {/* CONTENEDOR DEL FUNNEL VERTICAL */}
        <div className="relative flex flex-col items-center gap-6 w-full py-4">
          
          {/* Línea vertical decorativa conectando las etapas */}
          <div className="absolute top-8 bottom-8 w-1 bg-gradient-to-b from-green-300 via-[#f6811e] to-[#f6811e]/50 rounded-full z-0 pointer-events-none"></div>

          {funnelStages.map((stage) => {
            const isActive = activeStage === stage.id;
            const Icon = stage.icon;
            
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                className={`
                  z-10 w-full ${stage.widthClass} transition-all duration-500 ease-out cursor-pointer select-none
                  rounded-[24px] border bg-white p-5 md:p-6
                  ${isActive 
                    ? 'border-[#f6811e] shadow-[0_15px_30px_-5px_rgba(246, 129, 30,0.15)] ring-2 ring-[#f6811e]/30 scale-[1.02] bg-gradient-to-br from-white to-green-50/30' 
                    : 'border-gray-100 hover:border-green-200 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] hover:scale-[1.01]'
                  }
                `}
              >
                {/* Cabecera de la etapa */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Indicador numérico circular */}
                    <div 
                      className={`
                        w-10 h-10 rounded-full font-black text-base flex items-center justify-center transition-all duration-300 shadow-sm
                        bg-gradient-to-br ${stage.color} text-white
                        ${isActive ? 'scale-110 shadow-[0_4px_10px_rgba(246, 129, 30,0.3)]' : ''}
                      `}
                    >
                      {stage.id}
                    </div>
                    
                    {/* Icono de la etapa */}
                    <div 
                      className={`
                        p-2 rounded-xl transition-all duration-300
                        ${isActive ? 'bg-[#f2ffef] text-[#f6811e]' : 'bg-gray-50 text-gray-400'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Nombre de la etapa */}
                    <h3 
                      className={`
                        text-lg font-black tracking-tight transition-all duration-300
                        ${isActive ? 'text-[#f6811e]' : 'text-gray-700'}
                      `}
                    >
                      {stage.title}
                    </h3>
                  </div>

                  {/* Flecha indicadora */}
                  <div className={`transition-transform duration-300 ${isActive ? 'rotate-180 text-[#f6811e]' : 'text-gray-400'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                {/* Contenido expandible (Accordion) */}
                <div 
                  className={`
                    transition-all duration-500 ease-in-out overflow-hidden
                    ${isActive ? 'max-h-[500px] opacity-100 mt-6 pt-5 border-t border-green-100/50' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="flex flex-col gap-6 text-left">
                    {/* ¿Qué pasa? */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-[#f6811e]">¿Qué pasa?</span>
                      <p className="text-gray-700 font-medium text-base leading-relaxed">
                        {stage.whatHappens}
                      </p>
                    </div>

                    {/* Objetivo Comercial */}
                    <div className="bg-[#f2ffef]/50 rounded-2xl p-4 border border-[#f6811e]/10 flex items-start gap-3">
                      <Target className="w-5 h-5 text-[#f6811e] flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-[#f6811e]">Objetivo comercial</span>
                        <p className="text-gray-800 font-bold text-base leading-relaxed">
                          {stage.commercialGoal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* SECCIÓN: PRESENTACIÓN DE LA SOLUCIÓN */}
      <div className="bg-white rounded-[32px] border border-[#f6811e]/10 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Presentación de la solución
            </h2>
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-gray-700 text-base leading-relaxed">
            Después del diagnóstico, el vendedor debe presentar la solución conectándola directamente con lo que el cliente dijo.
          </p>
          
          <div className="bg-[#f2ffef]/50 rounded-2xl p-6 border border-[#f6811e]/10">
            <span className="text-sm font-bold text-[#f6811e] mb-2 block">Ejemplo:</span>
            <p className="text-gray-700 text-base leading-relaxed italic">
              “Según lo que me comenta, su principal preocupación es no quedarse sin suministro durante los fines de semana, porque eso afecta directamente las ventas del restaurante. Por eso, más que ofrecerle solo un producto, le propongo un esquema de suministro programado con seguimiento de consumo y atención prioritaria.”
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <span className="text-sm font-bold text-[#f6811e] mb-2 block">La frase clave es:</span>
            <p className="text-gray-800 font-bold text-base leading-relaxed mb-2">
              “Con base en lo que usted me comentó…”
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              Esto demuestra escucha, personalización y profesionalismo.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: MANEJO DE OBJECIONES */}
      <div className="bg-[#f3fff0] rounded-[32px] border border-[#f6811e]/20 p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Manejo de objeciones
            </h2>
          </div>
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-8">
          Las objeciones no son rechazo; son señales de duda. El vendedor debe responder con calma y estrategia.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Objeción 1 */}
          <div className="bg-white rounded-2xl border border-[#f6811e]/10 p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-[#f6811e] mb-1 block">Objeción: “Está muy caro.”</span>
                <span className="text-sm font-bold text-[#f6811e] mt-1 block">Respuesta consultiva:</span>
                <p className="text-gray-700 text-base leading-relaxed mt-2">
                  “Entiendo que el precio es importante. Para compararlo correctamente, revisemos no solo el valor del producto, sino el costo total: cumplimiento, calidad, respaldo, tiempos de entrega y riesgo de quedarse sin suministro. A veces lo más barato termina saliendo más costoso cuando afecta la operación.”
                </p>
              </div>
            </div>
          </div>

          {/* Objeción 2 */}
          <div className="bg-white rounded-2xl border border-[#f6811e]/10 p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-[#f6811e] mb-1 block">Objeción: “Ya tengo proveedor.”</span>
                <span className="text-sm font-bold text-[#f6811e] mt-1 block">Respuesta consultiva:</span>
                <p className="text-gray-700 text-base leading-relaxed mt-2">
                  “Perfecto, eso significa que ya conoce el servicio. ¿Qué tan satisfecho está con la puntualidad, el soporte y la atención en momentos críticos? Podemos presentarnos como una alternativa de respaldo o una segunda opción estratégica.”
                </p>
              </div>
            </div>
          </div>

          {/* Objeción 3 */}
          <div className="bg-white rounded-2xl border border-[#f6811e]/10 p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-[#f6811e] mb-1 block">Objeción: “Lo voy a pensar.”</span>
                <span className="text-sm font-bold text-[#f6811e] mt-1 block">Respuesta consultiva:</span>
                <p className="text-gray-700 text-base leading-relaxed mt-2">
                  “Claro. Para ayudarle a tomar una mejor decisión, ¿qué punto necesita revisar con más detalle: precio, condiciones, tiempos de entrega o beneficios de la solución?”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: OBJECIONES COMUNES Y RESPUESTAS */}
      <div className="bg-white rounded-[32px] border border-[#f6811e]/10 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Objeciones comunes y respuestas
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-[#f6811e]/10 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-50 text-[#f6811e] flex items-center justify-center flex-shrink-0 font-black text-sm">
                  ?
                </div>
                <h3 className="text-lg font-black text-[#f6811e] leading-tight">
                  {highlightText("¿Es seguro el autoglp?")}
                </h3>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-base leading-relaxed">
                  Sí. Los tanques cumplen normas internacionales, con válvulas de seguridad certificadas.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-[#f6811e]/10 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-50 text-[#f6811e] flex items-center justify-center flex-shrink-0 font-black text-sm">
                  ?
                </div>
                <h3 className="text-lg font-black text-[#f6811e] leading-tight">
                  {highlightText("La conversión es muy costosa")}
                </h3>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-base leading-relaxed">
                  La inversión inicial se recupera rápidamente gracias al ahorro de hasta un 40-50% en combustible. Dependiendo del uso del vehículo, el retorno de inversión se puede lograr en pocos meses. Además, contamos con planes de financiación y convenios que facilitan el proceso.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-[#f6811e]/10 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-50 text-[#f6811e] flex items-center justify-center flex-shrink-0 font-black text-sm">
                  ?
                </div>
                <h3 className="text-lg font-black text-[#f6811e] leading-tight">
                  {highlightText("El rendimiento del motor se ve afectado.")}
                </h3>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-base leading-relaxed">
                  {highlightText("El autoglp ofrece una combustión más limpia y eficiente, lo que prolonga la vida útil del motor y reduce la formación de carbonilla. Muchos usuarios reportan un desempeño igual o incluso superior al de la gasolina en ciertos rangos de uso. Además, la transición entre gasolina y glp es imperceptible para el conductor.")}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl border border-[#f6811e]/10 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-50 text-[#f6811e] flex items-center justify-center flex-shrink-0 font-black text-sm">
                  ?
                </div>
                <h3 className="text-lg font-black text-[#f6811e] leading-tight">
                  {highlightText("No hay suficientes estaciones de servicio")}
                </h3>
              </div>
              <p className="text-gray-700 text-base leading-relaxed">
                {highlightText("Actualmente la red de estaciones está en crecimiento y ya existen puntos estratégicos en las principales ciudades. Además, nuestra compañía tiene un plan de expansión progresivo que garantiza mayor cobertura en los próximos meses. El abastecimiento está asegurado y la tendencia es seguir aumentando la infraestructura.")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: CIERRE */}
      <div className="bg-[#f3fff0] rounded-[32px] border border-[#f6811e]/20 p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Cierre
            </h2>
          </div>
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-6">
          El cierre debe ser natural y basado en el valor identificado.
        </p>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f6811e]/10">
          <span className="text-sm font-bold text-[#f6811e] mb-4 block">Tipos de cierre:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item 1 */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-[#f6811e] mb-2 block">Cierre por recomendación:</span>
                <p className="text-gray-700 text-base leading-relaxed italic">
                  “Mi recomendación es iniciar con este plan porque responde a su necesidad principal de continuidad.”
                </p>
              </div>
            </div>
            {/* Item 2 */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-[#f6811e] mb-2 block">Cierre por siguiente paso:</span>
                <p className="text-gray-700 text-base leading-relaxed italic">
                  “¿Le parece si programamos la visita técnica esta semana para validar condiciones?”
                </p>
              </div>
            </div>
            {/* Item 3 */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-[#f6811e] mb-2 block">Cierre por prueba:</span>
                <p className="text-gray-700 text-base leading-relaxed italic">
                  “Podemos iniciar con un primer servicio programado y medir la experiencia durante el primer mes.”
                </p>
              </div>
            </div>
            {/* Item 4 */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-[#f6811e] mb-2 block">Cierre por urgencia real:</span>
                <p className="text-gray-700 text-base leading-relaxed italic">
                  “Si quiere tener el suministro asegurado para la próxima semana, lo ideal es dejar la programación definida hoy.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: SEGUIMIENTO Y FIDELIZACIÓN */}
      <div className="bg-white rounded-[32px] border border-[#f6811e]/10 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Seguimiento y fidelización
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-gray-700 text-base leading-relaxed">
            La venta no termina cuando el cliente compra. El seguimiento es lo que convierte una venta en una relación comercial.
          </p>

          <div className="bg-[#f2ffef]/30 rounded-3xl p-6 sm:p-8 border border-[#f6811e]/10">
            <span className="text-sm font-bold text-[#f6811e] mb-4 block">Acciones de seguimiento:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Confirmar satisfacción.",
                "Verificar cumplimiento del servicio.",
                "Resolver dudas.",
                "Programar recompra.",
                "Ofrecer mejoras.",
                "Solicitar referidos.",
                "Registrar oportunidades futuras."
              ].map((action, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700 text-base leading-relaxed font-medium">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-gray-800 text-base leading-relaxed font-bold">
              Un cliente bien atendido puede convertirse en embajador de la marca.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: ESTÁNDAR DE DISCURSO DEL VENDEDOR */}
      <div className="bg-[#f3fff0] rounded-[32px] border border-[#f6811e]/20 p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Estándar de discurso del vendedor
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-gray-700 text-base leading-relaxed">
            El vendedor GASMAX debe hablar como alguien que entiende autos, entiende combustible y entiende negocio.
          </p>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f6811e]/10">
            <span className="text-sm font-bold text-[#f6811e] mb-4 block">
              Rasgos profesionales ligados a la industria automotriz:
            </span>
            <div className="space-y-4">
              {[
                "Respeto por la seguridad y la instalación certificada.",
                "Capacidad de explicar rendimiento sin caer en mitos.",
                "Conocimiento de marcas de vehículos frecuentes en taxi y plataforma.",
                "Familiaridad con motores, kilometraje, hábitos de conducción y mantenimiento.",
                "Dominio básico de compatibilidades y comportamiento por segmento: sedán, hatchback, SUV liviana, vehículo de trabajo."
              ].map((trait, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700 text-base leading-relaxed">{trait}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CUADROS COMPLEMENTARIOS DEL DISCURSO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Cuadro 1: Mensaje inicial */}
            <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-300 p-8 flex items-center justify-center text-center min-h-[220px]">
              <p className="text-gray-700 text-base font-medium italic leading-relaxed">
                El vendedor GASMAX debe hablar como alguien que entiende autos, entiende combustible y entiende negocio.
              </p>
            </div>

            {/* Cuadro 2: Lo que NO dice */}
            <div className="bg-[#f6811e] rounded-[32px] p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
              <span className="text-sm font-bold text-white/90 uppercase tracking-wider mb-2 block">
                No dice:
              </span>
              <p className="text-white text-base font-black italic leading-relaxed">
                “Eso le sale más barato.”
              </p>
            </div>

            {/* Cuadro 3: Imagen del Vendedor */}
            <div className="rounded-[32px] border-4 border-[#f6811e] overflow-hidden shadow-sm aspect-video md:aspect-[4/3] min-h-[220px]">
              <img 
                src={vendedorSuv} 
                className="w-full h-full object-cover object-center" 
                alt="Vendedor GASMAX explicando motor de SUV" 
              />
            </div>

            {/* Cuadro 4: Lo que SI dice */}
            <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
              <span className="text-sm font-bold text-[#f6811e] uppercase tracking-wider mb-2 block">
                Dice:
              </span>
              <p className="text-[#f6811e] text-base font-bold italic leading-relaxed">
                “Esto le mejora el costo operativo por kilómetro y le da una solución dual para trabajar con más tranquilidad.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: MATRIZ DE LENGUAJE CORPORATIVO */}
      <div className="bg-[#f3fff0] rounded-[32px] border border-[#f6811e]/20 p-8 sm:p-10 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter leading-tight">
              Matriz de lenguaje corporativo
            </h2>
          </div>
        </div>

        {/* CONTENEDOR DE LA MATRIZ: VISTA DESKTOP (TABLA) */}
        <div className="hidden md:block overflow-hidden border border-[#f6811e]/10 rounded-3xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-5 px-6 text-sm font-bold text-[#f6811e] uppercase tracking-wider w-[35%]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Decir siempre
                  </div>
                </th>
                <th className="py-5 px-6 text-sm font-bold text-[#f6811e] uppercase tracking-wider w-[30%]">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Evitar decir
                  </div>
                </th>
                <th className="py-5 px-6 text-sm font-bold text-[#f6811e] uppercase tracking-wider w-[35%]">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#f6811e]" />
                    Razón
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matrixData.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-green-50/40 hover:scale-[1.005] hover:shadow-[0_4px_20px_-4px_rgba(246, 129, 30,0.06)] transition-all duration-300 group"
                >
                  <td className="py-5 px-6 align-top">
                    <span className="text-gray-800 font-bold text-base leading-relaxed group-hover:text-[#f6811e] transition-colors block">
                      {row.always}
                    </span>
                  </td>
                  <td className="py-5 px-6 align-top">
                    <span className="text-gray-500 line-through text-base leading-relaxed block">
                      {row.avoid}
                    </span>
                  </td>
                  <td className="py-5 px-6 align-top">
                    <span className="text-gray-600 text-base leading-relaxed block">
                      {row.reason}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTENEDOR DE LA MATRIZ: VISTA MÓVIL (TARJETAS RESPONSIVE) */}
        <div className="block md:hidden space-y-4">
          {matrixData.map((row, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 hover:border-[#f6811e]/30 hover:shadow-md transition-all duration-300"
            >
              {/* Decir siempre */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Decir siempre
                </span>
                <p className="text-gray-800 font-bold text-base leading-relaxed">
                  {row.always}
                </p>
              </div>

              {/* Evitar decir */}
              <div className="space-y-1 border-t border-gray-50 pt-3">
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Evitar decir
                </span>
                <p className="text-gray-500 line-through text-base leading-relaxed">
                  {row.avoid}
                </p>
              </div>

              {/* Razon */}
              <div className="space-y-1 border-t border-gray-50 pt-3">
                <span className="text-xs font-bold text-[#f6811e] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Razón
                </span>
                <p className="text-gray-600 text-base leading-relaxed">
                  {row.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Globe2, HandCoins, BadgeCheck, TrendingUp, FileCheck, CheckCircle2, Users, Search, Target, FileText, ChevronDown } from 'lucide-react';

export const Course2Leccion2Content = () => {
  const steps = [
    {
      id: "1",
      title: "1-Reclutamiento - Comercial",
      icon: <Globe2 className="w-8 h-8" />,
      color: "bg-[#5fbd44]",
      textColor: "text-[#5fbd44]",
      borderColor: "border-[#5fbd44]",
      content: [
        "Definición del perfil comercial",
        "Incorporar vendedores alineados al perfil ideal del negocio.",
        "Selección de taller de adaptación por ciudad",
        "Capacitación Comercial",
      ],
    },
    {
      id: "2",
      title: "2-Encontrando prospectos",
      icon: <Search className="w-8 h-8" />,
      color: "bg-[#65FF00]",
      textColor: "text-[#4aba00]", // Darker green for text readability
      borderColor: "border-[#65FF00]",
      content: [
        "Definición del cliente ideal (buyer persona)",
        "Sector, tamaño, necesidades, dolores",
        "Estrategias de captación (canales)",
        "Calificación de prospectos",
        "Registro y seguimiento en CRM",
      ],
    },
    {
      id: "3",
      title: "3-Presentación solución",
      icon: <BadgeCheck className="w-8 h-8" />,
      color: "bg-[#5fbd44]",
      textColor: "text-[#5fbd44]",
      borderColor: "border-[#5fbd44]",
      content: [
        "Identificación del problema o necesidad",
        "Enfoque en beneficios, no solo en características",
        "Manejo de objeciones",
        "Condiciones claras, valor percibido y beneficios concretos",
      ],
      subStep: {
        title: "3.1 Validación de usuario",
        content: [
          "Validar vehículos con motor a gasolina con un consumo promedio de 3 galones por día o 100 galones al mes"
        ]
      }
    },
    {
      id: "4",
      title: "4. Cierre de Venta",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-[#FF9D00]",
      textColor: "text-[#FF9D00]",
      borderColor: "border-[#FF9D00]",
      content: [
        "Cierre directo, cierre por beneficio, cierre por urgencia",
        "Ajustes de precio, plazos o condiciones (sin perder rentabilidad)",
      ],
      subStep: {
        title: "4.1 Documentación Clave",
        content: [
          "Soporte consignación cuota inicial",
          "Formato de descripción de negocio",
          "Carta crédito (Compromiso por instalación)",
          "Pagaré y carta de instrucciones",
          "Comunicado tabla de amortización",
          "Formato PRE-POSTCONVERSIÓN",
          "Formato KIT INSTALADO",
          "Formato orden de servicio",
        ]
      }
    },
    {
      id: "5",
      title: "5-Seguimiento Comercial Postventa",
      icon: <Users className="w-8 h-8" />,
      color: "bg-[#f6811e]", // Fallback to corporate blue for the last one
      textColor: "text-[#f6811e]",
      borderColor: "border-[#f6811e]",
      content: [
        "Manejo y control de clientes CRM",
        "Reportes seguimiento clientes / Postventa",
        "Club G/Max",
        "Activaciones de Marca",
        "Convertir clientes en promotores de la marca",
      ],
    },
  ];

  const [openSteps, setOpenSteps] = useState(["1"]);

  const toggleStep = (id) => {
    setOpenSteps((prev) =>
      prev.includes(id) ? prev.filter(stepId => stepId !== id) : [...prev, id]
    );
  };

  return (
    <div className="py-6 flex flex-col w-full">
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">

        {/* ENCABEZADO UNIFICADO */}
        <div className="p-8 sm:p-10 border-b border-gray-50 bg-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/10">
              <Target className="w-10 h-10" />
            </div>
            <div>
              <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Proceso Comercial • Módulo 2</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f6811e] uppercase tracking-tighter">Actividades Clave</h2>
            </div>
          </div>
        </div>

        {/* CONTENIDO DEL TIMELINE (AHORA DENTRO DEL MISMO CONTENEDOR) */}
        <div className="flex-1 p-6 md:p-12 lg:p-16 relative bg-white">

          {/* Línea central del timeline (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-16 bottom-16 w-1.5 bg-gray-200 rounded-full transform -translate-x-1/2"></div>

          {/* Línea lateral del timeline (Mobile/Tablet) */}
          <div className="lg:hidden absolute left-[38px] top-12 bottom-12 w-1.5 bg-gray-200 rounded-full"></div>

          {/* Imágenes de Vehículo a lo largo de la línea */}
          <div className="hidden lg:block absolute left-1/2 top-16 bottom-16 w-48 transform -translate-x-1/2 z-0 opacity-100"
            style={{
              backgroundImage: 'url("https://i.imgur.com/ofgApnf.png")',
              backgroundRepeat: 'repeat-y',
              backgroundPosition: 'center',
              backgroundSize: '100% auto'
            }}>
          </div>

          {/* Carro en la parte inferior (Fin) */}
          <div className="hidden lg:block absolute left-1/2 bottom-0 transform -translate-x-1/2 z-10">
            <img
              src="https://i.imgur.com/7zmOueM.png"
              alt="G-Max Car End"
              className="w-40 h-auto object-contain"
            />
          </div>

          <div className="flex flex-col gap-12 relative z-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const isOpen = openSteps.includes(step.id);

              return (
                <div key={step.id} className={`flex flex-col lg:flex-row items-start ${isEven ? 'lg:flex-row-reverse' : ''} gap-6 lg:gap-16 relative`}>

                  {/* Espacio vacío para alternar en desktop */}
                  <div className="hidden lg:block w-1/2"></div>

                  {/* Icono central (Desktop) / Izquierdo (Mobile) */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 mt-0 w-20 h-20 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center z-20 hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-100"
                  >
                    <div className={`w-full h-full rounded-full ${step.color} flex items-center justify-center text-white shadow-inner`}>
                      {step.icon}
                    </div>
                  </button>

                  {/* Tarjeta de Contenido */}
                  <div className={`w-full lg:w-1/2 pl-24 lg:pl-0 ${isEven ? 'lg:pr-16' : 'lg:pl-16'}`}>
                    <div className={`bg-white rounded-[24px] shadow-md border-t-4 ${step.borderColor} transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-lg' : 'hover:shadow-lg'}`}>

                      {/* Cabecera Clickable */}
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="w-full text-left p-6 sm:p-8 flex items-center justify-between focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <h3 className={`text-xl sm:text-2xl font-black ${step.textColor} leading-tight`}>
                          {step.title}
                        </h3>
                        <ChevronDown className={`w-6 h-6 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Contenido Desplegable */}
                      <div className={`transition-all duration-500 ease-in-out origin-top ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6 sm:px-8 pb-8">
                          <ul className="flex flex-col gap-3">
                            {step.content.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className={`mt-1.5 w-2 h-2 rounded-full ${step.color} shrink-0`}></div>
                                <span className="text-gray-700 font-medium text-[15px] leading-relaxed">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* Sub-paso (ej. 3.1 o 4.1) */}
                          {step.subStep && (
                            <div className="mt-8 pt-6 border-t border-gray-100">
                              <h4 className="text-lg font-bold text-gray-800 mb-4">
                                {step.subStep.title}
                              </h4>
                              <ul className="flex flex-col gap-3">
                                {step.subStep.content.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="text-gray-600 text-[14px] leading-relaxed">
                                      {item}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* NUEVA SECCIÓN: PRINCIPIOS DE DIRECCIÓN COMERCIAL */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-8 sm:p-10 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 border border-[#f6811e]/10 shadow-sm">
              <span className="text-2xl font-black">!</span>
            </div>
            {/* Cambié text-gray-900 por text-[#f6811e] para darle el color cian al texto */}
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter">
              Principios de Dirección Comercial
            </h2>
          </div>
        </div>
        <div className="p-6 md:p-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#f6811e] p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/20">
                <h3 className="text-white font-black uppercase tracking-wider text-center">Principio</h3>
              </div>
              <div className="bg-gray-500 p-4 flex items-center justify-center">
                <h3 className="text-white font-black uppercase tracking-wider text-center">Implicación gerencial</h3>
              </div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-200">
                <div className="p-6 md:p-8 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-800 font-medium text-lg leading-snug">No vender kits; vender resultado económico</p>
                </div>
                <div className="p-6 md:p-8 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Cada interacción debe aterrizar la tecnología a margen diario, flujo de caja y continuidad operativa.</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-200">
                <div className="p-6 md:p-8 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-800 font-medium text-lg leading-snug">No abrir con catálogo; abrir con diagnóstico</p>
                </div>
                <div className="p-6 md:p-8 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">La venta inicia con kilometraje, gasto actual, tipo de ruta, ingresos y urgencia de ahorro.</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-200">
                <div className="p-6 md:p-8 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-800 font-medium text-lg leading-snug">No prometer de más; demostrar mejor</p>
                </div>
                <div className="p-6 md:p-8 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">Toda promesa debe ir soportada en simulación, caso real, validación técnica y seguimiento postventa.</p>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-200">
                <div className="p-6 md:p-8 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-800 font-medium text-lg leading-snug">No improvisar lenguaje; institucionalizarlo</p>
                </div>
                <div className="p-6 md:p-8 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">El vocabulario comercial debe entrenarse, evaluarse y corregirse de forma continua.</p>
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-200">
                <div className="p-6 md:p-8 flex items-center border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                  <p className="text-gray-800 font-medium text-lg leading-snug">No depender del talento individual; crear sistema</p>
                </div>
                <div className="p-6 md:p-8 flex items-center bg-white">
                  <p className="text-gray-600 leading-relaxed text-[15px]">El desempeño debe sostenerse con academia, coaching, rutinas y KPIs de conversión por etapa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

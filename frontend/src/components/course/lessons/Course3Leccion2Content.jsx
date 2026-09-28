import React, { useState } from 'react';
import {
  Gem, Briefcase, Target, TrendingUp, MessageSquare, CheckCircle2,
  UserCheck, Search, Cog, CalendarClock,
  ShieldCheck, Database, Key, Headphones, Award // <-- Estos son los que faltaban
} from 'lucide-react';

export const Course3Leccion2Content = () => {

  const steps = [
    {
      id: "1",
      title: "1. Registro del Lead y Contacto Inicial",
      icon: <Search className="w-8 h-8" />,
      color: "bg-[#5fbd44]",
      textColor: "text-[#5fbd44]",
      borderColor: "border-[#5fbd44]",
      content: [
        "Captura de datos básicos (Nombre, Teléfono, Gremio/Plataforma).",
        "Registro de tipo de vehículo, cilindraje e historial de mantenimiento.",
        "Medición del consumo diario actual en galones de gasolina."
      ]
    },
    {
      id: "2",
      title: "2. Calificación Técnica y Comercial",
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "bg-[#65FF00]",
      textColor: "text-[#4aba00]",
      borderColor: "border-[#65FF00]",
      content: [
        "Validación de motor compatible (inyección indirecta/directa).",
        "Verificación de consumo mínimo (> 3 galones diarios o 100 galones mensuales).",
        "Evaluación de viabilidad crediticia a través de Magic u otros aliados financieros."
      ]
    },
    {
      id: "3",
      title: "3. Simulación y Propuesta Económica",
      icon: <Database className="w-8 h-8" />,
      color: "bg-[#5fbd44]",
      textColor: "text-[#5fbd44]",
      borderColor: "border-[#5fbd44]",
      content: [
        "Presentación de la promesa de ahorro estimada (hasta 40% vs. gasolina).",
        "Estructuración de cuota de pago diaria/semanal en base al ahorro real.",
        "Registro de la propuesta y estado del negocio en el embudo del CRM."
      ]
    },
    {
      id: "4",
      title: "4. Instalación y Certificación",
      icon: <Key className="w-8 h-8" />,
      color: "bg-[#FF9D00]",
      textColor: "text-[#FF9D00]",
      borderColor: "border-[#FF9D00]",
      content: [
        "Agendamiento de la conversión en taller certificado.",
        "Carga del acta PRE-POSTCONVERSIÓN y certificado del kit en el CRM.",
        "Marcación en CRM como 'Ganado' y activación de la fase de postventa."
      ]
    },
    {
      id: "5",
      title: "5. Control de Calidad y Postventa Directa",
      icon: <Headphones className="w-8 h-8" />,
      color: "bg-[#f6811e]",
      textColor: "text-[#f6811e]",
      borderColor: "border-[#f6811e]",
      content: [
        "Llamada a los 3 días: comprobar funcionamiento de la llave conmutadora y transición de combustibles.",
        "Llamada a los 15 días: verificar consumo, ahorro percibido y aclarar dudas del usuario.",
        "Agendamiento de la primera revisión preventiva a los 10,000 km."
      ]
    }
  ];

  const [openSteps, setOpenSteps] = useState(["1"]);

  const toggleStep = (id) => {
    setOpenSteps((prev) =>
      prev.includes(id) ? prev.filter(stepId => stepId !== id) : [...prev, id]
    );
  };

  const [activeStep, setActiveStep] = useState(0);

  const crmSteps = [
    { id: '01', title: 'Recepción', icon: UserCheck, desc: 'Primer contacto post-venta. Confirmación, bienvenida y asignación de asesor.' },
    { id: '02', title: 'Diagnóstico', icon: Search, desc: 'Revisión de necesidades. Agenda de servicios, alertas técnicas activas.' },
    { id: '03', title: 'Gestión', icon: Cog, desc: 'Ejecución del servicio. Comunicación continua. Registro en CRM.' },
    { id: '04', title: 'Entrega', icon: CheckCircle2, desc: 'La entrega del vehículo después del servicio es un momento de alta carga emocional para el cliente. Realizarlo con un checklist de verificación, explicando cada ítem atendido, y preguntando activamente si el cliente tiene dudas, convierte una transacción en una experiencia memorable. Aquí nace la siguiente oportunidad de fidelización.' },
    { id: '05', title: 'Seguimiento', icon: CalendarClock, desc: 'El seguimiento cierra el ciclo y lo vuelve a abrir. Incluye la encuesta de satisfacción, el registro del resultado en el CRM y el contacto proactivo a los 30, 60 y 90 días para recordar próximos servicios, compartir información de valor y mantener la relación viva. Un cliente al que llamamos antes de que necesite algo es un cliente que siente que AutoGLP se preocupa por él.' },
  ];

  return (
    <div className="py-6 flex flex-col w-full">
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">


        {/* ENCABEZADO UNIFICADO */}
        <div className="p-8 sm:p-10 border-b border-gray-50 bg-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="w-[80px] h-[80px] rounded-[22px] bg-[#f2ffef] text-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#f6811e]/10">
              <Database className="w-10 h-10" />
            </div>
            <div>
              <p className="text-[13px] text-[#f6811e] font-black uppercase tracking-[0.2em] mb-2">Administración del CRM • Módulo 2</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f6811e] uppercase tracking-tighter">Proceso en el CRM</h2>
              <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
                <div className="flex-1">
                  <div className="p-4 bg-[#ebffe6] rounded-2xl mb-4">
                    <p className="text-[#f6811e] font-semibold text-lg">
                      No importa si llevas semanas o años en el equipo: este contenido te va a recordar por qué lo que haces todos los días marca la diferencia entre un cliente que regresa y uno simplemente... no vuelve.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl mb-4">
                    <p className="text-gray-700 text-justify">
                      La posventa engloba todas las <strong>acciones, servicios y comunicaciones que ocurren después de que el cliente firma</strong> el contrato o retira su vehículo.<br /><br />
                      Es el conjunto de actividades diseñadas para garantizar que la experiencia del cliente con autoglp no termine en el momento de la entrega, sino que continúe y se fortalezca en el tiempo.<br /><br />
                      En el sector automotriz y de conversiones a autoglp, la posventa tiene una relevancia especial por tres razones fundamentales:<br /><br />
                      El proceso de posventa en autoglp no es un evento aislado. Es un ciclo continuo con cinco etapas claramente definidas. Conocerlas y dominarlas te permitirá anticiparte a las necesidades del cliente en lugar de reaccionar ante ellas.
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <img src="https://i.imgur.com/eh0jdBz.png" alt="Posventa illustration" className="max-w-full h-auto rounded-xl shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN CRM INTERACTIVA */}
        <div className="mt-16 mb-8">
          <div className="bg-white rounded-[32px] p-6 md:p-10 border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col items-center mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-[#f6811e] uppercase tracking-tighter text-center">
                Administración del CRM
              </h3>
              <div className="w-16 h-1 bg-[#f6811e] mt-4 rounded-full opacity-50"></div>
            </div>

            {/* Fila de Botones */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
              {crmSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-bold transition-all duration-300 transform ${isActive
                      ? 'bg-[#f6811e] text-white shadow-lg shadow-[#f6811e]/30 scale-105'
                      : 'bg-[#f4f6f9] text-gray-500 hover:bg-[#ebfde6] hover:text-[#f6811e]'
                      }`}
                  >
                    <span className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {step.id}
                    </span>
                    <span className="text-base tracking-wide">{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Área de Contenido Dinámico */}
            <div className="relative bg-[#fafff8] border border-[#ebfde6] rounded-3xl p-8 md:p-12 overflow-hidden min-h-[200px] flex items-center justify-center">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f6811e]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

              <div
                key={activeStep} // Forzar re-render para la animación
                className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#f6811e] mb-6">
                  {React.createElement(crmSteps[activeStep].icon, { className: "w-8 h-8" })}
                </div>
                <h4 className="text-2xl font-black text-[#f6811e] mb-4">
                  {crmSteps[activeStep].id}. {crmSteps[activeStep].title}
                </h4>
                <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-medium">
                  {crmSteps[activeStep].desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Administración del CRM - nuevo bloque corregido */}
        <div className="mt-16 mb-12 w-full">

          {/* Título arreglado con mejor espaciado y diseño */}
          <div className="flex flex-col items-center justify-center mb-12 text-center w-full">
            <h2 className="text-3xl md:text-4xl font-black text-[#f6811e] uppercase tracking-tighter">
              Administración del CRM
            </h2>
            <div className="w-20 h-1 bg-[#f6811e] mt-5 rounded-full opacity-40"></div>
          </div>

          {/* Contenedor Grid configurado para 3 arriba y 2 abajo centradas en PC */}
          {/* Se agregaron px-6 md:px-10 lg:px-12 para dar el padding contra los bordes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8 px-6 md:px-10 lg:px-12">

            {/* Card 1 (Arriba - Izquierda) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-50 text-[#5fbd44] flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold">1</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base text-justify">
                El primer contacto posventa ocurre dentro de las primeras 48 horas después de la entrega del vehículo. El objetivo no es vender nada: es confirmar que el cliente recibió lo que esperaba, que no tiene dudas sobre el funcionamiento de su sistema GLP y que sabe exactamente a quién llamar si tiene alguna inquietud. Este momento establece el tono de toda la relación futura.
              </p>
            </div>

            {/* Card 2 (Arriba - Centro) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold">2</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base text-justify">
                Diagnóstico: En esta etapa el asesor revisa el historial del cliente en el CRM: servicios pendientes, garantías activas, fecha de próximo mantenimiento y cualquier alerta técnica generada por el área de servicio. El diagnóstico no es reactivo — no esperamos a que el cliente llame. Tomamos la iniciativa de identificar lo que el cliente necesitará antes de que él mismo lo sepa.
              </p>
            </div>

            {/* Card 3 (Arriba - Derecha) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#f6811e]/10 text-[#f6811e] flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold">3</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base text-justify">
                Gestión: Es la ejecución del servicio acordado — mantenimientos, revisiones, reparaciones, actualizaciones de firmware GLP u otros servicios complementarios. Durante esta etapa, el asesor mantiene al cliente informado del avance, comunica cualquier novedad y registra cada interacción en el CRM. La trazabilidad es fundamental: lo que no está en el sistema, no existe.
              </p>
            </div>

            {/* Card 4 (Abajo - Izquierda/Centro) -> lg:col-start-2 la empuja al centro */}
            <div className="lg:col-span-2 lg:col-start-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold">4</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base text-justify">
                La entrega del vehículo después del servicio es un momento de alta carga emocional para el cliente. Realizarlo con un checklist de verificación, explicando cada ítem atendido, y preguntando activamente si el cliente tiene dudas, convierte una transacción en una experiencia memorable. Aquí nace la siguiente oportunidad de fidelización.
              </p>
            </div>

            {/* Card 5 (Abajo - Derecha/Centro) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold">5</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base text-justify">
                El seguimiento cierra el ciclo y lo vuelve a abrir. Incluye la encuesta de satisfacción, el registro del resultado en el CRM y el contacto proactivo a los 30, 60 y 90 días para recordar próximos servicios, compartir información de valor y mantener la relación viva. Un cliente al que llamamos antes de que necesite algo es un cliente que siente que AutoGLP se preocupa por él.
              </p>
            </div>

          </div>
        </div>

        {/* SECCIÓN ADICIONAL: MEJORES PRÁCTICAS */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="p-8 sm:p-10 border-b border-gray-50 bg-white flex flex-col gap-8">

            {/* Título e ícono */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f2ffef] text-[#f6811e] flex items-center justify-center border border-[#f6811e]/10 shadow-sm">
                <Award className="w-7 h-7" />
              </div>
              {/* Se cambió text-[#f6811e] por text-[#f6811e] */}
              <h2 className="text-2xl sm:text-3xl font-black text-[#f6811e] uppercase tracking-tighter">
                Principios de Registro del Cliente
              </h2>
            </div>

            {/* Imagen (ahora debajo del título) */}
            <div className="w-full bg-white">
              <img
                src="https://i.imgur.com/uAvfF8x.jpeg"
                alt="Principios de Registro del Cliente"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
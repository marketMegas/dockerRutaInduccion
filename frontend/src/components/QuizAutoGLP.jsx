import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, RefreshCcw, AlertCircle, Trophy } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const course1Questions = [
  {
    id: 1,
    question: "¿Qué significa AutoGLP?",
    options: [
      { id: 'A', text: "Gas natural comprimido para vehículos" },
      { id: 'B', text: "Gas Licuado Propano utilizado como combustible" },
      { id: 'C', text: "Gasolina mezclada con etanol" },
      { id: 'D', text: "Diésel de bajo azufre" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 2,
    question: "¿Cuál es una característica principal del autoglp?",
    options: [
      { id: 'A', text: "Se almacena únicamente como gas a muy alta presión" },
      { id: 'B', text: "Es una mezcla principalmente de propano y butano" },
      { id: 'C', text: "Solo puede usarse en motores diésel" },
      { id: 'D', text: "No requiere ningún sistema de seguridad" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 3,
    question: "¿Cuál es uno de los principales beneficios comerciales del AutoGLP?",
    options: [
      { id: 'A', text: "Mayor consumo de combustible" },
      { id: 'B', text: "Menor autonomía del vehículo" },
      { id: 'C', text: "Ahorro en costos de operación frente a combustibles tradicionales" },
      { id: 'D', text: "Eliminación total del mantenimiento vehicular" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 4,
    question: "¿Qué elemento es necesario para que un vehículo pueda operar con AutoGLP?",
    options: [
      { id: 'A', text: "Un sistema de conversión certificado e instalado técnicamente" },
      { id: 'B', text: "Cambiar completamente el motor por uno eléctrico" },
      { id: 'C', text: "Retirar el tanque de gasolina original" },
      { id: 'D', text: "Usar cualquier cilindro doméstico dentro del vehículo" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 5,
    question: "¿Por qué es importante cumplir la normatividad en AutoGLP?",
    options: [
      { id: 'A', text: "Para evitar el uso de gasolina" },
      { id: 'B', text: "Para garantizar seguridad, legalidad y correcta operación del sistema" },
      { id: 'C', text: "Porque permite instalar equipos sin revisión" },
      { id: 'D', text: "Porque elimina la necesidad de mantenimiento" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 6,
    question: "¿Quién debe realizar la instalación o conversión a AutoGLP?",
    options: [
      { id: 'A', text: "Cualquier conductor con conocimientos básicos" },
      { id: 'B', text: "Un taller o personal técnico autorizado y competente" },
      { id: 'C', text: "Un vendedor comercial sin soporte técnico" },
      { id: 'D', text: "El usuario final sin supervisión" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 7,
    question: "¿Qué tipo de revisión debe tener un sistema AutoGLP?",
    options: [
      { id: 'A', text: "Ninguna, porque el GLP no requiere controles" },
      { id: 'B', text: "Solo revisión visual una vez en la vida útil del vehículo" },
      { id: 'C', text: "Revisiones técnicas y mantenimientos periódicos según requisitos aplicables" },
      { id: 'D', text: "Revisión únicamente cuando el vehículo deje de funcionar" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 8,
    question: "¿Cuál es una diferencia general entre GLP y GNV?",
    options: [
      { id: 'A', text: "El GLP trabaja normalmente a menor presión que el GNV" },
      { id: 'B', text: "El GNV se almacena como líquido a baja presión" },
      { id: 'C', text: "El GLP solo sirve para cocina y no para vehículos" },
      { id: 'D', text: "Ambos son exactamente el mismo combustible" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 9,
    question: "En una venta comercial de AutoGLP, ¿qué se debe comunicar al cliente?",
    options: [
      { id: 'A', text: "Solo el precio de la conversión" },
      { id: 'B', text: "Beneficios, seguridad, normatividad, ahorro estimado y mantenimiento" },
      { id: 'C', text: "Que no existen requisitos legales" },
      { id: 'D', text: "Que el sistema no necesita instalación profesional" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 10,
    question: "¿Cuál es una práctica responsable al promover AutoGLP?",
    options: [
      { id: 'A', text: "Prometer ahorros sin explicar condiciones de uso" },
      { id: 'B', text: "Omitir información sobre seguridad y normatividad" },
      { id: 'C', text: "Informar de manera clara los beneficios, requisitos técnicos y cuidados del sistema" },
      { id: 'D', text: "Recomendar instalaciones no certificadas para bajar costos" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 11,
    question: "Un cliente lleva su vehículo con sistema autoglp LOVATO a una estación de servicio. Al momento del llenado, el operador constata que el cilindro quedó cargado al 96% de su capacidad total. Considerando los protocolos del manual, ¿cuál es la secuencia de acciones CORRECTA que debe seguir el técnico al ser informado de esta situación?",
    options: [

      { id: 'A', text: " Vaciar inmediatamente el excedente del cilindro en la estación de servicio utilizando la válvula de alivio, ya que el 6% adicional representa un riesgo inminente de explosión por sobrepresión y debe eliminarse antes de mover el vehículo." },
      { id: 'B', text: " Informar al cliente que NO debe exponer el vehículo a la luz solar directa hasta que el consumo normal del motor reduzca el nivel de combustible por debajo del límite máximo permitido, y remitirlo al instalador o centro autorizado para el seguimiento del caso." },
      { id: 'C', text: " Activar el modo gasolina desde el conmutador One-Touch para consumir únicamente gasolina hasta normalizar el nivel del cilindro GLP, ya que en estado de sobrellenado el sistema LOVATO inhibe automáticamente la inyección de gas por seguridad" },
      { id: 'D', text: " Purgar el exceso de GLP a través del regulador de presión del sistema de inyección secuencial, ya que este componente está diseñado específicamente para manejar excesos de carga y liberar la presión adicional de forma controlada." },

    ],
    correctAnswer: 'B',
    isLong: true
  },
  {
    id: 12,
    question: "Un técnico está realizando la entrega de un vehículo recién convertido al sistema AutoGLP con inyección secuencial LOVATO. El cliente reporta que al arrancar el vehículo después de dejarlo apagado toda la noche en modo GLP, el sistema arranca directamente en modo gasolina con el LED rojo encendido. El cliente pregunta si el sistema está fallando. ¿Cuál es el diagnóstico técnico CORRECTO basado en el funcionamiento documentado de la centralita?",
    options: [

      { id: 'A', text: " El sistema efectivamente presenta una falla en la memoria no volátil de la centralita, ya que según el manual, el sistema debe conservar el estado del carburante al momento del apagado. Si arranca en un modo diferente al que estaba al apagar, indica pérdida de datos de configuración y requiere reprogramación del módulo de control." },
      { id: 'B', text: " El comportamiento es completamente normal y esperado: si el vehículo fue apagado en modo GLP, la centralita debió haber memorizado ese estado y al arrancar debería funcionar en GLP. Si arranca en gasolina, significa que el cliente apagó el vehículo cuando el sistema ya había conmutado automáticamente a gasolina por bajo nivel de GLP, y la centralita memorizó correctamente ese último estado." },
      { id: 'C', text: " El LED rojo de gasolina al arranque es una condición estándar de seguridad del sistema LOVATO: todos los vehículos con inyección secuencial siempre arrancan en gasolina durante los primeros 30 segundos para proteger el motor en frío, independientemente del estado memorizado por la centralita." },
      { id: 'D', text: " La falla está en el conmutador One-Touch, que al perder alimentación eléctrica durante el apagado resetea su posición al estado predeterminado de fábrica (gasolina), lo que invalida la función de memorización de la centralita. Se debe revisar el circuito de alimentación permanente del módulo." },

    ],
    correctAnswer: 'B',
    isLong: true
  },
  {
    id: 13,
    question: "Durante una inspección técnica, un cliente reporta que al presionar el conmutador One-Touch para cambiar de gasolina a autoglp, el sistema emite el sonido del Buzzer pero los 4 LED verdes del indicador de nivel NO se encienden. El motor sigue funcionando normalmente. Analizando el funcionamiento documentado del sistema de inyección secuencial LOVATO, ¿cuál de las siguientes interpretaciones técnicas describe con mayor precisión la causa MÁS probable de este comportamiento?",
    options: [

      { id: 'A', text: " El sistema confirmó el cambio a autoglp mediante el Buzzer, pero los LED verdes apagados indican que el cilindro está vacío o con nivel insuficiente para operar. En este estado, el sistema LOVATO mantiene el motor funcionando en autoglp de reserva hasta el apagado completo del combustible, momento en el que conmuta automáticamente a gasolina sin intervención del usuario." },
      { id: 'B', text: " El comportamiento sugiere una falla en el circuito de los LED del conmutador, completamente independiente del circuito de inyección de gas. El motor puede estar funcionando en autoglp correctamente a pesar de que el indicador visual no opera, ya que el Buzzer confirmó la conmutación. Se requiere inspección del circuito de visualización del conmutador sin interferir con la inyección." },
      { id: 'C', text: " El sonido del Buzzer sin encendido de LED verdes indica que el sistema reconoció la pulsación pero la centralita rechazó la conmutación por detección de anomalía en el sensor de presión del reductor. Este es el protocolo de falla segura del sistema LOVATO: el Buzzer confirma el intento y los LED apagados indican el rechazo de la conmutación." },
      { id: 'D', text: " Los 4 LED verdes apagados durante el funcionamiento en autoglp significan que el nivel del cilindro está por encima del 90% de capacidad (sobrellenado), condición en la que el sistema desactiva la indicación visual como medida de seguridad para alertar al conductor de que debe evitar el sol directo y acudir al centro autorizado." },

    ],
    correctAnswer: 'B',
    isLong: true
  }
];

const course2Questions = [
  {
    id: 1,
    question: "¿Cuál es el objetivo principal de la venta consultiva?",
    options: [
      { id: 'A', text: "Vender rápidamente sin hacer muchas preguntas." },
      { id: 'B', text: "Convencer al cliente de comprar aunque no tenga necesidad." },
      { id: 'C', text: "Entender las necesidades del cliente y ofrecer una solución adecuada." },
      { id: 'D', text: "Hablar solo de precio y promociones." }
    ],
    correctAnswer: 'C'
  },
  {
    id: 2,
    question: "En una venta consultiva de AutoGLP, la primera acción del asesor comercial debe ser:",
    options: [
      { id: 'A', text: "Presentar inmediatamente el precio del galón." },
      { id: 'B', text: "Hacer preguntas para conocer el consumo, tipo de vehículo y operación del cliente." },
      { id: 'C', text: "Comparar negativamente todos los combustibles." },
      { id: 'D', text: "Ofrecer descuentos sin analizar el caso." }
    ],
    correctAnswer: 'B'
  },
  {
    id: 3,
    question: "¿Cuál de las siguientes preguntas ayuda más a identificar una oportunidad comercial para AutoGLP?",
    options: [
      { id: 'A', text: "¿Quiere comprar hoy?" },
      { id: 'B', text: "¿Cuánto combustible consume actualmente su flota al mes?" },
      { id: 'C', text: "¿Le gusta el color del cilindro?" },
      { id: 'D', text: "¿Prefiere pagar en efectivo?" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 4,
    question: "¿Cuál es uno de los principales argumentos comerciales del AutoGLP frente a combustibles tradicionales?",
    options: [
      { id: 'A', text: "Que no requiere ningún tipo de mantenimiento." },
      { id: 'B', text: "Que puede representar ahorro operativo y una alternativa energética más limpia." },
      { id: 'C', text: "Que todos los vehículos ya vienen convertidos de fábrica." },
      { id: 'D', text: "Que no necesita normas ni regulación." }
    ],
    correctAnswer: 'B'
  },
  {
    id: 5,
    question: "En venta consultiva, cuando un cliente dice “me preocupa la seguridad del AutoGLP”, el asesor debe:",
    options: [
      { id: 'A', text: "Ignorar la objeción y cambiar de tema." },
      { id: 'B', text: "Decir que no hay ningún riesgo sin explicar." },
      { id: 'C', text: "Explicar normas, instalación técnica, mantenimiento y protocolos de seguridad." },
      { id: 'D', text: "Responder que otros clientes no se quejan." }
    ],
    correctAnswer: 'C'
  },
  {
    id: 6,
    question: "¿Cuál es una estrategia adecuada para vender AutoGLP a empresas con flotas vehiculares?",
    options: [
      { id: 'A', text: "Ofrecer solo publicidad general." },
      { id: 'B', text: "Hacer un diagnóstico del consumo actual, costos, rutas y posible ahorro." },
      { id: 'C', text: "Hablar únicamente del logo de la marca." },
      { id: 'D', text: "Evitar mencionar la conversión vehicular." }
    ],
    correctAnswer: 'B'
  },
  {
    id: 7,
    question: "¿Qué significa identificar el “dolor” del cliente en venta consultiva?",
    options: [
      { id: 'A', text: "Saber qué problema, costo o necesidad tiene el cliente." },
      { id: 'B', text: "Presionar al cliente para cerrar rápido." },
      { id: 'C', text: "Hablar solo de los beneficios de la empresa." },
      { id: 'D', text: "Comparar precios sin contexto." }
    ],
    correctAnswer: 'A'
  },
  {
    id: 8,
    question: "¿Cuál de estas opciones es una buena práctica al presentar una propuesta de AutoGLP?",
    options: [
      { id: 'A', text: "Mostrar beneficios generales sin datos." },
      { id: 'B', text: "Personalizar la propuesta con ahorro estimado, consumo, operación y beneficios." },
      { id: 'C', text: "Enviar la misma propuesta a todos los clientes." },
      { id: 'D', text: "Evitar responder preguntas técnicas." }
    ],
    correctAnswer: 'B'
  },
  {
    id: 9,
    question: "En el proceso comercial, ¿por qué es importante hacer seguimiento después de una visita o cotización?",
    options: [
      { id: 'A', text: "Porque demuestra acompañamiento y ayuda a resolver dudas antes del cierre." },
      { id: 'B', text: "Porque reemplaza la necesidad de explicar bien el producto." },
      { id: 'C', text: "Porque obliga al cliente a comprar." },
      { id: 'D', text: "Porque solo sirve para insistir en el precio." }
    ],
    correctAnswer: 'A'
  },
  {
    id: 10,
    question: "¿Cuál sería una propuesta de valor adecuada para promocionar AutoGLP en Colombia?",
    options: [
      { id: 'A', text: "“Es barato y nada más”." },
      { id: 'B', text: "“Es una alternativa energética que puede ayudar a reducir costos operativos, mejorar eficiencia y cumplir condiciones técnicas y normativas”." },
      { id: 'C', text: "“No necesita análisis ni asesoría”." },
      { id: 'D', text: "“Funciona igual para todos los clientes sin importar su operación”." }
    ],
    correctAnswer: 'B'
  }
];

const course3Questions = [
  {
    id: 1,
    context: "CASO: El cliente que nunca regresó... hasta que cambió su asesor, <br> Carlos Mendoza adquirió en AutoGLP la conversión de su taxi a GLP en enero. El servicio de venta fue excelente. <br>Sin embargo, en los meses siguientes nadie lo contactó proactivamente. Cuando tuvo una falla menor, llamó al número general y tardó 3 días en recibir respuesta. Resolvió el problema con un taller externo. <br> En julio, su nueva asesora asignada lo contactó, se disculpó por la experiencia anterior y agendó una revisión gratuita. Le envió un recordatorio de mantenimiento a los 30 días, y 60 días después lo llamó para informarle sobre el nuevo kit de optimización GLP disponible. <br> Carlos no solo regresó: trajo a dos compañeros taxistas que también convirtieron sus vehículos.",
    question: "¿En qué etapas del ciclo de posventa falló el proceso con Carlos durante los primeros meses?",
    options: [
      { id: 'A', text: "Registro tardio en crm" },
      { id: 'B', text: "Primer contacto tardio" },
      { id: 'C', text: "Falto asesoria previa" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 2,
    context: "Carlos es un taxista que convirtió su vehículo a glp hace tres meses. En la etapa inicial, el asesor no registró a tiempo sus datos en el CRM, omitió realizar el primer contacto de posventa dentro de las 48 horas y no le brindó asesoría sobre los mantenimientos estipulados en el manual. Como consecuencia, Carlos tuvo dudas de funcionamiento y el sistema experimentó una descalibración menor que no fue atendida a tiempo, lo que generó molestia. Posteriormente, una nueva asesora tomó el caso, ingresó de inmediato los reportes al CRM, contactó proactivamente a Carlos para indagar posibles deterioros del sistema, le explicó los tiempos de revisión del manual y logró recuperar la satisfacción del cliente, obteniendo incluso nuevos referidos.",
    question: "¿Qué acciones concretas de la nueva asesora corresponden a una posventa proactiva?",
    options: [
      { id: 'A', text: "Ingreso inmediato a crm/ Reporte de Cliente asignado para posventa" },
      { id: 'B', text: "Indagas posibles deterioro del sistema" },
      { id: 'C', text: "Generar un referido por cliente satisfecho" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 3,
    context: "Carlos es un taxista que convirtió su vehículo a glp hace tres meses. En la etapa inicial, el asesor no registró a tiempo sus datos en el CRM, omitió realizar el primer contacto de posventa dentro de las 48 horas y no le brindó asesoría sobre los mantenimientos estipulados en el manual. Como consecuencia, Carlos tuvo dudas de funcionamiento y el sistema experimentó una descalibración menor que no fue atendida a tiempo, lo que generó molestia. Posteriormente, una nueva asesora tomó el caso, ingresó de inmediato los reportes al CRM, contactó proactivamente a Carlos para indagar posibles deterioros del sistema, le explicó los tiempos de revisión del manual y logró recuperar la satisfacción del cliente, obteniendo incluso nuevos referidos.",
    question: "¿Cómo habrías manejado tú la situación desde el primer contacto post-entrega?",
    options: [
      { id: 'A', text: "No tomar contacto del cliente" },
      { id: 'B', text: "Ingresar y reportar client area posventa" },
      { id: 'C', text: "Asesorar correctamente, los tiempos de revisión y mantenimiento estipulados en el manual de usuario entregado al momento del cierre de la venta." }
    ],
    correctAnswer: 'C'
  },
  {
    id: 4,
    context: "Carlos es un taxista que convirtió su vehículo a glp hace tres meses. En la etapa inicial, el asesor no registró a tiempo sus datos en el CRM, omitió realizar el primer contacto de posventa dentro de las 48 horas y no le brindó asesoría sobre los mantenimientos estipulados en el manual. Como consecuencia, Carlos tuvo dudas de funcionamiento y el sistema experimentó una descalibración menor que no fue atendida a tiempo, lo que generó molestia. Posteriormente, una nueva asesora tomó el caso, ingresó de inmediato los reportes al CRM, contactó proactivamente a Carlos para indagar posibles deterioros del sistema, le explicó los tiempos de revisión del manual y logró recuperar la satisfacción del cliente, obteniendo incluso nuevos referidos.",
    question: "¿Qué registros en el CRM habrían sido clave para que esta situación no ocurriera?",
    options: [
      { id: 'A', text: "Modelo del carro" },
      { id: 'B', text: "Referencias comerciales" },
      { id: 'C', text: "Datos de contacto y labores de mantenimiento programadas" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 5,
    context: "Carlos es un taxista que convirtió su vehículo a glp hace tres meses. En la etapa inicial, el asesor no registró a tiempo sus datos en el CRM, omitió realizar el primer contacto de posventa dentro de las 48 horas y no le brindó asesoría sobre los mantenimientos estipulados en el manual. Como consecuencia, Carlos tuvo dudas de funcionamiento y el sistema experimentó una descalibración menor que no fue atendida a tiempo, lo que generó molestia. Posteriormente, una nueva asesora tomó el caso, ingresó de inmediato los reportes al CRM, contactó proactivamente a Carlos para indagar posibles deterioros del sistema, le explicó los tiempos de revisión del manual y logró recuperar la satisfacción del cliente, obteniendo incluso nuevos referidos.",
    question: "¿Qué indicadores de los estándares AutoGLP se incumplieron en la etapa inicial?",
    options: [
      { id: 'A', text: "Falta de gestion documental a tiempo en el sistema y falta de asesoria sobre mantenimiento" },
      { id: 'B', text: "No se realizo preconversion" },
      { id: 'C', text: "No se realizo inspeccion correcta del sistema anterior" }
    ],
    correctAnswer: 'A'
  }
];

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

const QUICK_QUIZ_CONFIG = {
  1: {
    name: '¿Qué es el AutoGLP?',
    subtitle: 'Evaluación comercial y normativa',
    module: 'Módulo Técnico',
    nextPath: '/cursos',
    buttonText: 'SIGUIENTE CURSO',
    questions: course1Questions,
  },
  2: {
    name: 'Proceso Comercial',
    subtitle: 'Venta consultiva y estrategias comerciales',
    module: 'Módulo Comercial',
    nextPath: '/cursos',
    buttonText: 'SIGUIENTE CURSO',
    questions: course2Questions,
  },
  3: {
    name: 'Postventa, CRM y Liderazgo',
    subtitle: 'Evaluación comercial y normativa',
    module: 'Módulo Técnico',
    nextPath: '/curso/3/leccion/5',
    buttonText: 'SIGUIENTE LECCIÓN',
    questions: course3Questions,
  },
};

// Un curso sin entrada aqui no tiene preguntas en el codigo. Antes se resolvia
// con `|| QUICK_QUIZ_CONFIG[1]`, asi que cualquier curso nuevo (creado desde
// /admin) terminaba evaluando al estudiante con el quiz GLP del curso 1.
export const QuizAutoGLP = ({ onPass, courseId }) => {
  const config = QUICK_QUIZ_CONFIG[courseId];

  if (!config) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[32px] border border-dashed border-gray-200 px-6 py-16 text-center">
        <Trophy className="w-12 h-12 mx-auto text-gray-300" />
        <h2 className="mt-4 text-2xl font-black text-gray-800">
          Este curso aún no tiene evaluación
        </h2>
        <p className="mt-2 text-gray-500">
          Cuando se carguen las preguntas de este curso, aquí podrás
          realizarlas.
        </p>
      </div>
    );
  }

  return <QuizEjecutado onPass={onPass} courseId={courseId} config={config} />;
};

const QuizEjecutado = ({ onPass, courseId, config }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const questions = config.questions;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleSelectOption = (optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionId
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResult(false);
    if (onPass) onPass(false); // Reset progress in parent if repeating
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Guardar calificación en Firestore y notificar al padre
  React.useEffect(() => {
    if (!showResult) return;

    // 1. Guardar en Backend Django y Firestore
    const saveScore = async () => {
      if (!currentUser) return;

      const gradePayload = {
        user_id: currentUser.uid,
        // El aviso de aprobación va a la gente interna, y no tiene forma de
        // saber quien es: el user_id de Firebase es opaco.
        user_name: currentUser.displayName || currentUser.email?.split('@')[0] || '',
        user_email: currentUser.email || '',
        course_id: String(courseId),
        course_name: config.name,
        score,
        total_questions: questions.length,
        percentage,
        passed: percentage >= 90,
      };

      // Guardar en Django
      try {
        await fetch('/api/cursos/calificaciones/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gradePayload)
        });
      } catch (err) {
        console.error('Error guardando calificación en Django:', err);
      }

      // Guardar en Firestore
      try {
        await setDoc(
          doc(db, 'calificaciones', `${currentUser.uid}_curso${courseId}`),
          {
            userId: currentUser.uid,
            courseId,
            courseName: config.name,
            score,
            totalQuestions: questions.length,
            percentage,
            passed: percentage >= 90,
            completedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error guardando calificación en Firestore:', err);
      }
    };
    saveScore();


    // 2. Notificar al padre si aprobó
    if (percentage >= 90 && onPass) {
      onPass(true);
    }
  }, [showResult]);

  if (showResult) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-700">
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#f6811e] p-10 text-center relative overflow-hidden">
            {/* Decorative Background Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5fbd44]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#5fbd44]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                <Trophy className="w-10 h-10 text-[#5fbd44]" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2">¡Evaluación Finalizada!</h2>
              <p className="text-[#5fbd44] font-bold text-lg uppercase tracking-widest">Resultado de tu desempeño</p>
            </div>
          </div>

          <div className="p-8 sm:p-12 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-[#f6fbf4] p-8 rounded-3xl text-center border border-gray-100 transition-transform hover:scale-105 duration-300">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-2">Puntaje</p>
                <p className="text-5xl font-black text-[#f6811e]">{score}<span className="text-2xl text-gray-400">/{questions.length}</span></p>
              </div>
              <div className="bg-[#f6fbf4] p-8 rounded-3xl text-center border border-gray-100 transition-transform hover:scale-105 duration-300">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-2">Porcentaje</p>
                <p className="text-5xl font-black text-[#5fbd44]">{percentage}%</p>
              </div>
              <div className="bg-[#f6fbf4] p-8 rounded-3xl text-center border border-gray-100 transition-transform hover:scale-105 duration-300">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-2">Estado</p>
                <p className={`text-2xl font-black ${percentage >= 90 ? 'text-green-500' : 'text-amber-500'}`}>
                  {percentage >= 90 ? '¡EXCELENTE!' : '¡SIGUE MEJORANDO!'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${percentage >= 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-white border-2 border-[#f6811e] text-[#f6811e] px-8 py-5 rounded-2xl font-black hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCcw className="w-6 h-6" />
                  REPETIR EVALUACIÓN
                </button>
                <button
                  disabled={percentage < 90}
                  onClick={() => {
                    if (percentage >= 90) {
                      navigate(config.nextPath);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black shadow-lg transition-all duration-300 ${percentage >= 90
                    ? 'bg-[#5fbd44] text-white shadow-[#5fbd44]/30 hover:bg-[#5fbd44] cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                  {config.buttonText}
                </button>
              </div>
              {percentage < 90 && (
                <p className="mt-4 text-amber-600 font-bold text-sm text-center bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 animate-pulse">
                  Necesitas al menos 90% para avanzar al siguiente curso.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
      {/* HEADER QUIZ */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#f6811e] mb-2 tracking-tight">
            {highlightText("Quiz AutoGLP")}
          </h2>
          <p className="text-[#5fbd44] font-bold text-sm uppercase tracking-[0.2em]">{config.subtitle}</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-gray-400 font-bold mr-1">Pregunta</span>
          <span className="text-2xl font-black text-[#f6811e]">{currentQuestion + 1}</span>
          <span className="text-gray-300 font-bold mx-1">/</span>
          <span className="text-gray-400 font-bold">{questions.length}</span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-12 relative">
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-[#5fbd44] h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(95, 189, 68,0.4)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden transition-all duration-300">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f6fbf4] rounded-bl-[100px] -z-0"></div>

        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 bg-[#f6fbf4] text-[#5fbd44] rounded-lg font-black text-xs tracking-widest uppercase mb-6">
            {config.module}
          </div>

          {q.context && (
            <div className="bg-[#f2ffef]/60 border-l-4 border-[#5fbd44] p-6 rounded-r-3xl mb-8 text-gray-700 leading-relaxed text-base text-justify font-medium">
              {highlightText(q.context)}
            </div>
          )}

          {/* AQUÍ CAMBIAMOS EL TAMAÑO DE LA PREGUNTA */}
          <h3 className={`font-black text-[#f6811e] mb-10 leading-tight ${q.isLong || q.context ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
            {highlightText(q.question)}
          </h3>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {q.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`group flex items-center text-left p-6 rounded-2xl border-2 transition-all duration-300 ${selectedAnswers[currentQuestion] === option.id
                  ? 'border-[#5fbd44] bg-[#5fbd44]/5 ring-4 ring-[#5fbd44]/10'
                  : 'border-gray-100 hover:border-[#5fbd44]/40 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-5 transition-all duration-300 flex-shrink-0 ${selectedAnswers[currentQuestion] === option.id
                  ? 'bg-[#5fbd44] text-white shadow-lg shadow-[#5fbd44]/30 rotate-3'
                  : 'bg-[#f6fbf4] text-[#f6811e] group-hover:bg-[#5fbd44]/10 group-hover:text-[#5fbd44]'
                  }`}>
                  {option.id}
                </div>

                {/* AQUÍ CAMBIAMOS EL TAMAÑO DE LAS OPCIONES */}
                <span className={`font-bold transition-colors duration-300 ${selectedAnswers[currentQuestion] === option.id ? 'text-[#f6811e]' : 'text-gray-600'
                  } ${q.isLong ? 'text-[14px]' : 'text-[17px]'}`}>
                  {highlightText(option.text)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestion]}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black transition-all duration-300 ${selectedAnswers[currentQuestion]
                ? 'bg-[#f6811e] text-white shadow-xl shadow-[#f6811e]/20 hover:scale-105 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {currentQuestion === questions.length - 1 ? 'FINALIZAR EVALUACIÓN' : 'SIGUIENTE PREGUNTA'}
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* TIPS / HELP */}
      <div className="mt-8 flex items-center justify-center gap-3 text-gray-400 font-bold text-sm">
        <AlertCircle className="w-5 h-5 text-[#5fbd44]" />
        <span>Selecciona la respuesta correcta para continuar</span>
      </div>
    </div>
  );
};

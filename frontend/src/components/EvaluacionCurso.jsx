import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, CheckCircle2, ChevronRight, Download, Loader2, Mail,
  RefreshCcw, AlertCircle, Trophy, XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CertificadoGenerator from '../assets/CertificadoGenerator';

// El banco de preguntas lo sirve Django. Antes eran tres arrays fijos escrita
// aca (course1Questions, course2Questions, course3Questions, 683 lineas), con
// la respuesta correcta en el bundle: cualquiera con devtools podia leerla,
// postearla sin resolver nada y disparar el correo de aprobacion y el
// certificado. Ahora el componente no sabe que respuesta es correcta hasta que
// el backend la dice, despues de haber entregado.

const cargarError = (err) => {
  if (err.status === 404) {
    return 'Este curso aún no tiene evaluación.';
  }
  if (err.status === 409) {
    return 'La evaluación está incompleta. Avisa a RH antes de reintentar.';
  }
  return 'No se pudo cargar la evaluación. Revisa tu conexión e inténtalo otra vez.';
};

const EvaluacionCurso = ({ onPass, courseId, courseName, nextPath = '/cursos', buttonText = 'SIGUIENTE CURSO' }) => {
  const { currentUser } = useAuth();
  const [evaluacion, setEvaluacion] = useState(null);
  const [error, setError] = useState('');
  const [actual, setActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  useEffect(() => {
    let vigente = true;

    api.getEvaluacion(courseId)
      .then((data) => {
        // El curso cambia de id sin desmontar el componente (navegar entre
        // cursos): sin esto se pinta el quiz del curso anterior.
        if (vigente) setEvaluacion(data);
      })
      .catch((err) => {
        if (vigente) setError(cargarError(err));
      });

    return () => { vigente = false; };
  }, [courseId]);

  const elegir = (opcionId) => {
    if (!evaluacion) return;
    const pregunta = evaluacion.preguntas[actual];
    setRespuestas({ ...respuestas, [pregunta.id]: opcionId });
  };

  const entregar = async () => {
    setEnviando(true);
    setErrorEnvio('');
    try {
      const data = await api.entregarEvaluacion(courseId, respuestas, {
        uid: currentUser?.uid,
        name: currentUser?.displayName || currentUser?.email?.split('@')[0] || '',
        email: currentUser?.email || '',
      });
      setResultado(data);
      // El veredicto es del backend. Antes se comparaba `percentage >= 90` en
      // tres lugares distintos del JSX, con el 90 fijo.
      if (data.data.passed && onPass) onPass(true);
    } catch (err) {
      setErrorEnvio(cargarError(err));
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setActual(0);
    setRespuestas({});
    setResultado(null);
    setErrorEnvio('');
    if (onPass) onPass(false);
  };

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[32px] border border-dashed border-gray-200 px-6 py-16 text-center">
        <Trophy className="w-12 h-12 mx-auto text-gray-300" />
        <h2 className="mt-4 text-2xl font-black text-gray-800">{error}</h2>
        <p className="mt-2 text-gray-500">
          Cuando se carguen las preguntas de este curso, aquí podrás realizarlas.
        </p>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 text-center">
        <RefreshCcw className="w-8 h-8 mx-auto text-gray-300 animate-spin" />
        <p className="mt-4 text-gray-500 font-semibold">Cargando evaluación…</p>
      </div>
    );
  }

  if (resultado) {
    return (
      <Resultado
        resultado={resultado}
        onReset={reiniciar}
        nextPath={nextPath}
        buttonText={buttonText}
        courseId={courseId}
        courseName={courseName}
        currentUser={currentUser}
      />
    );
  }

  const preguntas = evaluacion.preguntas;
  const pregunta = preguntas[actual];
  const elegida = respuestas[pregunta.id];
  const progreso = ((actual + 1) / preguntas.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#f6811e] mb-2 tracking-tight">
            {evaluacion.titulo}
          </h2>
          <p className="text-[#5fbd44] font-bold text-sm uppercase tracking-[0.2em]">
            Aprobás con {evaluacion.puntaje_aprobacion}%
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-gray-400 font-bold mr-1">Pregunta</span>
          <span className="text-2xl font-black text-[#f6811e]">{actual + 1}</span>
          <span className="text-gray-300 font-bold mx-1">/</span>
          <span className="text-gray-400 font-bold">{preguntas.length}</span>
        </div>
      </div>

      <div className="mb-12 relative">
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-[#5fbd44] h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(95,189,68,0.4)]"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f6fbf4] rounded-bl-[100px] -z-0"></div>

        <div className="relative z-10">
          {pregunta.contexto && (
            // whitespace-pre-line: el contexto viene del admin con saltos de
            // línea reales. Antes venía "<br />" dentro de un string de JSX,
            // que React pintaba como texto literal.
            <div className="bg-[#f2ffef]/60 border-l-4 border-[#5fbd44] p-6 rounded-r-3xl mb-8 text-gray-700 leading-relaxed text-base text-justify font-medium whitespace-pre-line">
              {pregunta.contexto}
            </div>
          )}

          <h3 className={`font-black text-[#f6811e] mb-10 leading-tight ${pregunta.es_larga || pregunta.contexto ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
            {pregunta.texto}
          </h3>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {pregunta.opciones.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => elegir(opcion.id)}
                className={`group flex items-center text-left p-6 rounded-2xl border-2 transition-all duration-300 ${elegida === opcion.id
                  ? 'border-[#5fbd44] bg-[#5fbd44]/5 ring-4 ring-[#5fbd44]/10'
                  : 'border-gray-100 hover:border-[#5fbd44]/40 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-5 transition-all duration-300 flex-shrink-0 ${elegida === opcion.id
                  ? 'bg-[#5fbd44] text-white shadow-lg shadow-[#5fbd44]/30 rotate-3'
                  : 'bg-[#f6fbf4] text-[#f6811e] group-hover:bg-[#5fbd44]/10 group-hover:text-[#5fbd44]'
                  }`}>
                  {String.fromCharCode(65 + pregunta.opciones.indexOf(opcion))}
                </div>
                <span className={`font-bold transition-colors duration-300 ${elegida === opcion.id ? 'text-[#f6811e]' : 'text-gray-600'} ${pregunta.es_larga ? 'text-[14px]' : 'text-[17px]'}`}>
                  {opcion.texto}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={actual === preguntas.length - 1 ? entregar : () => setActual(actual + 1)}
              disabled={!elegida || enviando}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black transition-all duration-300 ${elegida && !enviando
                ? 'bg-[#f6811e] text-white shadow-xl shadow-[#f6811e]/20 hover:scale-105 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {actual === preguntas.length - 1 ? (enviando ? 'ENVIANDO…' : 'FINALIZAR EVALUACIÓN') : 'SIGUIENTE PREGUNTA'}
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {errorEnvio && (
            <p className="mt-4 text-red-600 font-bold text-sm text-center bg-red-50 px-4 py-2 rounded-lg border border-red-100">
              {errorEnvio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3 text-gray-400 font-bold text-sm">
        <AlertCircle className="w-5 h-5 text-[#5fbd44]" />
        <span>Selecciona la respuesta correcta para continuar</span>
      </div>
    </div>
  );
};

// El detalle por pregunta lo manda el backend DESPUES de guardar la nota: ya no
// le sirve al cliente para volver a postear. El quiz viejo no decía qué
// habías fallado.
const Resultado = ({ resultado, onReset, nextPath, buttonText, courseId, courseName, currentUser }) => {
  const navigate = useNavigate();
  const { data, detalle } = resultado;
  const {
    passed, score, total_questions: total, percentage,
    puntaje_aprobacion: umbral, ya_aprobado, intento_percentage: intentoPct,
  } = data;
  // La aprobacion es irreversible, asi que un intento peor que uno ya
  // guardado no le quita el certificado al estudiante. Se lo decimos, en vez
  // de mostrar un porcentaje viejo como si fuera el de este intento.
  const intentoPeor = ya_aprobado && intentoPct !== undefined && intentoPct < percentage;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#f6811e] p-10 text-center relative overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-[#f6fbf4] p-8 rounded-3xl text-center border border-gray-100">
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-2">Puntaje</p>
              <p className="text-5xl font-black text-[#f6811e]">{score}<span className="text-2xl text-gray-400">/{total}</span></p>
            </div>
            <div className="bg-[#f6fbf4] p-8 rounded-3xl text-center border border-gray-100">
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-2">Porcentaje</p>
              <p className="text-5xl font-black text-[#5fbd44]">{percentage}%</p>
            </div>
            <div className="bg-[#f6fbf4] p-8 rounded-3xl text-center border border-gray-100">
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-2">Estado</p>
              <p className={`text-2xl font-black ${passed ? 'text-green-500' : 'text-amber-500'}`}>
                {passed ? '¡EXCELENTE!' : '¡SIGUE MEJORANDO!'}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-10">
            <div
              className={`h-full transition-all duration-1000 ${passed ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-black text-gray-800 mb-4">Revisión pregunta por pregunta</h3>
            <div className="flex flex-col gap-3">
              {detalle.map((item) => (
                <div
                  key={item.pregunta_id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border ${item.correcta ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}
                >
                  {item.correcta
                    ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.texto}</p>
                    <p className={`text-sm font-semibold mt-0.5 ${item.correcta ? 'text-green-600' : 'text-red-500'}`}>
                      {item.correcta ? 'Correcta' : 'Incorrecta'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {intentoPeor && (
            <p className="mt-4 text-amber-600 font-bold text-sm text-center bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
              Este intento dio {intentoPct}%. Tu mejor nota sigue siendo la de
              arriba y tu aprobación no se pierde por repetir.
            </p>
          )}

          {/* Solo si aprobado: el backend rechaza el certificado sin
              Calificacion.passed, asi que ni tiene caso ofrecerlo antes. */}
          {passed && (
            <PanelCertificado
              courseId={courseId}
              nombreUsuario={
                currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Estudiante'
              }
              emailUsuario={currentUser?.email || ''}
              courseName={data.course_name || courseName}
              datos={{ ...data, user_id: currentUser?.uid || '' }}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={onReset}
              className="flex-1 inline-flex items-center justify-center gap-3 bg-white border-2 border-[#f6811e] text-[#f6811e] px-8 py-5 rounded-2xl font-black hover:bg-gray-50 transition-all duration-300"
            >
              <RefreshCcw className="w-6 h-6" />
              REPETIR EVALUACIÓN
            </button>
            <button
              disabled={!passed}
              onClick={() => {
                if (passed) {
                  navigate(nextPath);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black shadow-lg transition-all duration-300 ${passed
                ? 'bg-[#5fbd44] text-white shadow-[#5fbd44]/30 hover:bg-[#5fbd44] cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              {buttonText}
            </button>
          </div>
          {!passed && (
            <p className="mt-4 text-amber-600 font-bold text-sm text-center bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
              Necesitas al menos {umbral}% para avanzar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// El certificado vive acá y no en la pagina del curso: es la nota la que lo
// habilita, no el progreso de las lecciones, y la nota se conoce en este
// momento. El PDF se arma en el navegador con jsPDF (CertificadoGenerator) y
// se sube al backend, que lo guarda, lo sirve para descargar y manda el aviso.
//
// El boton de descarga local no espera al servidor: el usuario quiere el
// archivo en su carpeta ahora. El de correo si, porque el aviso sale de Django.
const PanelCertificado = ({ courseId, nombreUsuario, emailUsuario, courseName, datos }) => {
  const certRef = useRef(null);
  const [estado, setEstado] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const armarBlob = async () => {
    if (!certRef.current) return null;
    return certRef.current.generarPDF();
  };

  const descargar = async () => {
    try {
      const blob = await armarBlob();
      if (!blob) throw new Error('El generador de PDF no cargó. Recargá la página.');
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `Certificado_${courseName}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (err) {
      setEstado(`No se pudo descargar: ${err.message}`);
    }
  };

  const enviarCorreo = async () => {
    setOcupado(true);
    setEstado('Generando el certificado y enviando el correo...');
    try {
      const blob = await armarBlob();
      if (!blob) throw new Error('El generador de PDF no cargó. Recargá la página.');
      const respuesta = await api.registrarCertificado(blob, {
        nombreUsuario,
        emailUsuario,
        curso: courseName,
        userId: datos.user_id,
        courseId,
      });
      if (respuesta.correo_estudiante) {
        setEstado('Listo. Te mandamos el certificado a tu correo y avisamos al equipo interno.');
      } else if (respuesta.sin_correo) {
        setEstado('Guardamos tu certificado, pero no tenemos un correo tuyo registrado para mandártelo. Descargalo acá.');
      } else {
        setEstado('Guardamos tu certificado, pero el correo no salió. Podés descargarlo igual o pedir que lo reenvíen.');
      }
    } catch (err) {
      setEstado(`No se pudo enviar: ${err.message}`);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-[#f6fbf4] to-white border-2 border-[#5fbd44]/30 rounded-3xl p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#5fbd44]/10 flex items-center justify-center">
          <Award className="w-6 h-6 text-[#5fbd44]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-800">Tu certificado está listo</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Descargalo ahora o mandátelo por correo. También queda guardado en
            el servidor para que lo bajes otra vez cuando quieras.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={descargar}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f6811e] text-white px-6 py-3.5 rounded-2xl font-black hover:bg-[#e8721a] transition-all"
        >
          <Download className="w-5 h-5" />
          DESCARGAR PDF
        </button>
        <button
          onClick={enviarCorreo}
          disabled={ocupado}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5fbd44] text-white px-6 py-3.5 rounded-2xl font-black hover:bg-[#4da43a] transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          {ocupado ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
          ENVIAR A MI CORREO
        </button>
      </div>

      {estado && (
        <p className="mt-4 text-sm font-bold text-[#50634b] bg-white px-4 py-3 rounded-lg border border-[#5fbd44]/20">
          {estado}
        </p>
      )}

      {/* El generador se posiciona fuera de pantalla por su cuenta (fixed con
          left negativo), pero NO con display:none: html-to-image necesita que
          el nodo tenga layout para rasterizarlo, y sin esto salia un PDF en
          blanco. */}
      <CertificadoGenerator
        ref={certRef}
        nombreUsuario={nombreUsuario}
        curso={courseName}
        fecha={new Date().toLocaleDateString('es-CO')}
        score={datos.score}
        total={datos.total_questions}
        porcentaje={datos.percentage}
        umbral={datos.puntaje_aprobacion}
      />
    </div>
  );
};

export { EvaluacionCurso };

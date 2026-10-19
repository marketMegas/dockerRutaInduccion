import { useCallback, useEffect, useState } from 'react';
import {
  ClipboardList, Save, Trash2, Plus, AlertTriangle, CheckCircle2, Radio
} from 'lucide-react';
import { api } from '../services/api';

// Pantalla de gestion del banco de evaluaciones (solo staff; la puerta es
// RequireStaff en App.jsx y, sobre todo, requiere_staff en el backend).
//
// La regla de oro de esta pantalla: el backend manda. Cada mutation devuelve
// el detalle completo de la evaluacion ya relee de la base, y eso se vuelca
// entero en el estado con `aplicarDetalle`. No hay listas optimistas ni
// espejos locales que reconciliar: lo que se pinta despues de un guardado es
// exactamente lo que Django acaba de persistir, y si el guardado falla (un
// 400 con motivo, como "no se puede activar con el banco incompleto") la
// pantalla no se mueve y el motivo se muestra arriba.
//
// Alcance a proposito acotado: NO se crean ni se borran evaluaciones (eso
// sigue siendo /admin de Django); lo que se edita es el formulario de la
// evaluacion y el CRUD de preguntas y opciones, marcando la correcta con un
// radio por pregunta (una sola correcta es la regla del modelo).

// ── Fila de opcion: radio de correcta, texto editable y borrar ──────────

const FilaOpcion = ({ opcion, preguntaId, onCambio, onBorrar, ocupando }) => (
  <div className="flex items-center gap-3 py-1.5 group">
    <input
      type="radio"
      name={`correcta-${preguntaId}`}
      checked={opcion.es_correcta}
      onChange={() => onCambio({ es_correcta: true })}
      disabled={ocupando}
      title="Marcar como respuesta correcta"
      className="w-4 h-4 shrink-0 accent-[#5fbd44] cursor-pointer"
    />
    <input
      type="text"
      // Uncontrolled a proposito: `key` con el texto hace que, si el backend
      // devuelve la opcion con el texto recortado u otro, el input se
      // remonte con el valor verdadero; mientras se escribe no se toca.
      key={`${opcion.id}:${opcion.texto}`}
      defaultValue={opcion.texto}
      disabled={ocupando}
      onBlur={(e) => {
        const texto = e.target.value.trim();
        if (texto && texto !== opcion.texto) onCambio({ texto });
      }}
      className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#5fbd44] disabled:bg-gray-50"
    />
    <button
      type="button"
      onClick={onBorrar}
      disabled={ocupando}
      title="Borrar opcion"
      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

// ── Tarjeta de una pregunta completa ─────────────────────────────────────

const TarjetaPregunta = ({ pregunta, indice, avisar, onCambio, onBorrar, onCambioOpcion, onBorrarOpcion, onOpcionCreada, ocupando }) => {
  const [texto, setTexto] = useState(pregunta.texto);
  const [contexto, setContexto] = useState(pregunta.contexto || '');
  const [esLarga, setEsLarga] = useState(pregunta.es_larga);
  const [orden, setOrden] = useState(String(pregunta.orden));
  const [nuevaOpcion, setNuevaOpcion] = useState('');
  const [correctaNueva, setCorrectaNueva] = useState(false);

  // Si el servidor devolvio otra version de ESTA pregunta (alguien mas la
  // edito, o un borrado de opcion cambio el banco), los inputs locales se
  // resetean. Mientras `pregunta` no cambia de identidad no se tocan, asi
  // que escribir no se interrumpe. Es el caso clasico de "adjust some state
  // when a prop changes", que la regla pide resolver con `key` en el padre;
  // aca no sirve porque el remontar tambien perderia el texto mientras se
  // escribe, y el unico momento en que hay que resetear es cuando cambia
  // el prop.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTexto(pregunta.texto);
    setContexto(pregunta.contexto || '');
    setEsLarga(pregunta.es_larga);
    setOrden(String(pregunta.orden));
  }, [pregunta]);

  const guardar = async () => {
    const ordenNum = parseInt(orden, 10);
    if (!texto.trim()) {
      avisar('La pregunta no puede quedar vacía.');
      return;
    }
    if (Number.isNaN(ordenNum)) {
      avisar('El orden debe ser un número.');
      return;
    }
    await onCambio({ texto: texto.trim(), contexto, es_larga: esLarga, orden: ordenNum });
  };

  const agregarOpcion = async (e) => {
    e.preventDefault();
    if (!nuevaOpcion.trim()) return;
    const ok = await onOpcionCreada({ texto: nuevaOpcion.trim(), es_correcta: correctaNueva });
    if (ok) {
      setNuevaOpcion('');
      setCorrectaNueva(false);
    }
  };

  const correctas = pregunta.opciones.filter((o) => o.es_correcta).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#f6811e]">
          Pregunta {indice + 1}
        </span>
        <button
          type="button"
          onClick={onBorrar}
          disabled={ocupando}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Borrar
        </button>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        disabled={ocupando}
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#5fbd44] resize-y disabled:bg-gray-50"
        placeholder="Enunciado de la pregunta"
      />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 mb-4">
        <input
          type="text"
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          disabled={ocupando}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#5fbd44] disabled:bg-gray-50"
          placeholder="Contexto (opcional)"
        />
        <input
          type="number"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          disabled={ocupando}
          title="Orden"
          className="w-20 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#5fbd44] disabled:bg-gray-50"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer select-none self-center">
          <input
            type="checkbox"
            checked={esLarga}
            onChange={(e) => setEsLarga(e.target.checked)}
            disabled={ocupando}
            className="w-4 h-4 rounded accent-[#5fbd44]"
          />
          Respuesta larga
        </label>
      </div>

      {/* Opciones: el radio de la derecha marca la correcta. Una sola por
          pregunta, y el backend se encarga de desmarcar las demas. */}
      <div className="rounded-xl bg-[#f8faf8] border border-[#5fbd44]/15 px-4 py-2 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#5fbd44] pt-2 pb-1 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5" />
          Opciones
        </p>
        {pregunta.opciones.map((opcion) => (
          <FilaOpcion
            key={opcion.id}
            opcion={opcion}
            preguntaId={pregunta.id}
            ocupando={ocupando}
            onCambio={(datos) => onCambioOpcion(opcion.id, datos)}
            onBorrar={() => onBorrarOpcion(opcion.id)}
          />
        ))}
        {pregunta.opciones.length === 0 && (
          <p className="text-xs text-gray-400 py-2">
            Sin opciones todavía. Agrega al menos una y márcala como correcta.
          </p>
        )}

        <form onSubmit={agregarOpcion} className="flex items-center gap-2 pt-2 pb-1 border-t border-[#5fbd44]/10 mt-1">
          <input
            type="text"
            value={nuevaOpcion}
            onChange={(e) => setNuevaOpcion(e.target.value)}
            disabled={ocupando}
            placeholder="Nueva opción"
            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#5fbd44] disabled:bg-gray-50"
          />
          <label className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={correctaNueva}
              onChange={(e) => setCorrectaNueva(e.target.checked)}
              disabled={ocupando}
              className="w-3.5 h-3.5 rounded accent-[#5fbd44]"
            />
            Correcta
          </label>
          <button
            type="submit"
            disabled={ocupando || !nuevaOpcion.trim()}
            className="flex items-center gap-1 bg-[#5fbd44] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#3a8f2c] transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        </form>
      </div>

      {correctas !== 1 && (
        <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {correctas === 0
            ? 'Esta pregunta no tiene respuesta correcta marcada: no podrá activarse la evaluación así.'
            : `Hay ${correctas} respuestas correctas marcadas: debe ser exactamente una.`}
        </p>
      )}

      <button
        type="button"
        onClick={guardar}
        disabled={ocupando}
        className="flex items-center gap-2 text-sm font-bold text-[#3a8f2c] hover:bg-[#edffe8] px-3 py-2 rounded-xl transition-colors disabled:opacity-40"
      >
        <Save className="w-4 h-4" />
        Guardar pregunta
      </button>
    </div>
  );
};

// ── La pagina ────────────────────────────────────────────────────────────

export const EvaluacionesAdminPage = () => {
  const [lista, setLista] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [seleccionId, setSeleccionId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  // Se DERIVA y no es un estado: mientras haya una seleccion y no haya
  // detalle cargado, se esta cargando. Un useState + setState dentro del
  // effect solo para el spinner causaba el render en cascada que evita la
  // regla de React; ademas el estado podia quedar desfasado del detalle.
  const cargandoDetalle = !!seleccionId && !detalle;
  const [ocupando, setOcupando] = useState(false);
  const [error, setError] = useState('');

  // Campos del formulario de la evaluacion: se editan locally y solo se
  // persisten con "Guardar cambios" (un PUT con los cuatro juntos).
  const [titulo, setTitulo] = useState('');
  const [puntaje, setPuntaje] = useState('90');
  const [ordenEval, setOrdenEval] = useState('1');
  const [activa, setActiva] = useState(false);

  const [preguntaNueva, setPreguntaNueva] = useState('');

  const avisar = (mensaje) => setError(mensaje);

  // El detalle devuelto por el backend se vuelca entero: estado + campos del
  // form + la fila del listado (titulo/puntaje/activa/conteos pueden haber
  // cambiado). Una sola fuente de verdad y cero reconciliaciones manuales.
  const aplicarDetalle = useCallback((d) => {
    setDetalle(d);
    setTitulo(d.titulo);
    setPuntaje(String(d.puntaje_aprobacion));
    setOrdenEval(String(d.orden));
    setActiva(d.activa);
    setLista((prev) => prev.map((e) => (e.id === d.id
      ? {
        ...e,
        titulo: d.titulo,
        puntaje_aprobacion: d.puntaje_aprobacion,
        orden: d.orden,
        activa: d.activa,
        total_preguntas: d.total_preguntas,
      }
      : e)));
  }, []);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const r = await api.listarEvaluacionesAdmin();
        if (!vigente) return;
        setLista(r.evaluaciones);
        if (r.evaluaciones.length > 0) setSeleccionId(r.evaluaciones[0].id);
      } catch (err) {
        if (!vigente) return;
        setError(err.message);
      } finally {
        if (vigente) setCargandoLista(false);
      }
    })();
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!seleccionId) return undefined;
    let vigente = true;
    // El spinner lo maneja `cargandoDetalle` (derivado de detalle === null);
    // aca solo va la llamada.
    (async () => {
      try {
        const d = await api.getEvaluacionAdmin(seleccionId);
        if (!vigente) return;
        aplicarDetalle(d);
      } catch (err) {
        if (!vigente) return;
        setError(err.message);
      }
    })();
    return () => { vigente = false; };
  }, [seleccionId, aplicarDetalle]);

  // Envuelve cada llamada: ocupando deshabilita todo lo que escribiría, y
  // el 400 del backend (con su motivo legible) va al banner de arriba.
  // Devuelve true si salio bien, para que el llamador solo limpie sus
  // inputs locales en ese caso (si no, el texto tipeado se pierdia aunque
  // el guardado haya fallado).
  const ejecutar = async (accion) => {
    setOcupando(true);
    setError('');
    try {
      const d = await accion();
      if (d) aplicarDetalle(d);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setOcupando(false);
    }
  };

  const guardarEvaluacion = () => ejecutar(() => api.editarEvaluacionAdmin(seleccionId, {
    titulo,
    puntaje_aprobacion: parseInt(puntaje, 10),
    orden: parseInt(ordenEval, 10),
    activa,
  }));

  const crearPregunta = async (e) => {
    e.preventDefault();
    if (!preguntaNueva.trim()) return;
    const ok = await ejecutar(() => api.crearPreguntaAdmin(seleccionId, { texto: preguntaNueva.trim() }));
    if (ok) setPreguntaNueva('');
  };

  const bancoIncompleto = detalle
    ? detalle.preguntas.some((p) => p.opciones.filter((o) => o.es_correcta).length !== 1)
    : false;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#f6811e] to-[#5fbd44] rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-400">
            <ClipboardList className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight">Gestión de Evaluaciones</h1>
            <p className="text-green-200 font-medium mt-1">
              Editá el formulario, las preguntas y las respuestas correctas de cada curso
            </p>
          </div>
          {detalle && (
            <div className="bg-white/10 backdrop-blur border border-green-400 rounded-2xl px-6 py-4 text-center flex-shrink-0">
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Preguntas</p>
              <p className="text-4xl font-black text-green-400">{detalle.total_preguntas}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BANNER DE ERROR ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-xs font-bold text-red-400 hover:text-red-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {cargandoLista && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-[#f6811e] border-t-transparent animate-spin" />
          <p className="text-gray-500 font-semibold">Cargando evaluaciones…</p>
        </div>
      )}

      {!cargandoLista && lista.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-[#edffe8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-[#f6811e]" />
          </div>
          <h3 className="text-xl font-black text-[#f6811e] mb-2">No hay evaluaciones todavía</h3>
          <p className="text-gray-400 font-medium max-w-md mx-auto">
            Las evaluaciones se crean junto a su curso, desde el panel de Django
            (/admin). Una vez creadas, acá se editan sus preguntas y respuestas.
          </p>
        </div>
      )}

      {!cargandoLista && lista.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── LISTADO ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#5fbd44]">
              Evaluaciones
            </p>
            <ul>
              {lista.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSeleccionId(e.id);
                      // Sin esto el detalle viejo seguiría pintado (y
                      // cargandoDetalle derivado quedaría en false) hasta que
                      // llegue el nuevo.
                      setDetalle(null);
                      setError('');
                    }}
                    className={`w-full text-left px-4 py-3 border-l-4 transition-colors ${seleccionId === e.id
                      ? 'border-[#f6811e] bg-[#fff7ef]'
                      : 'border-transparent hover:bg-gray-50'
                      }`}
                  >
                    <p className="text-sm font-bold text-gray-800 truncate">{e.titulo}</p>
                    <p className="text-xs text-gray-400 truncate">{e.course_title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full ${e.activa
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                        }`}>
                        {e.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {e.total_preguntas} preg.
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── EDITOR ── */}
          <div className="space-y-6 min-w-0">
            {cargandoDetalle && (
              <div className="flex items-center justify-center min-h-[30vh]">
                <div className="w-12 h-12 rounded-full border-4 border-[#f6811e] border-t-transparent animate-spin" />
              </div>
            )}

            {detalle && !cargandoDetalle && (
              <>
                {/* Datos de la evaluacion */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-[#f6811e] uppercase tracking-widest">
                      Datos de la evaluación
                    </h2>
                    <span className="text-xs font-semibold text-gray-400">
                      Curso: {detalle.course_title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 mb-4">
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      disabled={ocupando}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#f6811e] disabled:bg-gray-50"
                      placeholder="Título"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      Aprueba con
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={puntaje}
                        onChange={(e) => setPuntaje(e.target.value)}
                        disabled={ocupando}
                        className="w-20 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#f6811e] disabled:bg-gray-50"
                      />%
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      Orden
                      <input
                        type="number"
                        value={ordenEval}
                        onChange={(e) => setOrdenEval(e.target.value)}
                        disabled={ocupando}
                        className="w-20 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#f6811e] disabled:bg-gray-50"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer select-none mb-1">
                    <input
                      type="checkbox"
                      checked={activa}
                      onChange={(e) => setActiva(e.target.checked)}
                      disabled={ocupando}
                      className="w-4 h-4 rounded accent-[#5fbd44]"
                    />
                    Evaluación activa (visible para los estudiantes)
                  </label>
                  {activa && bancoIncompleto && (
                    <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Hay preguntas sin exactamente una respuesta correcta: al
                      guardar, el backend rechazará la activación.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={guardarEvaluacion}
                    disabled={ocupando}
                    className="mt-3 flex items-center gap-2 bg-[#5fbd44] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#3a8f2c] transition-colors disabled:opacity-40"
                  >
                    <Save className="w-4 h-4" />
                    Guardar cambios
                  </button>
                </div>

                {/* Preguntas */}
                <div>
                  <h2 className="text-lg font-black text-[#f6811e] mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Preguntas ({detalle.total_preguntas})
                  </h2>

                  <div className="space-y-4">
                    {detalle.preguntas.map((pregunta, i) => (
                      <TarjetaPregunta
                        key={pregunta.id}
                        pregunta={pregunta}
                        indice={i}
                        avisar={avisar}
                        ocupando={ocupando}
                        onCambio={(datos) => ejecutar(() => api.editarPreguntaAdmin(pregunta.id, datos))}
                        onBorrar={() => {
                          if (window.confirm(`¿Borrar la pregunta ${i + 1} y todas sus opciones?`)) {
                            ejecutar(() => api.borrarPreguntaAdmin(pregunta.id));
                          }
                        }}
                        onCambioOpcion={(opcionId, datos) => ejecutar(() => api.editarOpcionAdmin(opcionId, datos))}
                        onBorrarOpcion={(opcionId) => {
                          if (window.confirm('¿Borrar esta opción?')) {
                            ejecutar(() => api.borrarOpcionAdmin(opcionId));
                          }
                        }}
                        onOpcionCreada={(datos) => ejecutar(() => api.crearOpcionAdmin(pregunta.id, datos))}
                      />
                    ))}
                  </div>

                  {detalle.preguntas.length === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center mb-4">
                      <p className="text-gray-400 font-medium text-sm">
                        Esta evaluación no tiene preguntas todavía.
                      </p>
                    </div>
                  )}

                  {/* Agregar pregunta */}
                  <form onSubmit={crearPregunta} className="flex items-center gap-2 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <input
                      type="text"
                      value={preguntaNueva}
                      onChange={(e) => setPreguntaNueva(e.target.value)}
                      disabled={ocupando}
                      placeholder="Enunciado de la pregunta nueva"
                      className="flex-1 min-w-0 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5fbd44]/40 focus:border-[#5fbd44] disabled:bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={ocupando || !preguntaNueva.trim()}
                      className="flex items-center gap-2 bg-[#f6811e] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#e06f10] transition-colors disabled:opacity-40 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar pregunta
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

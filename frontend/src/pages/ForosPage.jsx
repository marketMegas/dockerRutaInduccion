import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, Plus, Send, User, Clock,
  ArrowLeft, Search, MessageCircle, HelpCircle, Loader2
} from 'lucide-react';

// ── Base URL del backend Django ──────────────────────────────────────────────
const API_BASE = '/api/foro';

// ── Helper: formatear fecha ISO a string legible ─────────────────────────────
const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
};

export const ForosPage = () => {
  const { currentUser } = useAuth();

  const [threads, setThreads] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');

  // Nombre del usuario logueado
  const currentUserName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Invitado';

  // ── 1. Cargar temas desde Django API ───────────────────────────────────────
  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/temas/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // La API devuelve los temas más recientes primero (ordering=[-fecha_creacion])
      setThreads(data);
    } catch (err) {
      console.error('Error al cargar temas:', err);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // ── 2. Cargar comentarios del tema activo ──────────────────────────────────
  const fetchComments = useCallback(async (temaId) => {
    if (!temaId) { setComments([]); return; }
    setLoadingComments(true);
    try {
      const res = await fetch(`${API_BASE}/temas/${temaId}/comentarios/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    fetchComments(activeThreadId);
  }, [activeThreadId, fetchComments]);

  // ── Filtrado de temas ──────────────────────────────────────────────────────
  const filteredThreads = threads.filter((t) =>
    t.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contenido?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find((t) => t.id === activeThreadId);

  // ── 3. Crear tema (POST /api/foro/temas/) ──────────────────────────────────
  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/temas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: newTitle.trim(),
          contenido: newContent.trim(),
          autor: currentUserName,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newThread = await res.json();

      setThreads((prev) => [newThread, ...prev]); // Insertar al tope sin recargar
      setNewTitle('');
      setNewContent('');
      setShowCreateModal(false);
      setActiveThreadId(newThread.id);
    } catch (err) {
      console.error('Error al crear tema:', err);
      alert('No se pudo publicar el tema. Verifica que el servidor Django esté activo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 4. Crear comentario (POST /api/foro/temas/<id>/comentarios/) ───────────
  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeThreadId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/temas/${activeThreadId}/comentarios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: newComment.trim(),
          autor: currentUserName,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newPost = await res.json();

      setComments((prev) => [...prev, newPost]); // Añadir al final
      setNewComment('');
    } catch (err) {
      console.error('Error al publicar comentario:', err);
      alert('No se pudo publicar el comentario. Verifica que el servidor Django esté activo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="bg-[#5fbd44]/10 text-[#5fbd44] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-[#5fbd44]/20">
            Foro Comunitario
          </span>
          <h2 className="text-3xl font-black text-[#f6811e] tracking-tight mt-2">
            Espacio de Consulta e Intercambio Megas
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Resuelve dudas técnicas, comparte argumentos comerciales y colabora con otros expertos.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-[#5fbd44] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#5fbd44] transition-all shadow-lg shadow-[#5fbd44]/20 text-sm whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Nuevo Tema
        </button>
      </div>

      {/* SPLIT PANEL */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-[600px] h-[calc(100vh-230px)] min-w-0">

        {/* PANEL IZQUIERDO: lista de temas */}
        <div className={`w-full lg:w-[400px] border-r border-gray-100 flex flex-col min-w-0 overflow-hidden ${activeThreadId !== null ? 'hidden lg:flex' : 'flex'}`}>
          {/* Buscador */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative flex items-center group">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-[#5fbd44] transition-colors" />
              <input
                type="text"
                placeholder="Buscar temas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#5fbd44] focus:ring-2 focus:ring-[#5fbd44]/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Listado */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingThreads ? (
              <div className="flex items-center justify-center p-10 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm font-semibold">Cargando temas…</span>
              </div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-5 cursor-pointer transition-all duration-200 border-l-4 hover:bg-slate-50/80 ${activeThreadId === thread.id
                      ? 'bg-green-50/40 border-[#5fbd44]'
                      : 'border-transparent'
                    }`}
                >
                  <h3 className="font-bold text-[#f6811e] text-[15px] line-clamp-2 leading-snug">
                    {thread.titulo}
                  </h3>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2 font-medium break-anywhere">
                    {thread.contenido}
                  </p>
                  <div className="flex items-center justify-between mt-4 text-gray-400 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate max-w-[120px]">{thread.autor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {/* Contar solo los del estado local si está abierto */}
                        {activeThreadId === thread.id ? comments.length : '—'}
                      </span>
                      <span>{formatDate(thread.fecha_creacion)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No se encontraron temas</p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: detalle del tema */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 min-w-0 overflow-hidden ${activeThreadId === null ? 'hidden lg:flex' : 'flex'}`}>
          {activeThread ? (
            <div className="h-full flex flex-col min-w-0">

              {/* Volver (solo móvil) */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center lg:hidden">
                <button
                  onClick={() => setActiveThreadId(null)}
                  className="flex items-center gap-2 text-[#5fbd44] font-bold text-sm cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver a temas
                </button>
              </div>

              {/* Cabecera del tema */}
              <div className="p-6 md:p-8 bg-white border-b border-gray-100 shadow-sm overflow-y-auto overflow-x-hidden min-w-0 max-h-[50vh] break-anywhere">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#f6811e]/5 border border-[#f6811e]/10 flex items-center justify-center font-bold text-[#f6811e]">
                    {activeThread.autor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#f6811e] text-sm">{activeThread.autor}</h4>
                    <p className="text-gray-400 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {formatDate(activeThread.fecha_creacion)}
                    </p>
                  </div>
                </div>
                <h1 className="text-2xl font-black text-[#f6811e] tracking-tight leading-snug">
                  {activeThread.titulo}
                </h1>
                <p className="text-gray-600 text-base mt-4 leading-relaxed font-medium whitespace-pre-line break-anywhere text-justify">
                  {activeThread.contenido}
                </p>
              </div>

              {/* Comentarios */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-6 min-w-0">
                <h3 className="font-black text-[#f6811e] text-lg flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-[#5fbd44]" />
                  Respuestas ({comments.length})
                </h3>

                {loadingComments ? (
                  <div className="flex items-center justify-center py-10 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm font-semibold">Cargando respuestas…</span>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#f6811e] text-xs">
                            {comment.autor.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-800 text-sm">{comment.autor}</span>
                        </div>
                        <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(comment.fecha_creacion)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-line break-anywhere">
                        {comment.contenido}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">Aún no hay respuestas. ¡Sé el primero!</p>
                  </div>
                )}
              </div>

              {/* Formulario comentario */}
              <div className="p-4 md:p-6 bg-white border-t border-gray-100 shadow-lg flex-shrink-0">
                <form onSubmit={handleCreateComment} className="flex items-start gap-4">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Escribe tu respuesta..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      rows={2}
                      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#5fbd44] focus:ring-2 focus:ring-[#5fbd44]/10 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 font-medium resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#5fbd44] hover:bg-[#5fbd44] disabled:opacity-60 text-white p-3.5 rounded-2xl font-bold transition-all shadow-md shadow-[#5fbd44]/20 flex items-center justify-center cursor-pointer flex-shrink-0"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-[#5fbd44]/5 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-[#5fbd44]" />
              </div>
              <h3 className="text-2xl font-black text-[#f6811e]">Foro de Consulta G-MAX</h3>
              <p className="text-gray-500 font-medium max-w-sm mt-2 leading-relaxed">
                Selecciona un tema de la lista o crea uno nuevo para empezar la conversación.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: crear tema */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-[#f6811e]/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in duration-300 border border-gray-100">
            <h3 className="text-2xl font-black text-[#f6811e] tracking-tight mb-2">
              Crear Nuevo Tema de Conversación
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-6">
              Plantea una pregunta clara o una idea técnica detallada para recibir ayuda de la comunidad.
            </p>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Título del tema</label>
                <input
                  type="text"
                  placeholder="Ej: Nuevo tema de discusion sobre la induccion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#5fbd44] focus:ring-2 focus:ring-[#5fbd44]/10 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Detalle o descripción</label>
                <textarea
                  placeholder="Describe detalladamente tu pregunta o caso de estudio..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#5fbd44] focus:ring-2 focus:ring-[#5fbd44]/10 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all font-medium resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#5fbd44] hover:bg-[#5fbd44] disabled:opacity-60 transition-all shadow-md shadow-[#5fbd44]/20 text-sm cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publicar Tema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

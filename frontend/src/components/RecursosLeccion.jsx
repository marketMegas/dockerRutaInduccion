import { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';

export const RecursosLeccion = ({ recursos = [], titulo = 'Recursos de esta lección' }) => {
  const [recursoModal, setRecursoModal] = useState(null);

  if (!recursos || recursos.length === 0) return null;

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
      <h2 className="text-sm font-black text-[#f6811e] uppercase tracking-widest mb-4">
        {titulo}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recursos.map((recurso) => (
          recurso.tipo === 'PDF' ? (
            <button
              key={recurso.id}
              type="button"
              onClick={() => window.open(recurso.url, '_blank', 'noopener,noreferrer')}
              className="group flex flex-col items-start gap-3 bg-white rounded-[20px] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 w-full">
                <p className="font-bold text-gray-900 break-words">{recurso.title}</p>
                {recurso.description && (
                  <p className="text-sm text-gray-500 mt-1 break-words">{recurso.description}</p>
                )}
              </div>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#f6811e] group-hover:underline">
                <Download className="w-4 h-4" />
                Abrir PDF
              </span>
            </button>
          ) : (
            <button
              key={recurso.id}
              type="button"
              onClick={() => setRecursoModal(recurso)}
              className="group overflow-hidden rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white cursor-pointer text-left"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-50">
                <img
                  src={recurso.url}
                  alt={recurso.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-900 break-words">{recurso.title}</p>
                {recurso.description && (
                  <p className="text-sm text-gray-500 mt-1 break-words">{recurso.description}</p>
                )}
              </div>
            </button>
          )
        ))}
      </div>

      {recursoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setRecursoModal(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-[20px] overflow-hidden shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 break-words pr-4">{recursoModal.title}</h3>
              <button
                type="button"
                onClick={() => setRecursoModal(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
                aria-label="Cerrar imagen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={recursoModal.url}
                alt={recursoModal.title}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

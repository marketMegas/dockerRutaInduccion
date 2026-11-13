import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ImageCarousel = ({ images = [], alt = '', className = '' }) => {
  const lista = Array.isArray(images) ? images : [];
  const firma = lista.join('|');
  const [estado, setEstado] = useState({ firma, index: 0 });
  const touchStartX = useRef(null);

  if (lista.length === 0) return null;

  const index = estado.firma === firma ? estado.index : 0;
  const total = lista.length;

  const setIndex = (actualizar) => {
    setEstado((prev) => {
      const base = prev.firma === firma ? prev.index : 0;
      const siguiente = typeof actualizar === 'function' ? actualizar(base) : actualizar;
      return { firma, index: (siguiente + total) % total };
    });
  };

  const go = (delta) => setIndex((prev) => prev + delta);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  };

  return (
    <div
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={total > 1 ? 0 : -1}
      role="group"
      aria-label={alt}
    >
      <img
        src={lista[index]}
        alt={total > 1 ? `${alt} (${index + 1} de ${total})` : alt}
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {lista.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`h-2 rounded-full transition-all cursor-pointer ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

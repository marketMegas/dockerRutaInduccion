import React from 'react';

export const TextoEnParrafos = ({ texto = '', className = '', parrafoClassName = '' }) => {
  const bloques = String(texto)
    .split(/\n+/)
    .map((bloque) => bloque.trim())
    .filter(Boolean);

  if (bloques.length === 0) return null;

  return (
    <div className={className}>
      {bloques.map((bloque, index) => (
        <p key={index} className={parrafoClassName}>
          {bloque}
        </p>
      ))}
    </div>
  );
};

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-[#f6811e]" />
      <p className="font-medium">{text}</p>
    </div>
  );
};

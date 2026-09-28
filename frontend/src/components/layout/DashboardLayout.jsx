import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] font-sans">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      {/* Contenido Principal */}
      <main className="flex-1 ml-0 lg:ml-[260px] flex flex-col h-screen transition-all overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        {/* Contenedor del contenido dinámico con scroll independiente */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

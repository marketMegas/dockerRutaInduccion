import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ setIsSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Obtener nombre a mostrar: displayName o parte antes del @ del email
  const displayName = currentUser?.displayName
    || currentUser?.email?.split('@')[0]
    || 'Usuario';

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <header className="h-[64px] bg-white border-b border-[#5fbd44]/15 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      
      {/* 1. Lado Izquierdo: Menú Hamburguesa (Móvil) */}
      <div className="flex-1 flex items-center lg:hidden">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-500 hover:text-[#5fbd44] transition-colors rounded-lg hover:bg-[#5fbd44]/10"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Espaciador invisible para desktop */}
      <div className="hidden lg:flex flex-1"></div>

      {/* 2. Centro: Buscador */}
      <div className="flex-[2] hidden sm:flex justify-center items-center px-4">
        <div className="w-full max-w-lg">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-[#5fbd44] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar contenido, cursos..." 
              className="w-full bg-[#f4faf0] border border-transparent focus:bg-white focus:border-[#5fbd44] focus:ring-2 focus:ring-[#5fbd44]/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* 3. Lado Derecho: Notificaciones + Perfil */}
      <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6">
        {/* Campana de notificaciones */}
        <button className="text-gray-400 hover:text-[#5fbd44] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#5fbd44] rounded-full ring-2 ring-white"></span>
        </button>

        {/* Separador */}
        <div className="h-8 w-px bg-[#5fbd44]/20 hidden sm:block"></div>

        {/* Perfil con dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="profile-menu-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5fbd44] to-[#2f7d22] flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-white shadow-md group-hover:ring-[#5fbd44] transition-all">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-bold text-gray-800 text-sm leading-tight">
                Hola, {displayName}
              </span>
              <span className="text-xs text-gray-400 leading-tight truncate max-w-[120px]">
                {currentUser?.email}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Conectado como</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.email}</p>
              </div>
              <div className="p-1">
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
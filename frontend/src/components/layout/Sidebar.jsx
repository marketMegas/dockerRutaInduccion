import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Route, BookOpenCheck,
  MessagesSquare, FolderKanban, ClipboardCheck, Headphones, X, LogOut, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourseStore } from '../../store/useCourseStore';
import logoMegas from '../../assets/logo-megas.png';

export const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { courses, isLoading, fetchCourses } = useCourseStore();

  useEffect(() => {
    if (courses.length === 0 && !isLoading) {
      fetchCourses(currentUser?.uid);
    }
  }, [courses.length, isLoading, currentUser, fetchCourses]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: Route, text: 'Ruta de Inducción' },
    { path: '/cursos', icon: BookOpenCheck, text: 'Mis cursos' },
    { path: '/foros', icon: MessagesSquare, text: 'Foros' },
    { path: '/recursos', icon: FolderKanban, text: 'Recursos' },
    { path: '/calificaciones', icon: ClipboardCheck, text: 'Calificaciones' }
  ];

  // Helper para verificar ruta activa (incluyendo sub-rutas de cursos)
  const isRouteActive = (path) => {
    if (path === '/cursos' && location.pathname.startsWith('/curso')) return true;
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const activeCourse = courses.find((c) => c.progress > 0 && c.progress < 100)
    || courses.find((c) => c.progress === 0)
    || null;
  const progress = activeCourse?.progress ?? 0;

  return (
    <>
      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#5fbd44]/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`w-[260px] h-screen bg-[#f4faf0] text-gray-600 border-r border-[#5fbd44]/15 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:flex`}
      >
        {/* Logo y Botón Cerrar */}
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-[#5fbd44]/15 bg-white/60">
          <img
            src={logoMegas}
            alt="Megas Logo"
            className="h-14 w-full object-contain"
          />
          {/* Botón Cerrar (solo visible en móvil) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-[#3a8f2c] hover:bg-[#5fbd44]/10 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-widest text-[#5fbd44]">
            Menú
          </p>
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.path);

              return (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm ${isActive
                      ? 'bg-[#5fbd44] text-white shadow-sm shadow-[#5fbd44]/30'
                      : 'text-gray-500 hover:bg-white hover:text-gray-900'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#3a8f2c]" />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#5fbd44]'}`} />
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Widget: Tu progreso */}
          <div className="mt-8 mx-1 bg-white p-4 rounded-2xl border border-[#5fbd44]/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-[#f6811e]" />
                <span className="font-semibold text-sm text-gray-800">Tu progreso</span>
              </div>
              {activeCourse && (
                <span className="text-sm font-black text-[#5fbd44]" translate="no">{progress}%</span>
              )}
            </div>

            {isLoading && !activeCourse && (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                <div className="h-2 bg-gray-100 rounded-full"></div>
              </div>
            )}

            {!isLoading && !activeCourse && (
              <>
                <p className="text-xs text-gray-500 mb-3 font-medium">
                  Aún no tienes cursos. ¡Empieza tu inducción!
                </p>
                <button
                  onClick={() => handleNavigation('/cursos')}
                  className="w-full flex items-center justify-center gap-2 bg-[#5fbd44] text-white text-sm font-bold px-3 py-2.5 rounded-xl hover:bg-[#3a8f2c] transition-colors"
                >
                  Ver cursos
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {activeCourse && (
              <>
                <p className="text-xs text-gray-600 font-semibold h-8 overflow-hidden leading-relaxed mb-3">
                  {activeCourse.title}
                </p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-[#5fbd44] shadow-sm shadow-[#5fbd44]/40 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => handleNavigation(`/curso/${activeCourse.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-[#5fbd44] text-white text-sm font-bold px-3 py-2.5 rounded-xl hover:bg-[#3a8f2c] transition-colors"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Footer / Centro de ayuda + Logout */}
        <div className="p-3 border-t border-[#5fbd44]/15 space-y-1 bg-white/40">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-colors text-sm font-medium">
            <Headphones className="w-5 h-5 text-[#5fbd44]" />
            Centro de ayuda
          </button>
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};
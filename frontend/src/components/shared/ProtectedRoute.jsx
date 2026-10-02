import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/**
 * Protects routes that require authentication.
 * - If loading: shows spinner
 * - If not authenticated in Firebase: redirects to /login
 * - If the Django check is still in flight: shows spinner
 * - If authenticated but not on the Django allowlist: shows the restricted
 *   screen. NOT a redirect: /cursos would bounce it back and forth, and the
 *   student has a real account, just not the one this platform serves.
 * - If both: renders the child route (Outlet)
 *
 * El orden de estas cuatro comprobaciones es el que evita el destello. Con
 * `verificando` DESPUES del `!autorizado`, el primer render con sesion abierta
 * caia en la pantalla de acceso restringido durante el tiempo que tarda la
 * llamada a /api/auth/verificar/, y el alumno legitimo veia un cartel de "no
 * estas habilitado" antes de entrar.
 */
export const ProtectedRoute = () => {
  const { currentUser, loading, autorizado, verificando, motivoBloqueo } = useAuth();

  if (loading || verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <LoadingSpinner text={loading ? 'Verificando sesión...' : 'Comprobando tu acceso...'} />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!autorizado) {
    return <AccesoRestringido mensaje={motivoBloqueo} />;
  }

  return <Outlet />;
};

/**
 * Lo que ve el alumno que si puede loguearse en Firebase pero no esta dado de
 * alta en Django. El boton de salir sesion es indispensable: sin el queda
 * trabado en esta pantalla sin poder hacer nada.
 *
 * El mensaje lo arma el backend (usuarios.permisos.MENSAJE_SIN_ALTA) y llega
 * por `motivoBloqueo`, para que el texto que ve el estudiante sea el mismo
 * que el que verian los registros del server y no dos versiones que se van
 * desincronizando.
 */
const AccesoRestringido = ({ mensaje }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-2">Acceso no habilitado</h1>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {mensaje || 'Tu correo no esta habilitado para la Ruta de Induccion.'}
        </p>

        {currentUser?.email && (
          <p className="text-xs text-gray-400 mb-6 break-all">
            Sesion iniciada como <span className="font-medium text-gray-500">{currentUser.email}</span>
          </p>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

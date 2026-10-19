import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/**
 * Guard para rutas de gestion (solo staff). Va DESPUES de ProtectedRoute,
 * que ya resolvio sesion de Firebase y alta en Django: aca solo falta el
 * interruptor de staff.
 *
 * El alumno sin staff no ve una pantalla de error sino que se lo manda al
 * dashboard. Es a proposito: no es un caso invalido, es simplemente un menu
 * que no le corresponde, y la proteccion de verdad la pone el backend
 * (requiere_staff devuelve 403 en cada llamada). Esto es solo para no
 * mostrarle una pantalla que no puede usar.
 *
 * Mientras `verificando` sigue en true (la consulta a /api/auth/verificar/
 * va en vuelo) se muestra el spinner y NO se redirige: sin eso, entrar
 * directo a /evaluaciones con la sesion recien abierta rebotaria al
 * dashboard durante ese segundo, aunque despues si sea staff.
 */
export const RequireStaff = () => {
  const { loading, verificando, esStaff } = useAuth();

  if (loading || verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <LoadingSpinner text="Verificando tu acceso..." />
      </div>
    );
  }

  if (!esStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/**
 * Rutas que piden sesion de Firebase pero NO alta en Django: el foro y los
 * recursos.
 *
 * Es un guard aparte de `ProtectedRoute` a proposito, y no una variante con una
 * bandera. El alta en Django se decidio solo para el curso: cerrar el foro
 * tambien habria cerrado el lugar donde un alumno sin alta le pregunta a un
 * companero como hacer el primer ejercicio, que es justamente cuando mas lo
 * necesita. Ademas las APIs del foro nunca se cerraron (`/api/foro/...` no lleva
 * `@requiere_estudiante`), asi que dejar la UI exigiendo el alta ponia una
 * puerta que el backend no tiene: el alumno sin alta veia "acceso no
 * habilitado" sin ningun boton para seguir.
 *
 * Lo unico que se comprueba aca es que haya sesion, que es lo que ya pedia esta
 * parte de la app antes de que existiera la lista blanca.
 */
export const AuthenticatedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <LoadingSpinner text="Verificando sesión..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
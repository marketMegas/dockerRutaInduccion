import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CursosPage } from './pages/CursosPage';
import { CursoDetailPage } from './pages/CursoDetailPage';
import { CursoLeccionPage } from './pages/CursoLeccionPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForosPage } from './pages/ForosPage';
import { RecursosPage } from './pages/RecursosPage';
import { CalificacionesPage } from './pages/CalificacionesPage';

function App() {
  return (
    <BrowserRouter basename="/rutainduccion">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Redirigir la raíz a /cursos */}
        <Route path="/" element={<Navigate to="/cursos" replace />} />

        {/* Rutas protegidas: requieren autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/curso/:id" element={<CursoDetailPage />} />
            <Route path="/curso/:id/leccion/:leccionId" element={<CursoLeccionPage />} />
            <Route path="/foros" element={<ForosPage />} />
            <Route path="/recursos" element={<RecursosPage />} />
            <Route path="/calificaciones" element={<CalificacionesPage />} />

            {/* Fallback para rutas no definidas dentro del dashboard */}
            <Route path="*" element={
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-gray-400 text-lg border-2 border-dashed border-gray-200 p-8 rounded-xl text-center">
                  <span className="font-bold text-gray-700 block mb-2">Página en construcción</span>
                  Módulo no disponible actualmente.
                </p>
              </div>
            } />

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

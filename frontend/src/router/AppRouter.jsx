import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// =============================================================
// Lazy Loading de rutas (Optimización de rendimiento - RNF)
// Cada módulo se carga bajo demanda, reduciendo el bundle inicial.
// =============================================================
const LandingPage = lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const ContactPage = lazy(() => import('../pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const CoordinadorDashboard = lazy(() => import('../pages/coordinador/CoordinadorDashboard').then(m => ({ default: m.CoordinadorDashboard })));
const LiderDashboard = lazy(() => import('../pages/lider/LiderDashboard').then(m => ({ default: m.LiderDashboard })));
const DesarrolladorDashboard = lazy(() => import('../pages/desarrollador/DesarrolladorDashboard').then(m => ({ default: m.DesarrolladorDashboard })));

/**
 * Spinner de carga global mientras se descarga el chunk del módulo solicitado.
 */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-text-muted text-sm font-medium tracking-wide">Cargando módulo...</span>
    </div>
  </div>
);

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Módulo Público (Interesados) */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/contacto" element={<ContactPage />} />

                {/* Autenticación */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas Privadas Protegidas por Rol (RBAC) */}
                <Route element={<ProtectedRoute allowedRoles={['COORDINADOR']} />}>
                  <Route path="/coordinador" element={<CoordinadorDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['COORDINADOR', 'LIDER']} />}>
                  <Route path="/lider" element={<LiderDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['COORDINADOR', 'LIDER', 'DESARROLLADOR']} />}>
                  <Route path="/desarrollador" element={<DesarrolladorDashboard />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

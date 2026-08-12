import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicLayout } from '../components/layout/PublicLayout';

// Lazy Loading de rutas
const LandingPage = lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const ContactPage = lazy(() => import('../pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('../pages/public/FaqPage').then(m => ({ default: m.FaqPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const CoordinadorDashboard = lazy(() => import('../pages/coordinador/CoordinadorDashboard').then(m => ({ default: m.CoordinadorDashboard })));
const LiderDashboard = lazy(() => import('../pages/lider/LiderDashboard').then(m => ({ default: m.LiderDashboard })));
const DesarrolladorDashboard = lazy(() => import('../pages/desarrollador/DesarrolladorDashboard').then(m => ({ default: m.DesarrolladorDashboard })));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[65vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white rounded-full animate-spin shadow-sm" />
      <span className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Cargando módulo...</span>
    </div>
  </div>
);

export const AppRouter = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Módulo Público (con Navbar & Footer corporativo) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/faqs" element={<FaqPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Rutas Privadas Protegidas por Rol (RBAC con DashboardLayout) */}
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
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};



import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicLayout } from '../components/layout/PublicLayout';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PrimerLoginModal } from '../components/auth/PrimerLoginModal';
import { ROUTES } from '../config/routes';
import { Cpu } from 'lucide-react';

// Lazy Loading y Code-Splitting de rutas
const LandingPage = lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const ContactPage = lazy(() => import('../pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('../pages/public/FaqPage').then(m => ({ default: m.FaqPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const CoordinadorDashboard = lazy(() => import('../pages/coordinador/CoordinadorDashboard').then(m => ({ default: m.CoordinadorDashboard })));
const LiderDashboard = lazy(() => import('../pages/lider/LiderDashboard').then(m => ({ default: m.LiderDashboard })));
const DesarrolladorDashboard = lazy(() => import('../pages/desarrollador/DesarrolladorDashboard').then(m => ({ default: m.DesarrolladorDashboard })));

/**
 * Loader elegante para transiciones de Suspense con Shimmer Bar
 */
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-sm relative overflow-hidden">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg animate-bounce">
        <Cpu className="text-blue-600 dark:text-blue-400 animate-spin" size={24} />
      </div>
      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">Cargando Módulo...</p>
    </div>
  </div>
);

export const AppRouter = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PrimerLoginModal />
        <ErrorBoundary>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Módulo Público (con Navbar & Footer corporativo) */}
                <Route element={<PublicLayout />}>
                  <Route path={ROUTES.PUBLIC_HOME} element={<LandingPage />} />
                  <Route path={ROUTES.PUBLIC_CONTACT} element={<ContactPage />} />
                  <Route path={ROUTES.PUBLIC_FAQS} element={<FaqPage />} />
                  <Route path={ROUTES.PUBLIC_LOGIN} element={<LoginPage />} />
                </Route>

                {/* Rutas Privadas Protegidas por Rol (RBAC con DashboardLayout) */}
                <Route element={<ProtectedRoute allowedRoles={['COORDINADOR']} />}>
                  {/* Ruta Encriptada/Ofuscada principal */}
                  <Route path={ROUTES.COORDINADOR} element={
                    <ErrorBoundary title="Error en Panel de Coordinador">
                      <CoordinadorDashboard />
                    </ErrorBoundary>
                  } />
                  {/* Alias de compatibilidad previa con auto-redireccion a la URL protegida */}
                  <Route path={ROUTES.LEGACY_COORDINADOR} element={<Navigate to={ROUTES.COORDINADOR} replace />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['LIDER']} />}>
                  <Route path="/lider" element={
                    <ErrorBoundary title="Error en Panel de Líder">
                      <LiderDashboard />
                    </ErrorBoundary>
                  } />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['DESARROLLADOR']} />}>
                  <Route path="/desarrollador" element={
                    <ErrorBoundary title="Error en Panel de Desarrollador">
                      <DesarrolladorDashboard />
                    </ErrorBoundary>
                  } />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
};

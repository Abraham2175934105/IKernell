import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicLayout } from '../components/layout/PublicLayout';
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
    {/* Barra de progreso superior con animación shimmer */}
    <div className="fixed top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden z-50">
      <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-pulse shimmer-effect" />
    </div>

    {/* Tarjeta de carga Glassmorphic */}
    <div className="p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-blue-500/10 flex flex-col items-center gap-4 text-center max-w-xs mx-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
          <Cpu size={28} className="animate-pulse" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-blue-500/30 border-t-blue-600 animate-spin" />
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
          IKernell Soluciones
        </h4>
        <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">
          Cargando entorno seguro...
        </p>
      </div>
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

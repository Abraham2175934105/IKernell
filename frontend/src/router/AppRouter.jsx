import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LandingPage } from '../pages/public/LandingPage';
import { ContactPage } from '../pages/public/ContactPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { CoordinadorDashboard } from '../pages/coordinador/CoordinadorDashboard';
import { LiderDashboard } from '../pages/lider/LiderDashboard';
import { DesarrolladorDashboard } from '../pages/desarrollador/DesarrolladorDashboard';

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
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
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

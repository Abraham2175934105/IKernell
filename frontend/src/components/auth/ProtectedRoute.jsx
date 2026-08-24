import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // Prevención de Back-Button Bypass: previene recuperar vistas privadas desde la caché del historial
  useEffect(() => {
    if (!isAuthenticated || !user) {
      window.history.pushState(null, '', window.location.href);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user.rol || !allowedRoles.includes(user.rol))) {
    // Redirección segura basada en el rol existente sin caídas
    if (user.rol === 'COORDINADOR') return <Navigate to="/coordinador" replace />;
    if (user.rol === 'LIDER') return <Navigate to="/lider" replace />;
    return <Navigate to="/desarrollador" replace />;
  }

  return <Outlet />;
};

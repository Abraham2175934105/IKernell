import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Prevención de Back-Button Bypass: previene recuperar vistas privadas desde la caché del historial
  useEffect(() => {
    const handlePopState = () => {
      if (!isAuthenticated || !user) {
        window.history.pushState(null, '', ROUTES.PUBLIC_LOGIN);
      }
    };

    if (!isAuthenticated || !user) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, user, location.pathname]);

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.PUBLIC_LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles && (!user.rol || !allowedRoles.includes(user.rol))) {
    // Redirección segura basada en el rol existente sin caídas
    if (user.rol === 'COORDINADOR') return <Navigate to={ROUTES.COORDINADOR} replace />;
    if (user.rol === 'LIDER') return <Navigate to={ROUTES.LIDER} replace />;
    return <Navigate to={ROUTES.DESARROLLADOR} replace />;
  }

  return <Outlet />;
};

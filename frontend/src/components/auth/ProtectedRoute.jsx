import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    // Si no tiene los privilegios adecuados, lo redirigimos al dashboard correspondiente a su rol
    if (user?.rol === 'COORDINADOR') return <Navigate to="/coordinador" replace />;
    if (user?.rol === 'LIDER') return <Navigate to="/lider" replace />;
    return <Navigate to="/desarrollador" replace />;
  }

  return <Outlet />;
};

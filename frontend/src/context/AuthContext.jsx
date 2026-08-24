import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

// Proveedor de contexto global para la sesión de usuario y tokens JWT con Hardening Enterprise
export const AuthProvider = ({ children }) => {
  // Inicializamos el estado del usuario leyendo desde localStorage con parsing seguro
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  // Token JWT para autorizar peticiones HTTP hacia el backend
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // Guarda las credenciales y el token tanto en memoria como en almacenamiento local
  const login = useCallback((authData) => {
    if (!authData || !authData.token) return;
    setUser(authData);
    setToken(authData.token);
    try {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
    } catch (e) {
      console.error('[IKernell Auth] Error al persistir credenciales:', e);
    }
  }, []);

  // Limpia la sesión activa y remueve todos los datos almacenados en el navegador (Hardening Anti-Bypass)
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('[IKernell Auth] Error al limpiar almacenamiento:', e);
    }
  }, []);

  // Listener reactivo para invalidación cross-tab y destrucción instantánea de sesión
  useEffect(() => {
    const handleStorageChange = (e) => {
      if ((e.key === 'token' || e.key === 'user' || e.key === null) && (!e.newValue || e.key === null)) {
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de acceso rápido al contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

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

  // Limpia la sesión activa y remueve credenciales (Hardening Anti-Bypass y Revocación JWT)
  const logout = useCallback(async () => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      try {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {});
      } catch (e) {
        console.warn('[IKernell Auth] Advertencia al contactar endpoint de logout:', e);
      }
    }

    // Preservar preferencias del usuario (tema, confirmación de logout, estado barra)
    const theme = localStorage.getItem('theme');
    const skipLogoutConfirm = localStorage.getItem('ikernell_skip_logout_confirm');
    const sidebarCollapsed = localStorage.getItem('sidebar_collapsed');

    setUser(null);
    setToken(null);
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
      if (skipLogoutConfirm) localStorage.setItem('ikernell_skip_logout_confirm', skipLogoutConfirm);
      if (sidebarCollapsed) localStorage.setItem('sidebar_collapsed', sidebarCollapsed);
    } catch (e) {
      console.error('[IKernell Auth] Error al limpiar almacenamiento:', e);
    }
  }, [token]);

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

  // Modo de Rol Activo para usuarios Líderes (LÍDER vs DESARROLLADOR HÍBRIDO)
  const [activeRoleMode, setActiveRoleMode] = useState(() => {
    return localStorage.getItem('active_role_mode') || 'LIDER';
  });

  const switchRoleMode = useCallback((mode) => {
    setActiveRoleMode(mode);
    try {
      localStorage.setItem('active_role_mode', mode);
    } catch (e) {
      console.error('[IKernell Auth] Error al guardar active_role_mode:', e);
    }
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, activeRoleMode, switchRoleMode, login, logout }}>
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

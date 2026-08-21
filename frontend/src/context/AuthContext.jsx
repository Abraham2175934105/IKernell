import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Proveedor de contexto global para la sesión de usuario y tokens JWT
export const AuthProvider = ({ children }) => {
  // Inicializamos el estado del usuario leyendo desde localStorage con parsing seguro
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  // Token JWT para autorizar peticiones HTTP hacia el backend
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // Guarda las credenciales y el token tanto en memoria como en almacenamiento local
  const login = (authData) => {
    setUser(authData);
    setToken(authData.token);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
  };

  // Limpia la sesión activa y remueve todos los datos almacenados en el navegador
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const isAuthenticated = !!token;

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


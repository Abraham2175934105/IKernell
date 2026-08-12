import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Proveedor de contexto global para la apariencia visual (Modo Claro / Modo Oscuro)
export const ThemeProvider = ({ children }) => {
  // Recupera la preferencia previa del usuario o define 'light' como predeterminado
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ikernell_theme');
    if (saved) return saved;
    return 'light';
  });

  // Aplica o remueve la clase 'dark' en el elemento raíz <html> para activar las variables CSS
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Guardamos la elección en localStorage para mantenerla en futuras visitas
    localStorage.setItem('ikernell_theme', theme);
  }, [theme]);

  // Alterna entre tema claro y oscuro
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para consultar y modificar el tema desde cualquier componente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

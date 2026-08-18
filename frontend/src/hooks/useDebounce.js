import { useState, useEffect } from 'react';

/**
 * Hook personalizado para control de tráfico y debouncing en entradas de búsqueda y filtros reactivos.
 * Evita sobrecarga de peticiones y renderizados innecesarios durante la escritura rápida (RNF-05).
 * 
 * @param {any} value - Valor reactivo de entrada
 * @param {number} delay - Tiempo de espera en milisegundos (por defecto 300ms)
 * @returns {any} debouncedValue - Valor estabilizado
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

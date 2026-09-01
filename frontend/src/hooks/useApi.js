import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useMemo } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

// Hook personalizado para realizar llamadas HTTP seguras al backend
export const useApi = () => {
  const { token, logout } = useAuth();

  const api = useMemo(() => {
    // Instancia base de Axios configurada hacia el servidor Spring Boot
    const axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor de salida: inyecta el Bearer Token JWT en el encabezado Authorization
    axiosInstance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // Interceptor de respuesta: desenvuelve el payload y detecta expiración de credenciales
    axiosInstance.interceptors.response.use(
      (response) => {
        // Retornamos directamente el cuerpo de datos para simplificar su consumo en los componentes
        return response.data;
      },
      (error) => {
        // Si el token expiró o es inválido (401), cerramos la sesión automáticamente
        // NOTA: 403 (Forbidden) es una restricción de permisos en un recurso y no debe destruir la sesión del usuario
        if (error.response && error.response.status === 401) {
          logout();
        }
        
        // Extraemos el mensaje descriptivo enviado por el backend o el error general de red
        let errorMessage = 'Error en la comunicación con el servidor.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return Promise.reject(new Error(errorMessage));
      }
    );

    // Exponemos los verbos HTTP estándar manteniendo una API limpia y reutilizable
    return {
      get: (endpoint, config = {}) => axiosInstance.get(endpoint, config),
      post: (endpoint, data, config = {}) => axiosInstance.post(endpoint, data, config),
      put: (endpoint, data, config = {}) => axiosInstance.put(endpoint, data, config),
      patch: (endpoint, data, config = {}) => axiosInstance.patch(endpoint, data, config),
      delete: (endpoint, config = {}) => axiosInstance.delete(endpoint, config)
    };
  }, [token, logout]);

  return api;
};

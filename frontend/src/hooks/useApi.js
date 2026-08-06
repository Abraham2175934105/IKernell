import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useMemo } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export const useApi = () => {
  const { token, logout } = useAuth();

  const api = useMemo(() => {
    // 1. Instancia global de Axios
    const axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 2. Interceptor de Solicitud (Request): Adjunta el token JWT
    axiosInstance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // 3. Interceptor de Respuesta (Response): Maneja expiración de sesión (401/403)
    axiosInstance.interceptors.response.use(
      (response) => {
        // Extrae directamente el payload JSON (data) para mantener compatibilidad con los componentes
        return response.data;
      },
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
        
        // Formatear error usando el ApiErrorResponse del backend
        let errorMessage = 'Error HTTP inesperado en la comunicación con el servidor.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return Promise.reject(new Error(errorMessage));
      }
    );

    // Mapeo de métodos HTTP para mantener la firma del hook original
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

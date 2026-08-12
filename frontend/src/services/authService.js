import axios from 'axios';

const API_AUTH_URL = 'http://localhost:8080/api/auth';

/**
 * Servicio centralizado de autenticación para IKernell.
 * Ejecuta la llamada HTTP al backend y transforma los errores en mensajes descriptivos de UX.
 */
export const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_AUTH_URL}/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un código de estado de error (400, 401, 403, 500, etc.)
        const backendMessage = error.response.data?.message;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
        if (error.response.status === 401) {
          throw new Error('Credenciales incorrectas. Verifique su correo y contraseña.');
        }
        if (error.response.status === 403) {
          throw new Error('Acceso denegado. Su cuenta no tiene permisos o se encuentra inhabilitada.');
        }
        throw new Error(`Error en el servidor al autenticar (Código HTTP ${error.response.status}).`);
      } else if (error.request) {
        // La petición se envió pero no se recibió respuesta (Servidor apagado o error de red)
        throw new Error('Error de conexión con el servidor. Verifique que el Backend (puerto 8080) esté activo.');
      } else {
        throw new Error(error.message || 'Error inesperado al intentar iniciar sesión.');
      }
    }
  }
};

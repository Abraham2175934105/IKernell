import axios from 'axios';

const API_AUTH_URL = 'http://localhost:8080/api/auth';

// Servicio cliente para inicio de sesión y gestión de credenciales públicas
export const authService = {
  // Envía las credenciales al endpoint de login y maneja posibles fallos de conexión o autenticación
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_AUTH_URL}/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Limite de 10 segundos para evitar esperas infinitas ante caídas del servidor
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // El backend respondió con un código de error controlado
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
        // Fallo de red o servidor backend apagado
        throw new Error('No fue posible conectar con el servidor. Verifique que el servicio backend esté activo en el puerto 8080.');
      } else {
        throw new Error(error.message || 'Error inesperado al intentar iniciar sesión.');
      }
    }
  }
};

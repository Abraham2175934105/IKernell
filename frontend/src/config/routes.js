/**
 * Configuración centralizada de rutas frontend.
 * Las rutas privadas utilizan tokens ofuscados/encriptados para prevenir inspección simple de URLs en el navegador.
 */
export const ROUTES = {
  PUBLIC_HOME: '/',
  PUBLIC_CONTACT: '/contacto',
  PUBLIC_FAQS: '/faqs',
  PUBLIC_LOGIN: '/login',

  // Rutas privadas ofuscadas/encriptadas (RF-Security)
  COORDINADOR: '/panel/sec-coordinador-c8f2a9',
  LIDER: '/lider',
  DESARROLLADOR: '/desarrollador',
  PERFIL: '/dashboard/perfil',
  PERFIL_SHORT: '/perfil',

  // Alias legibles de compatibilidad previa con redirección automática
  LEGACY_COORDINADOR: '/coordinador',
};

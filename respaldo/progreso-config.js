/* Configuración del respaldo del avance (skill «cedia-respaldo-avance»).
 * Estos valores son públicos por naturaleza: la URL de la aplicación web de Apps Script viaja con la página.
 * El token NO es una contraseña: solo filtra envíos basura. Nunca escriba aquí el ID de la hoja ni datos personales. */
window.PROGRESO_CONFIG = {
  app: 'caries',                                                          // identificador corto, en minúsculas
  endpoint: 'https://script.google.com/macros/s/AKfycbwqIaxQ3KV7wjZ-_-d0-MovT-2NVg9KE6Qt1bKoPjfTgjJYLnB-YFKfaYbaPzIuxnE/exec',   // URL de «Implementar › Aplicación web»
  token: 'KzQFGLcaQrrRh2ys',                                           // igual a CONFIG_SERVIDOR.TOKEN en Codigo.gs
  version: '4.1.0',                                                       // versión de su herramienta (aparece en la hoja)
  lang: 'es'                                                              // 'es' o 'en' por defecto
};

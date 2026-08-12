// ============================================================
// Configuración del board (SIN datos del negocio: esto es la careta).
//
// APPS_SCRIPT_URL es la puerta del backend. Es pública por necesidad
// (el navegador tiene que poder llamarla) y NO es un secreto: sin un
// código de acceso válido no entrega ni un dato. Ver README.
// ============================================================

// Se pega aquí la URL /exec al implementar el Apps Script (Fase 0, paso de Chrome).
export const APPS_SCRIPT_URL = 'PEGA_AQUI_LA_URL_EXEC'

// Auto-refresh, como yod-obra: cada 10 minutos.
export const REFRESH_MS = 10 * 60 * 1000

// Timeout de cada llamada al servidor (Apps Script en frío tarda 3-8 s).
export const TIMEOUT_MS = 25 * 1000

// Expiración de la sesión local (el servidor revalida en cada arranque igual).
export const SESION_DIAS = 30

// Llaves de almacenamiento local (una sesión, una caché de datos).
export const LLAVE_SESION = 'amalaya_sesion'
export const LLAVE_DATOS = 'amalaya_datos'

// Base del sitio en Pages (para cargar data.json y fuentes).
export const BASE = '/amalaya-board/'

export const BACKEND_LISTO = APPS_SCRIPT_URL && !APPS_SCRIPT_URL.startsWith('PEGA_AQUI')

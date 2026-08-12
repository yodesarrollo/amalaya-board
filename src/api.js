// ============================================================
// api.js — la única puerta del frontend hacia el servidor.
//
// Reglas (verificadas contra los boards anteriores):
// - POST con Content-Type text/plain: Apps Script no soporta el
//   preflight CORS; text/plain lo evita.
// - Timeout de 25 s con AbortController: el arranque en frío de
//   Apps Script tarda 3-8 s y sin timeout el botón queda colgado.
// - Si la respuesta no es JSON y parece HTML, el despliegue quedó
//   mal configurado (pide cuenta de Google): se explica en español.
// - Reintento automático ÚNICO y solo en acciones idempotentes
//   (ping, login, getAll, guardar por parche). Las acciones que
//   CREAN cosas nunca se reintentan solas: el servidor pudo haber
//   terminado aunque el cliente haya abortado, y reintentar
//   duplicaría filas o archivos.
// ============================================================

import { APPS_SCRIPT_URL, BACKEND_LISTO, TIMEOUT_MS, BASE } from './config.js'

const IDEMPOTENTES = new Set(['ping', 'login', 'getAll', 'guardar'])

async function llamada(action, payload) {
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...payload }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      signal: controlador.signal,
    })
    const texto = await res.text()
    let data
    try {
      data = JSON.parse(texto)
    } catch {
      if (texto.toLowerCase().includes('<html')) {
        throw new Error(
          'El servidor está pidiendo inicio de sesión de Google. ' +
            'El despliegue del Apps Script debe quedar con Acceso: "Cualquier usuario". ' +
            'Avísale a Alejandro para corregirlo.'
        )
      }
      throw new Error('El servidor respondió algo inesperado. Si se re-desplegó el Apps Script, hay que actualizar la URL.')
    }
    if (!data || data.ok !== true) {
      throw new Error((data && data.error) || 'Ocurrió un error en el servidor.')
    }
    return data
  } finally {
    clearTimeout(temporizador)
  }
}

export async function apiCall(action, payload = {}) {
  if (!BACKEND_LISTO) {
    throw new Error('Falta conectar el backend: hay que pegar la URL del Apps Script en src/config.js.')
  }
  try {
    return await llamada(action, payload)
  } catch (e) {
    const esTimeout = e.name === 'AbortError'
    const esRed = e instanceof TypeError
    if ((esTimeout || esRed) && IDEMPOTENTES.has(action)) {
      // Un solo reintento tras 2 s: cubre el arranque en frío.
      await new Promise((r) => setTimeout(r, 2000))
      try {
        return await llamada(action, payload)
      } catch (e2) {
        throw traducirErrorRed(e2)
      }
    }
    throw traducirErrorRed(e)
  }
}

function traducirErrorRed(e) {
  if (e.name === 'AbortError') {
    return new Error('El servidor tardó demasiado en responder. Vuelve a intentar.')
  }
  if (e instanceof TypeError) {
    return new Error('Sin conexión con el servidor. Revisa tu internet.')
  }
  return e
}

// --- Modo demostración --------------------------------------
// Carga la maqueta pública (public/data.json). Son datos 100%
// inventados con la bandera demo: true; el board los marca en
// pantalla. Nunca contiene datos reales ni la pestaña Usuarios.
export async function cargarDemo() {
  const res = await fetch(`${BASE}data.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudo cargar la demostración.')
  const j = await res.json()
  if (j.demo !== true) throw new Error('La maqueta de demostración no es válida.')
  return j
}

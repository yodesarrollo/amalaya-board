// ============================================================
// datos.jsx — el estado global del board (DatosProvider).
//
// Qué garantiza:
// - Sesión fail-closed: al arrancar se revalida el código contra
//   el servidor ANTES de pintar números; si el código fue dado de
//   baja, se borra sesión Y caché y se vuelve a la pantalla de
//   acceso. La caché solo se muestra marcada como "copia local".
// - Escritura optimista con parches: lo que mueves se ve al
//   instante, se agrupa por fila (debounce) y se manda al servidor
//   como PARCHE {tab, key, patch}; el auto-refresh no pisa lo que
//   acabas de tocar (ventana de protección).
// - localStorage siempre entre try/catch (Safari en privado truena)
//   y jamás se guardan imágenes en la caché, solo datos.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { apiCall, cargarDemo } from './api.js'
import { REFRESH_MS, SESION_DIAS, LLAVE_SESION, LLAVE_DATOS } from './config.js'

const Ctx = createContext(null)
export const usarDatos = () => useContext(Ctx)

// --- almacenamiento con guardas -----------------------------
function leerLocal(llave) {
  try {
    const v = localStorage.getItem(llave)
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}
function guardarLocal(llave, valor) {
  try {
    localStorage.setItem(llave, JSON.stringify(valor))
  } catch {
    /* cuota llena o modo privado: seguimos solo en memoria */
  }
}
function borrarLocal(llave) {
  try {
    localStorage.removeItem(llave)
  } catch { /* nada */ }
}

const DEBOUNCE_MS = 900        // agrupar movimientos de un mismo control
const PROTECCION_MS = 15000    // el refresh no pisa lo tocado hace <15 s

export function DatosProvider({ children }) {
  // sesion: { codigo, rol, nombre, ts } | null
  const [sesion, setSesion] = useState(null)
  const [arrancando, setArrancando] = useState(true)
  const [datos, setDatos] = useState(null)          // { Config: [...], Espacios: [...], ... }
  const [version, setVersion] = useState(null)       // contador de versión del servidor
  const [modo, setModo] = useState('vivo')           // 'vivo' | 'copia' | 'demo'
  const [sincronizando, setSincronizando] = useState(false)
  const [errorSync, setErrorSync] = useState(null)
  const [ultimaSync, setUltimaSync] = useState(null)
  const [guardados, setGuardados] = useState({})     // { [tab:key]: 'guardando'|'ok'|'error' }

  const parchesPendientes = useRef({})   // { 'tab|key': {campo: valor} }
  const temporizadores = useRef({})
  const tocadoReciente = useRef({})      // { 'tab|key': timestamp }
  const sesionRef = useRef(null)
  useEffect(() => { sesionRef.current = sesion }, [sesion])
  const versionRef = useRef(null)
  useEffect(() => { versionRef.current = version }, [version])

  // --- cargar del servidor ----------------------------------
  const cargar = useCallback(async (codigo, { silencioso = false } = {}) => {
    if (!silencioso) setSincronizando(true)
    setErrorSync(null)
    try {
      const r = await apiCall('getAll', { codigo, v: versionRef.current })
      if (r.sinCambios) {
        setUltimaSync(new Date())
        return true
      }
      const ahora = Date.now()
      setDatos((previos) => {
        const entrantes = r.datos || {}
        if (!previos) return entrantes
        // Ventana de protección: si una fila se tocó hace poco,
        // conservamos la versión local para no pisar el dedo del usuario.
        const fusion = {}
        for (const tab of Object.keys(entrantes)) {
          fusion[tab] = (entrantes[tab] || []).map((fila) => {
            const llave = `${tab}|${fila.id ?? fila.clave}`
            const t = tocadoReciente.current[llave]
            if (t && ahora - t < PROTECCION_MS) {
              const local = (previos[tab] || []).find(
                (x) => (x.id ?? x.clave) === (fila.id ?? fila.clave)
              )
              return local || fila
            }
            return fila
          })
        }
        return fusion
      })
      setVersion(r.v ?? null)
      setModo('vivo')
      setUltimaSync(new Date())
      guardarLocal(LLAVE_DATOS, { datos: r.datos, v: r.v ?? null, ts: Date.now() })
      return true
    } catch (e) {
      setErrorSync(e.message)
      return false
    } finally {
      if (!silencioso) setSincronizando(false)
    }
  }, [])

  // --- arranque: revalidar sesión guardada ------------------
  useEffect(() => {
    let cancelado = false
    async function arrancar() {
      const s = leerLocal(LLAVE_SESION)
      const vencida = s && Date.now() - (s.ts || 0) > SESION_DIAS * 24 * 3600 * 1000
      if (!s || !s.codigo || vencida) {
        borrarLocal(LLAVE_SESION)
        if (!cancelado) setArrancando(false)
        return
      }
      // Mostrar la copia local mientras el servidor confirma.
      const cache = leerLocal(LLAVE_DATOS)
      if (cache && cache.datos && !cancelado) {
        setDatos(cache.datos)
        setVersion(cache.v ?? null)
        setModo('copia')
        setSesion(s)
      }
      try {
        const r = await apiCall('login', { codigo: s.codigo })
        if (cancelado) return
        const nueva = { codigo: s.codigo, rol: r.rol, nombre: r.nombre, ts: s.ts }
        setSesion(nueva)
        guardarLocal(LLAVE_SESION, nueva)
        await cargar(s.codigo, { silencioso: true })
      } catch (e) {
        if (cancelado) return
        if (/código|codigo|autoriza|válido|valido/i.test(e.message)) {
          // El servidor rechazó el código: fail-closed también aquí.
          borrarLocal(LLAVE_SESION)
          borrarLocal(LLAVE_DATOS)
          setSesion(null)
          setDatos(null)
        } else {
          // Sin red: la copia local queda marcada como tal.
          setErrorSync(e.message)
        }
      } finally {
        if (!cancelado) setArrancando(false)
      }
    }
    arrancar()
    return () => { cancelado = true }
  }, [cargar])

  // --- auto-refresh cada 10 minutos -------------------------
  useEffect(() => {
    if (!sesion || modo === 'demo') return
    const id = setInterval(() => {
      const hayPendientes = Object.values(parchesPendientes.current).some(
        (p) => Object.keys(p).length > 0
      )
      if (!hayPendientes) cargar(sesion.codigo, { silencioso: true })
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [sesion, modo, cargar])

  // --- acciones ---------------------------------------------
  const entrar = useCallback(async (codigo) => {
    const r = await apiCall('login', { codigo })
    const s = { codigo, rol: r.rol, nombre: r.nombre, ts: Date.now() }
    setSesion(s)
    guardarLocal(LLAVE_SESION, s)
    setModo('vivo')
    await cargar(codigo)
    return s
  }, [cargar])

  const salir = useCallback(() => {
    borrarLocal(LLAVE_SESION)
    borrarLocal(LLAVE_DATOS)
    setSesion(null)
    setDatos(null)
    setVersion(null)
    setModo('vivo')
    parchesPendientes.current = {}
    tocadoReciente.current = {}
  }, [])

  const actualizar = useCallback(() => {
    if (sesionRef.current && modo !== 'demo') return cargar(sesionRef.current.codigo)
    return Promise.resolve(false)
  }, [cargar, modo])

  const verDemo = useCallback(async () => {
    const j = await cargarDemo()
    setDatos(j.datos)
    setSesion({ codigo: null, rol: 'demo', nombre: 'Demostración', ts: Date.now() })
    setModo('demo')
  }, [])

  // --- escritura optimista por parche -----------------------
  // editarFila('Espacios', 'E-001', { pos_x: 41 }) actualiza la
  // pantalla al instante y agrupa el envío al servidor.
  const editarFila = useCallback((tab, key, parche) => {
    if (modo === 'demo') return // en demostración no se escribe nada
    const llave = `${tab}|${key}`
    tocadoReciente.current[llave] = Date.now()

    setDatos((previos) => {
      if (!previos || !previos[tab]) return previos
      return {
        ...previos,
        [tab]: previos[tab].map((f) =>
          (f.id ?? f.clave) === key ? { ...f, ...parche } : f
        ),
      }
    })

    parchesPendientes.current[llave] = { ...(parchesPendientes.current[llave] || {}), ...parche }
    if (temporizadores.current[llave]) clearTimeout(temporizadores.current[llave])
    temporizadores.current[llave] = setTimeout(() => enviarParche(tab, key), DEBOUNCE_MS)
  }, [modo]) // eslint-disable-line react-hooks/exhaustive-deps

  const enviarParche = useCallback(async (tab, key) => {
    const llave = `${tab}|${key}`
    const parche = parchesPendientes.current[llave]
    if (!parche || Object.keys(parche).length === 0) return
    parchesPendientes.current[llave] = {}
    // El estado "guardando" se sostiene hasta el {ok:true} real del
    // servidor: la paloma nunca aparece antes de que sea verdad.
    setGuardados((g) => ({ ...g, [llave]: 'guardando' }))
    try {
      const r = await apiCall('guardar', {
        codigo: sesionRef.current?.codigo,
        tab,
        key,
        patch: parche,
      })
      setVersion(r.v ?? null)
      setGuardados((g) => ({ ...g, [llave]: 'ok' }))
      setTimeout(() => setGuardados((g) => {
        const { [llave]: _, ...resto } = g
        return resto
      }), 2500)
    } catch (e) {
      // Regresa el parche para poder reintentar a mano.
      parchesPendientes.current[llave] = { ...parche, ...(parchesPendientes.current[llave] || {}) }
      setGuardados((g) => ({ ...g, [llave]: 'error' }))
      setErrorSync(e.message)
    }
  }, [])

  const reintentarGuardado = useCallback((tab, key) => enviarParche(tab, key), [enviarParche])

  // Crear una fila nueva: acción directa, sin reintento automático
  // (crear no es idempotente). Devuelve la fila con su id del servidor.
  const crearFila = useCallback(async (tab, fila) => {
    if (modo === 'demo') throw new Error('En la demostración no se puede crear nada.')
    const r = await apiCall('crear', { codigo: sesionRef.current?.codigo, tab, fila })
    setVersion(r.v ?? null)
    setDatos((previos) => {
      if (!previos) return previos
      return { ...previos, [tab]: [...(previos[tab] || []), r.fila] }
    })
    return r.fila
  }, [modo])

  const borrarFila = useCallback(async (tab, key) => {
    if (modo === 'demo') throw new Error('En la demostración no se puede borrar nada.')
    const r = await apiCall('borrar', { codigo: sesionRef.current?.codigo, tab, key })
    setVersion(r.v ?? null)
    setDatos((previos) => {
      if (!previos || !previos[tab]) return previos
      return { ...previos, [tab]: previos[tab].filter((f) => (f.id ?? f.clave) !== key) }
    })
    return true
  }, [modo])

  const valor = {
    sesion, arrancando, datos, modo,
    sincronizando, errorSync, ultimaSync, guardados,
    entrar, salir, actualizar, verDemo,
    editarFila, crearFila, borrarFila, reintentarGuardado,
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

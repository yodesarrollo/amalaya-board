// ============================================================
// Mini MOAC de Amalaya — reglas puras (sin React), con pruebas en
// scripts/pruebas-moac.mjs. Mismo modelo que el MOAC de Operación
// semanal, más simple: metas → objetivos → acciones (las Tareas).
// Regla D.2 del MOAC: toda acción cierra un objetivo.
// ============================================================

const DIA = 24 * 3600 * 1000

const hecho = (t) => ['si', 'sí', 'true', '1'].includes(String(t?.hecho ?? '').trim().toLowerCase())

// Semáforo de una acción: 'hecho' | 'rojo' (vencida) | 'ambar' (vence en
// 7 días o menos) | 'verde' | 'sin-fecha'.
export function semaforo(tarea, hoy = new Date()) {
  if (hecho(tarea)) return 'hecho'
  const f = String(tarea?.fecha || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return 'sin-fecha'
  const limite = new Date(f + 'T23:59:59')
  const dias = (limite - hoy) / DIA
  if (dias < 0) return 'rojo'
  if (dias <= 7) return 'ambar'
  return 'verde'
}

export function accionesSinObjetivo(tareas = [], objetivos = []) {
  const ids = new Set(objetivos.map((o) => String(o.id)))
  return tareas.filter((t) => !ids.has(String(t.objetivo_id || '')))
}

// Cada elemento deseado de cada parada es una petición. Su id es estable
// mientras no se reordenen los elementos: `${parada.id}#${índice}`.
export function peticionesDe(paradas = [], rutas = [], leerElementos) {
  return paradas.flatMap((p) => {
    const ruta = rutas.find((r) => String(r.id) === String(p.ruta_id))
    return leerElementos(p).map((el, i) => ({
      id: `${p.id}#${i}`,
      texto: el.texto,
      estado: ['pendiente', 'gestionado', 'logrado'].includes(el.estado) ? el.estado : 'pendiente',
      parada: p,
      ruta,
    }))
  })
}

// Avance de un objetivo: acciones hechas / acciones.
export function avanceObjetivo(objetivo, tareas = []) {
  const suyas = tareas.filter((t) => String(t.objetivo_id) === String(objetivo.id))
  return { total: suyas.length, hechas: suyas.filter(hecho).length }
}

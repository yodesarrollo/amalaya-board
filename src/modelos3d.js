// Contrato de lectura. Los vínculos reales llegan del backend, nunca del catálogo público.
export const BIBLIOTECA_3D = import.meta.env?.VITE_BIBLIOTECA_3D === 'true'

export function moduloDeEspacio(filas = [], espacioId) {
  const candidatas = filas.filter((f) =>
    String(f.espacio_id) === String(espacioId) &&
    String(f.activo).toLowerCase() === 'si' && f.estado === 'validado'
  )
  // Una asignación ambigua no debe mostrar el modelo de otro inmueble.
  return candidatas.length === 1 ? String(candidatas[0].modulo_id) : null
}

export function urlActivo(base, path) {
  if (typeof path !== 'string' || !/^[a-zA-Z0-9_./-]+$/.test(path) || path.startsWith('/') || path.split('/').includes('..')) {
    throw new Error('Ruta de activo no válida.')
  }
  return `${base}activos3d/${path}`
}

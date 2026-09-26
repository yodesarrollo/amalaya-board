// Catálogo ÚNICO de tipos de espacio (chinche #17): el mismo nombre y el
// mismo color en la leyenda, el mapa, la lista de Espacios, el formulario,
// la ficha y Finanzas. El Sheet guarda la clave; la pantalla, el nombre.
export const TIPOS = [
  { clave: 'venue', nombre: 'Foro', color: '#D98FA3' },
  { clave: 'comercial', nombre: 'Comercial', color: '#E8923A' },
  { clave: 'mixto', nombre: 'Uso mixto', color: '#E9D36A' },
  { clave: 'estacionamiento', nombre: 'Estacionamiento', color: '#8A8F99' },
  { clave: 'museo', nombre: 'Museo', color: '#8FB8D9' },
  { clave: 'escuela', nombre: 'Escuela', color: '#B9D36A' },
  { clave: 'estudio', nombre: 'Estudio', color: '#C9A0DC' },
  { clave: 'departamento', nombre: 'Departamentos', color: '#F2C98A' },
  { clave: 'restaurante', nombre: 'Restaurante', color: '#E86A3A' },
  { clave: 'otro', nombre: 'Otro', color: '#C9A45C' },
]
export const CLAVES_TIPO = TIPOS.map((t) => t.clave)
export const NOMBRE_TIPO = Object.fromEntries(TIPOS.map((t) => [t.clave, t.nombre]))
export const COLOR_TIPO = Object.fromEntries(TIPOS.map((t) => [t.clave, t.color]))
export const claveTipo = (t) => {
  const k = String(t || '').toLowerCase().trim()
  return COLOR_TIPO[k] ? k : 'otro'
}
export const nombreTipo = (t) => NOMBRE_TIPO[claveTipo(t)]

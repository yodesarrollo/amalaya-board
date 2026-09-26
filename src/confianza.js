// UX-04 · De dónde sale cada dato y cuánto confiar en él. Es un atributo aparte
// de la etapa del proyecto (idea → operando): uno dice qué tan cierto es el
// dato, el otro en qué va el espacio.
export const NIVELES = {
  medido: { nombre: 'Medido', nota: 'levantamiento en sitio' },
  cartografia: { nombre: 'Cartografía', nota: 'catastro o documento oficial' },
  estimado: { nombre: 'Estimado', nota: 'cálculo o supuesto' },
  por_validar: { nombre: 'Por validar', nota: 'aproximado, falta confirmar' },
}

const valido = (v) => (v && NIVELES[String(v).trim().toLowerCase()] ? String(v).trim().toLowerCase() : null)

// Si el Sheet trae columnas confianza_m2 / confianza_posicion, mandan ellas.
// Si no, se lee la nota; y si la nota no dice nada, el dato queda «por validar»
// (nunca se presume medido).
export function confianzaEspacio(e = {}) {
  const notas = String(e.notas || '')
  const deDocumento = /PAC|catastr|valores del suelo|escritura/i.test(notas)
  const m2 = valido(e.confianza_m2) || (Number(e.m2) > 0 ? (deDocumento ? 'cartografia' : 'por_validar') : null)
  const posicion = valido(e.confianza_posicion) || 'por_validar'
  const fuente = String(e.fuente || '').trim() || (/PAC|valores del suelo/i.test(notas) ? 'PAC · Valores del suelo' : '')
  return { m2, posicion, fuente }
}

export const nombreNivel = (n) => NIVELES[n]?.nombre || '—'

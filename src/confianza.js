import { lineasVigentes, normalizarId } from './calc.js'

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

// Las notas de los insumos viajan con la sesión. Un número calculable no
// vuelve definitiva una estimación. No se modifica ningún insumo ni fórmula.
export function haySupuestosFinancieros(datos = {}) {
  const tipos = new Set((datos.Espacios || []).map((e) => normalizarId(e.tipo)))
  const globales = new Set(['acciones_emitidas', 'gastos_generales', 'multiplo_operativo', 'multiplo_regalias'])
  const vistas = new Set()
  const config = (datos.Config || []).some((f) => {
    const clave = normalizarId(f.clave)
    if (vistas.has(clave)) return false
    vistas.add(clave) // Misma primera fila canónica que mapaConfig y GAS.
    const tipo = clave.match(/^(?:costo|valor)_m2_(.+)$/)?.[1]
    return (globales.has(clave) || tipos.has(tipo)) && Number(f.valor) > 0 &&
      /estimad|supuesto|por validar|proyecci[oó]n/i.test(String(f.notas || ''))
  })
  const espacios = new Set((datos.Espacios || []).map((e) => String(e.id)))
  return config || lineasVigentes(datos.Finanzas_Lineas || [], datos.Escenarios || [])
    .some((l) => espacios.has(String(l.espacio_id)) && String(l.supuesto || '').trim() !== '')
}

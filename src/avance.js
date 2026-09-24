// Sin dependencias del navegador: lo usan el mapa y scripts/pruebas-avance.mjs.

// Indicador de avance: 5 rayitas (idea, negociación, proyecto, obra,
// operando), llenas hasta el estado_desarrollo del Sheet.
export const ETAPAS_DESARROLLO = ['idea', 'negociacion', 'proyecto', 'obra', 'operando']
export function nivelAvance(estado) {
  const limpio = String(estado || 'idea').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const i = ETAPAS_DESARROLLO.indexOf(limpio)
  return i < 0 ? 1 : i + 1
}
export function rayitasHtml(estado) {
  const n = nivelAvance(estado)
  return `<span class="avance5" data-nivel="${n}" title="Avance: ${n} de 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'lleno' : ''}"></i>`).join('')}</span>`
}

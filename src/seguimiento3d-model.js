export const STATES = {
  done: { label: 'Terminado', symbol: '✓' },
  active: { label: 'En proceso', symbol: '•' },
  blocked: { label: 'Problema', symbol: '!' },
  partial: { label: 'Provisional', symbol: '◐' },
  waiting: { label: 'En espera', symbol: '–' },
  pending: { label: 'Pendiente', symbol: '·' },
}
export const SHARED = new Set(['plan', 'street', 'sidewalkA', 'sidewalkB', 'corners'])
export function columns(data) {
  return data.blocks.flatMap(block => block.buildings.length
    ? block.buildings.map(building => ({ block, building }))
    : [{ block, building: { id: block.id, name: block.name, tasks: {}, publicSpace: true, visualProgress: block.visualProgress, modelReference: block.modelReference } }])
}
export function cellInfo(column, task) {
  const { block, building } = column
  const review = Object.hasOwn(building.reviewTasks || {}, task)
  const shared = SHARED.has(task) && !Object.hasOwn(building.tasks || {}, task)
  const owner = shared ? block : building
  return {
    blockId: block.id, buildingId: building.id, task,
    key: `${owner.id}:${task}`, shared,
    state: review ? building.reviewTasks[task] : owner[shared ? 'sharedTasks' : 'tasks']?.[task] || 'pending',
    issue: review ? null : owner.issues?.[task] || null,
    detail: review ? building.reviewDetails?.[task] || '' : owner.taskDetails?.[task] || '',
    evidence: review ? building.reviewEvidence?.[task] || owner.evidence?.[task] || [] : owner.evidence?.[task] || [],
  }
}
export function report(cell, text, id, url) {
  return {
    id, creado: new Date().toISOString(), pantalla: 'seguimiento-3d',
    vista: cell.buildingId, url, tipo: 'instruccion',
    texto: `${cell.buildingId} · ${cell.task}${cell.shared ? ' (tarea compartida de cuadra)' : ''}\nProblema: ${cell.issue?.detail || 'Sin problema registrado'}\nIndicación: ${text.trim()}`,
    elemento: { seccion: 'levantamiento-3d', valores: { block: cell.blockId, building: cell.buildingId, task: cell.task } },
  }
}

import {BLOCK_SECTIONS} from './seguimiento3d-secciones.js'
// A sheet sector is not a physical block. Only explicit memberships enter this index.
export const BLOCK_TASKS = new Set(['plan', 'street', 'sidewalkA', 'sidewalkB', 'corners', 'qa'])
export function aggregateState(states) {
  if (!states.length) return 'pending'
  if (states.every(s => s === 'done')) return 'done'
  for (const s of ['blocked', 'active', 'partial']) if (states.includes(s)) return s
  if (states.includes('done')) return 'partial'
  return states.includes('waiting') ? 'waiting' : 'pending'
}
export function blockIndex(data, registry) {
  const buildings = data.buildings || [], byId = new Map(buildings.map(b => [b.id, b]))
  const assigned = new Set(), ids = new Set()
  const blocks = (registry?.blocks || []).map(def => {
    if (ids.has(def.id)) throw Error(`Cuadra duplicada: ${def.id}`)
    ids.add(def.id)
    const members = def.buildingIds.map(id => {
      if (!byId.has(id) || byId.get(id).publicSpace || assigned.has(id)) throw Error(`Asignación inválida: ${id}`)
      assigned.add(id)
      return byId.get(id)
    })
    const states = Object.fromEntries(Object.keys(data.taskDefinitions).map(task => {
      // Existing building approvals never certify the perimeter or all of a block.
      const section=BLOCK_SECTIONS.find(s=>s.tasks.includes(task)),review=def.sectionReviews?.[section?.id]
      const reviewed=review?.state==='done'&&review.record&&review.evidence?.before&&review.evidence?.after&&review.evidence?.reference
      const explicit = reviewed?'done':def.visualFit?.taskStates?.[task] || def.taskStates?.[task]
      const aggregate = aggregateState(members.map(b => b.states[task] || 'pending'))
      return [task, explicit || (BLOCK_TASKS.has(task) ? 'pending' : aggregate === 'done' && !def.membershipComplete ? 'partial' : aggregate)]
    }))
    return { ...def, members, states }
  })
  return { blocks, unassigned: buildings.filter(b => !b.publicSpace && !assigned.has(b.id)), publicSpaces: buildings.filter(b => b.publicSpace), totalPhysicalBlocks: registry?.totalPhysicalBlocks ?? null }
}
export function blockSelection(block, task, label) {
  return {
    label,
    column: { block: { id: block.id }, building: { id: block.id, name: block.name } },
    cell: { key: `cuadra:${block.id}:${task}`, blockId: block.id, buildingId: block.id, scope: 'block', memberIds: block.members.map(b => b.id), task, shared: false,
      state: block.states[task], issue: null, detail: `Revisión de cuadra completa. ${block.visualFit?.taskStates?.[task]==='done'?'Cierre por montaje visual aproximado; historial anterior conservado. ':''}${block.members.length} edificios vinculados; ${block.membershipComplete ? 'inventario delimitado' : 'asignación aún incompleta'}. Los avances anteriores se conservan en cada edificio.`, evidence: [...(block.inventoryEvidence ? [{url:block.inventoryEvidence,title:`${block.id} · límite de inventario y huellas del modelo`}] : []), ...(block.evidence ? [{url: block.evidence, title: `${block.id} · fotografía, trazado anterior y retrazado parcial`}] : [])] },
  }
}

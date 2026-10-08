import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { columns, cellInfo, STATES } from '../src/seguimiento3d-model.js'
const data = JSON.parse(await readFile(new URL('../public/seguimiento-3d.json', import.meta.url), 'utf8'))
const registry = JSON.parse(await readFile(new URL('../public/levantamiento/cuadras.json', import.meta.url), 'utf8'))
const targets = columns(data)
if(data.activeReview)targets.sort((a,b)=>(data.activeReview.buildingOrder.indexOf(a.building.id)<0?999:data.activeReview.buildingOrder.indexOf(a.building.id))-(data.activeReview.buildingOrder.indexOf(b.building.id)<0?999:data.activeReview.buildingOrder.indexOf(b.building.id)))
const publicRoot = 'https://yodesarrollo.github.io/amalaya-board/'
function heading(building) {
  const progress = building.visualProgress
  if (!progress) return building.id
  const current = progress.current || progress.baseline
  const baseline = progress.comparisonBaseline || progress.baseline
  return `<a href="${publicRoot}${current.url}"><img src="${publicRoot}${current.url}" alt="${building.id} · avance del modelo" width="160"></a><br/>${building.id}<br/>${baseline ? `[Inicio](${publicRoot}${baseline.url}) · ` : ''}${current.label || 'Avance'}${progress.manifest ? ` · [Registro](${publicRoot}${progress.manifest})` : ''}`
}
const lines = [
  '# Amalaya · Matriz de levantamiento 3D', '',
  ...(registry.workPlan ? [`**Trabajo vigente por cuadras:** ${registry.workPlan.title}. ${registry.workPlan.detail}`, '', `[Abrir ficha de ${registry.workPlan.activeBlock} y sus cinco secciones](${publicRoot}seguimiento-3d.html?cuadra=${registry.workPlan.activeBlock})`, '', 'La matriz de once acciones que sigue es histórica. Sus pendientes anteriores se conservan y no sustituyen el cierre vigente por cuadra.', ''] : []),
  `Actualizado: ${data.updatedAt}. La web consulta estados cada ${data.refreshSeconds} segundos; los cambios aparecen al publicar avances.`, '',
  ...(data.activeReview ? [`Acción 1 · ${data.activeReview.closedBuildings.length} de ${data.activeReview.buildingOrder.length} columnas revisadas. ${data.activeReview.inventoryComplete ? "Inventario visual de toda la lámina completado." : "Inventario en revisión."} Los cierres anteriores válidos se conservan.`, '', `Columnas agregadas: ${data.activeReview.addedBuildings.join(', ')}. Medir → editar → verificar → imagen y registro antes de avanzar.`, ''] : []),
  ...(data.groundReview ? [data.groundReview.detail, '', '[Auditoría del suelo]('+publicRoot+data.groundReview.audit+')', ''] : []),
  ...(data.currentBatch ? [`Registro histórico · acción 2 · lote de ${data.currentBatch.buildingOrder.length}: ${data.currentBatch.closedBuildings.length} revisados, con comparación y registro. Quedan ${data.currentBatch.remainingBuildings.length} calzadas pendientes en toda la lámina. Alturas y fachadas conservan su etapa.`, ''] : []),
  `[Abrir modelo completo](${publicRoot}modelo-completo.html)`, '',
  'Naranja: en proceso · Verde: terminado · Rojo: problema · Gris: pendiente o provisional.', '',
  `| Acciones / Edificios | ${targets.map(c => heading(c.building)).join(' | ')} |`,
  `|---|${targets.map(() => '---').join('|')}|`,
  ...Object.entries(data.taskDefinitions).map(([task, label]) => `| ${label} | ${targets.map(c => { const s = STATES[cellInfo(c, task).state]; return `${s.symbol} ${s.label}` }).join(' | ')} |`), '',
  '## Nomenclatura', '',
  ...targets.map(c => `- **${c.building.id}**: ${c.building.name} · ${c.block.id} · ${c.block.name}${c.block.testRoute ? ' (ruta de prueba)' : ''}.`), '',
  '## Problemas registrados', '',
]
let problems = 0
for (const block of data.blocks) {
  for (const owner of [block, ...block.buildings]) {
    for (const [task, issue] of Object.entries(owner.issues || {})) {
      lines.push(`- **${owner.id} · ${data.taskDefinitions[task]}**: ${issue.title}. ${issue.detail}`)
      problems++
    }
  }
}
if (!problems) lines.push('Sin problemas bloqueantes registrados. Las referencias provisionales siguen pendientes de verificación.')
lines.push('', 'Las indicaciones se envían desde la celda del tablero web, con sesión de Amalaya. El Markdown es una copia de consulta.', '')
const markdown = `${lines.join('\n').trimEnd()}\n`
await mkdir(new URL('../docs/', import.meta.url), { recursive: true })
for (const path of ['../public/seguimiento-3d.md', '../docs/seguimiento-3d.md']) await writeFile(new URL(path, import.meta.url), markdown)
console.log(`Matriz Markdown: ${targets.length} columnas.`)

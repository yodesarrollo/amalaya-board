import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { columns, cellInfo, STATES } from '../src/seguimiento3d-model.js'
const data = JSON.parse(await readFile(new URL('../public/seguimiento-3d.json', import.meta.url), 'utf8'))
const targets = columns(data)
const publicRoot = 'https://yodesarrollo.github.io/amalaya-board/'
function heading(building) {
  const progress = building.visualProgress
  if (!progress) return building.id
  const current = progress.current || progress.baseline
  return `<a href="${publicRoot}${current.url}"><img src="${publicRoot}${current.url}" alt="${building.id} · avance del modelo" width="160"></a><br/>${building.id}<br/>[Inicio](${publicRoot}${progress.baseline.url}) · ${current.label || 'Avance'}`
}
const lines = [
  '# Amalaya · Matriz de levantamiento 3D', '',
  `Actualizado: ${data.updatedAt}. La web consulta estados cada ${data.refreshSeconds} segundos; los cambios aparecen al publicar avances.`, '',
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

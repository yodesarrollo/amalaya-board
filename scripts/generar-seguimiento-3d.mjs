import { mkdir, readFile, writeFile } from 'node:fs/promises'

const source = new URL('../public/seguimiento-3d.json', import.meta.url)
const data = JSON.parse(await readFile(source, 'utf8'))
const status = {
  done: '✓ Cerrado',
  partial: '◐ Provisional',
  active: '◷ En curso',
  waiting: '◷ En espera',
  pending: '□ Pendiente',
}
const fmtHours = range => `${range.min}–${range.max} h`
const allBuildings = data.blocks.flatMap(block => block.buildings || [])
const total = data.blocks.reduce((sum, block) => ({
  min: sum.min + block.estimateHours.min,
  max: sum.max + block.estimateHours.max,
}), { min: 0, max: 0 })
const updated = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Hermosillo',
}).format(new Date(data.updatedAt))

const lines = [
  '# Amalaya · seguimiento del levantamiento 3D',
  '',
  `**Estado:** ${status[data.live.status] || data.live.status} · **Fase:** ${data.live.phase} · **Actualizado:** ${updated} (Hermosillo)`,
  '',
  `## ${data.live.title}`,
  '',
  data.live.detail,
  '',
  'El tablero web vuelve a consultar el estado cada 30 segundos. Las marcas cambian cuando se guarda y publica un checkpoint.',
  '',
  '## Resumen de alcance y tiempo',
  '',
  `- ${data.blocks.length} cuadras o espacios diferenciados.`,
  `- ${allBuildings.length} anclas de edificio identificadas hasta ahora; **no representan el total de fachadas**.`,
  `- ${allBuildings.filter(building => Object.values(building.tasks).every(value => value === 'done')).length} edificios cerrados y verificados.`,
  `- Trabajo pendiente estimado para el alcance conocido: **${fmtHours(total)}**, aproximadamente **${Math.ceil(total.min / data.schedule.hoursPerFocusDay)}–${Math.ceil(total.max / data.schedule.hoursPerFocusDay)} días de foco** a ${data.schedule.hoursPerFocusDay} horas diarias.`,
  `- ${data.schedule.unnamedFrontUnit}: **${fmtHours(data.schedule.unnamedFrontHours)} adicionales**, excluidos del total hasta contar esos frentes.`,
  '',
  `> ${data.schedule.basis} ${data.schedule.estimationCaution} Se excluye: ${data.schedule.excludes}`,
  '',
  '### Leyenda',
  '',
  '| Marca | Significado |',
  '|---|---|',
  '| ✓ | Cerrado tras contraste visual y revisión |',
  '| ◐ | Hay geometría, medición o referencia previa; falta validar |',
  '| ◷ | En curso o en espera |',
  '| □ | Pendiente |',
  '',
  '## Etapas',
  '',
  '| Etapa | Estado | Tiempo base | Qué falta |',
  '|---|---|---|---|',
  ...data.phases.map(phase => `| ${phase.name} | ${status[phase.status] || phase.status} | ${phase.time} | ${phase.detail} |`),
  '',
]

for (const block of data.blocks) {
  lines.push(`## ${block.id} · ${block.name}`, '')
  lines.push(`- **Ruta:** ${block.route}${block.testRoute ? ' · ruta de prueba, cobertura por confirmar' : ''}`)
  lines.push(`- **Estimación restante:** ${fmtHours(block.estimateHours)}`)
  lines.push(`- **Siguiente paso:** ${block.next}`)
  lines.push(`- **Planta:** [Abrir OpenStreetMap](${block.mapUrl})`)
  lines.push(`- **Base:** ${block.estimateBasis}`, '')

  const targets = block.buildings || []
  if (!targets.length) {
    lines.push('| Tarea compartida | Estado |', '|---|---|')
    for (const [id, label] of Object.entries(data.taskDefinitions)) {
      const value = block.sharedTasks?.[id]
      if (value) lines.push(`| ${label} | ${status[value] || value} |`)
    }
    lines.push(`| Equipamiento urbano | ${status.pending} |`, `| Comparación y cierre | ${status.pending} |`, '')
  } else {
    lines.push(`| Trabajo por cerrar | ${targets.map(target => `${target.id} · ${target.name}`).join(' | ')} |`)
    lines.push(`|---|${targets.map(() => '---').join('|')}|`)
    for (const [id, label] of Object.entries(data.taskDefinitions)) {
      const cells = targets.map(target => {
        const value = block.sharedTasks?.[id] || target.tasks?.[id]
        return status[value] || '□ Pendiente'
      })
      if (cells.some(Boolean)) lines.push(`| ${label} | ${cells.join(' | ')} |`)
    }
    lines.push(`| Tiempo por edificio | ${targets.map(target => fmtHours(target.estimateHours)).join(' | ')} |`, '')
    lines.push('### Confianza y referencias pendientes', '')
    for (const target of targets) lines.push(`- **${target.id} · ${target.name}:** ${target.confidence}`)
    lines.push('')
  }
  lines.push(`**Frentes todavía sin nombre:** ${block.unnamedFronts}`, '')
}

lines.push(
  '## Criterio de cierre',
  '',
  'Un volumen existente no cuenta como terminado por sí solo. Para marcar ✓ deben estar asociadas sus referencias y ubicación; revisadas huella, altura, cubierta y fachada; comprobadas las banquetas y esquinas de su frente; colocado el equipamiento documentado; y comparadas las vistas de planta, bloque y a pie desde el mismo punto y rumbo.',
  '',
  'El modelo Hidalgo3D y los datos privados del tablero operativo no se publican en este seguimiento.',
  '',
)

const markdown = `${lines.join('\n').trimEnd()}\n`
await mkdir(new URL('../docs/', import.meta.url), { recursive: true })
await writeFile(new URL('../public/seguimiento-3d.md', import.meta.url), markdown)
await writeFile(new URL('../docs/seguimiento-3d.md', import.meta.url), markdown)
console.log(`Seguimiento Markdown generado para ${data.blocks.length} tramos y ${allBuildings.length} anclas.`)

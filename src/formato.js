// Formato de números y moneda del board. Todo en español de México.

const fmtMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// "$1,250,000 MXN" — el formato pedido, con el sufijo explícito.
export function moneda(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return `${fmtMXN.format(v)} MXN`
}

const fmtNum = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

export function numero(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return fmtNum.format(v)
}

export function metros2(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return `${fmtNum.format(v)} m²`
}

export function porcentaje(n, decimales = 1) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return `${v.toFixed(decimales)}%`
}

// "12 ago 2026, 11:04" para sellos de sincronización.
export function fechaHora(d) {
  const f = d instanceof Date ? d : new Date(d)
  if (isNaN(f)) return '—'
  return f.toLocaleString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

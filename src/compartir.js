// ============================================================
// La card compartible 9:16 — "la gente de 18-28 no reenvía
// PDFs; reenvía cards" (panel de avatares, 6/6 votos).
//
// Genera una imagen vertical 1080x1920 con la estética Cartel
// de Sonora, dibujada en canvas (sin fotos: tipográfica pura,
// así nunca depende de CORS ni filtra contenido privado).
// La comparte con el share nativo del teléfono o la descarga.
// ============================================================

const W = 1080
const H = 1920

function ondaAmalaya(ctx, y, ancho, amplitud, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  const x0 = (W - ancho) / 2
  for (let i = 0; i <= ancho; i += 4) {
    const yy = y + Math.sin((i / ancho) * Math.PI * 8) * amplitud * Math.sin((i / ancho) * Math.PI)
    if (i === 0) ctx.moveTo(x0 + i, yy)
    else ctx.lineTo(x0 + i, yy)
  }
  ctx.stroke()
}

// texto centrado con ajuste de línea sencillo
function textoCentrado(ctx, texto, y, fuente, color, maxAncho, alto) {
  ctx.font = fuente
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  const palabras = String(texto).split(' ')
  let linea = ''
  let yy = y
  for (const p of palabras) {
    const prueba = linea ? `${linea} ${p}` : p
    if (ctx.measureText(prueba).width > maxAncho && linea) {
      ctx.fillText(linea, W / 2, yy)
      linea = p
      yy += alto
    } else {
      linea = prueba
    }
  }
  if (linea) ctx.fillText(linea, W / 2, yy)
  return yy + alto
}

export async function generarCard({ titulo, subtitulo, detalle }) {
  // Esperar a que las fuentes de la casa estén listas para el canvas.
  await Promise.all([
    document.fonts.load('400 200px "Pirata One"'),
    document.fonts.load('400 90px "Anton"'),
    document.fonts.load('500 40px "Inter"'),
  ]).catch(() => {})

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo: noche de estadio con los dos resplandores de la portada
  ctx.fillStyle = '#141010'
  ctx.fillRect(0, 0, W, H)
  let g = ctx.createRadialGradient(W / 2, H * 1.05, 100, W / 2, H * 1.05, H * 0.7)
  g.addColorStop(0, 'rgba(201,164,92,0.20)')
  g.addColorStop(1, 'rgba(201,164,92,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  g = ctx.createRadialGradient(W / 2, -100, 50, W / 2, -100, H * 0.5)
  g.addColorStop(0, 'rgba(184,92,56,0.14)')
  g.addColorStop(1, 'rgba(184,92,56,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Grano sutil
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(242,234,217,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2)
  }

  // Encabezado
  ctx.textAlign = 'center'
  ctx.font = '500 34px Inter, sans-serif'
  ctx.fillStyle = '#B7A890'
  ctx.letterSpacing = '10px'
  ctx.fillText('DISTRITO DE MÚSICA Y CIUDAD · HERMOSILLO', W / 2, 300)
  ctx.letterSpacing = '0px'

  // La firma con su resplandor
  ctx.shadowColor = 'rgba(255,184,77,0.45)'
  ctx.shadowBlur = 90
  ctx.font = '400 210px "Pirata One", serif'
  ctx.fillStyle = '#F2EAD9'
  ctx.fillText('Amalaya', W / 2, 560)
  ctx.shadowBlur = 0

  ctx.font = '400 40px Anton, sans-serif'
  ctx.fillStyle = '#C9A45C'
  ctx.letterSpacing = '14px'
  ctx.fillText('DE HERMOSILLO PARA EL MUNDO', W / 2, 660)
  ctx.letterSpacing = '0px'

  ondaAmalaya(ctx, 760, 520, 14, '#FFB84D')

  // El contenido de ESTA card
  let y = 980
  if (subtitulo) {
    ctx.font = '500 36px Inter, sans-serif'
    ctx.fillStyle = '#9E8D78'
    ctx.letterSpacing = '8px'
    ctx.fillText(String(subtitulo).toUpperCase(), W / 2, y)
    ctx.letterSpacing = '0px'
    y += 40
  }
  y = textoCentrado(ctx, titulo, y + 110, '400 110px Anton, sans-serif', '#F2EAD9', 900, 125)
  if (detalle) {
    y = textoCentrado(ctx, detalle, y + 40, '400 42px Inter, sans-serif', '#B7A890', 820, 60)
  }

  // Pie
  ondaAmalaya(ctx, H - 300, 320, 8, 'rgba(201,164,92,0.8)')
  ctx.font = '500 34px Inter, sans-serif'
  ctx.fillStyle = '#9E8D78'
  ctx.fillText('yodesarrollo.github.io/amalaya-board', W / 2, H - 200)

  return new Promise((resolver) => canvas.toBlob(resolver, 'image/png'))
}

export async function compartirCard(datos) {
  const blob = await generarCard(datos)
  const archivo = new File([blob], 'amalaya.png', { type: 'image/png' })

  // Share nativo del teléfono si existe; si no, descarga.
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: 'Amalaya' })
      return 'compartida'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelada'
    }
  }
  const url = URL.createObjectURL(blob)
  const liga = document.createElement('a')
  liga.href = url
  liga.download = 'amalaya.png'
  liga.click()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
  return 'descargada'
}

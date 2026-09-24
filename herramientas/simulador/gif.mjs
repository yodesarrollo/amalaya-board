// GIFs cortos para la Ayuda, grabados con el simulador (datos inventados).
// Cada cuadro es una captura de la página reducida a la mitad; al final se
// cuantiza a 128 colores y se escribe con gifenc.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import gifenc from 'gifenc'
import pngjs from 'pngjs'
const { GIFEncoder, quantize, applyPalette } = gifenc
const { PNG } = pngjs

function mitad(png) {
  const w = Math.floor(png.width / 2), h = Math.floor(png.height / 2)
  const out = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    for (let c = 0; c < 4; c++) {
      let s = 0
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) s += png.data[((y * 2 + dy) * png.width + (x * 2 + dx)) * 4 + c]
      out[(y * w + x) * 4 + c] = s >> 2
    }
  }
  return { data: out, w, h }
}

export function crearGif(pagina, { recorte } = {}) {
  const cuadros = []
  return {
    async cuadro(retraso = 140) {
      const buf = await pagina.screenshot(recorte ? { clip: recorte } : {})
      cuadros.push({ ...mitad(PNG.sync.read(buf)), retraso })
    },
    guardar(ruta) {
      const gif = GIFEncoder()
      for (const f of cuadros) {
        const paleta = quantize(f.data, 128)
        gif.writeFrame(applyPalette(f.data, paleta), f.w, f.h, { palette: paleta, delay: f.retraso })
      }
      gif.finish()
      mkdirSync(dirname(ruta), { recursive: true })
      writeFileSync(ruta, gif.bytes())
      return cuadros.length
    },
  }
}

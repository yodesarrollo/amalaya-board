// Mosaicos de prueba para que el mapa se pinte SIN internet.
// Sustituyen al estilo de OpenFreeMap (un estilo mínimo con la fuente
// 'openmaptiles' vacía, que es la que usa Mapa3D.jsx) y al satélite de Esri
// (un cuadro de color liso con retícula, distinto por mosaico). No son un mapa
// real: solo dejan que MapLibre arranque y que se vean capas y volúmenes.
import { deflateSync } from 'node:zlib'

export function estilo(origen) {
  return {
    version: 8,
    name: 'simulador',
    glyphs: origen + '/__mosaicos/fuentes/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: { type: 'vector', tiles: [origen + '/__mosaicos/vector/{z}/{x}/{y}.pbf'], maxzoom: 14 },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#2a2a2a' } },
    ],
  }
}

const crc = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 }
  return (b) => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
})()
function trozo(tipo, datos) {
  const largo = Buffer.alloc(4); largo.writeUInt32BE(datos.length)
  const td = Buffer.concat([Buffer.from(tipo), datos])
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
  return Buffer.concat([largo, td, c])
}

// PNG de 256×256: tono según (x, y) y una retícula cada 32 px.
export function satelite(z, x, y) {
  const n = 256
  const base = [70 + ((x * 37) % 50), 85 + ((y * 53) % 45), 60 + ((x + y) % 30)]
  const filas = []
  for (let j = 0; j < n; j++) {
    const fila = Buffer.alloc(1 + n * 3)
    for (let i = 0; i < n; i++) {
      const rej = i % 32 === 0 || j % 32 === 0
      fila[1 + i * 3] = rej ? base[0] + 30 : base[0]
      fila[2 + i * 3] = rej ? base[1] + 30 : base[1]
      fila[3 + i * 3] = rej ? base[2] + 30 : base[2]
    }
    filas.push(fila)
  }
  const cab = Buffer.alloc(13); cab.writeUInt32BE(n, 0); cab.writeUInt32BE(n, 4); cab[8] = 8; cab[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', cab), trozo('IDAT', deflateSync(Buffer.concat(filas))), trozo('IEND', Buffer.alloc(0)),
  ])
}

// PNG «render de prueba» (panorama 2:1): franjas de colores de la lámina,
// para ver en el simulador que el slider revela el «después» sobre la foto.
export function renderPrueba(w = 1024, h = 512) {
  const colores = [[217, 143, 163], [232, 146, 58], [233, 211, 106], [143, 184, 217], [138, 163, 130]]
  const filas = []
  for (let j = 0; j < h; j++) {
    const fila = Buffer.alloc(1 + w * 3)
    for (let i = 0; i < w; i++) {
      const c = colores[Math.floor((i / w) * colores.length)]
      const rej = i % 64 === 0 || j % 64 === 0
      fila[1 + i * 3] = rej ? 255 : c[0]; fila[2 + i * 3] = rej ? 255 : c[1]; fila[3 + i * 3] = rej ? 255 : c[2]
    }
    filas.push(fila)
  }
  const cab = Buffer.alloc(13); cab.writeUInt32BE(w, 0); cab.writeUInt32BE(h, 4); cab[8] = 8; cab[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', cab), trozo('IDAT', deflateSync(Buffer.concat(filas))), trozo('IEND', Buffer.alloc(0)),
  ])
}

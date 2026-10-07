// Lo que cada pantalla sabe del punto donde se clava una chinche.
//
// La Chinche (public/chinche.js) ve el DOM, y un mapa o un visor embebido son
// un solo <canvas> o <iframe>: sin ayuda solo podría anotar «canvas». Cada
// componente registra aquí una función que, si el toque cayó en lo suyo, dice
// qué había ahí. Devuelve null cuando no le toca.
//
// toque = { el, x, y }  (el elemento señalado y el punto en la ventana)
// respuesta = { texto, vista, valores, codigo, foto: { canvas, x, y } }
const proveedores = new Set()

export function registrarContextoChinche(proveedor) {
  proveedores.add(proveedor)
  return () => { proveedores.delete(proveedor) }
}

export function contextoChinche(toque) {
  for (const proveedor of proveedores) {
    try {
      const respuesta = proveedor(toque)
      if (respuesta) return respuesta
    } catch { /* un proveedor roto no impide clavar: la chinche se queda con el DOM */ }
  }
  return null
}

// Un visor embebido que solo dibuja cuando algo cambia (la caminata 3D) no
// deja leer su imagen entre cuadros. Quien lo hospeda registra cómo pedirle
// que repinte; la Chinche lo llama justo antes de tomarle la foto.
const repintores = new Set()
export function registrarRepintadoChinche(repintor) {
  repintores.add(repintor)
  return () => { repintores.delete(repintor) }
}
export function repintarParaChinche(marco) {
  for (const repintor of repintores) { try { repintor(marco) } catch { /* sin foto, la chinche conserva el contexto */ } }
}

const PUNTOS_CARDINALES = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
export const rumboLegible = (grados) => {
  const g = Math.round(((grados % 360) + 360) % 360) % 360
  return `${g}° (${PUNTOS_CARDINALES[Math.round(g / 45) % 8]})`
}

// El mapa: qué espacio, parada o punto del recorrido quedó bajo el toque.
export function describirToqueMapa({ vista, lat, lng, zoom, rumbo, espacio, parada, punto }) {
  const sobre = [
    punto && `el punto del recorrido «${punto.nombre}» (${punto.ruta})`,
    parada && `la parada «${parada.nombre || parada.id}»`,
    espacio && `el espacio «${espacio.nombre || espacio.id}»`,
  ].filter(Boolean)
  const coordenadas = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  return {
    codigo: 'src/componentes/Mapa3D.jsx y Mapa.jsx',
    vista: `mapa · ${vista}`,
    texto: `Mapa en ${vista} · ${sobre.length ? `sobre ${sobre.join(' y ')}` : 'sin espacio ni punto del recorrido bajo el toque'} · ${coordenadas}`,
    valores: {
      vista, coordenadas, zoom: zoom.toFixed(1), rumbo: rumboLegible(rumbo),
      ...(espacio ? { espacio: `${espacio.id} · ${espacio.nombre || ''}`.replace(/ · $/, '') } : {}),
      ...(parada ? { parada: `${parada.id} · ${parada.nombre || ''}`.replace(/ · $/, '') } : {}),
      ...(punto ? { punto: `${punto.ruta} · ${punto.nombre}`, punto_id: punto.id } : {}),
    },
  }
}

// Los visores del recorrido (Street View 360 y caminata 3D) dentro del mapa.
export function describirVisorRecorrido({ modo, ruta, indice, version }) {
  const punto = ruta?.puntos?.[indice]
  if (!punto) return null
  const etiqueta = `P${String(indice + 1).padStart(2, '0')}`
  const escenario = version === 'amalaya' ? 'Amalaya' : 'Actual'
  if (modo === 'streetview') {
    return {
      codigo: 'src/componentes/RecorridoModelo.jsx y public/recorrido/index.html',
      vista: `mapa · Street View · ${ruta.id} ${etiqueta}`,
      valores: { modo: 'Street View', escenario },
    }
  }
  return {
    codigo: 'src/componentes/RecorridoModelo.jsx y public/levantamiento/visor/ (caminata 3D compilada)',
    vista: `mapa · Caminar · ${ruta.id} ${etiqueta}`,
    texto: `Caminata 3D · entró por ${ruta.id} ${etiqueta} «${punto.nombre || etiqueta}»; la foto muestra dónde iba al tocar`,
    valores: { modo: 'Caminar', escenario, ruta: `${ruta.id} · ${ruta.nombre}`, punto_de_entrada: `${etiqueta} · ${punto.nombre || ''}`.replace(/ · $/, ''), punto_id: punto.id },
  }
}

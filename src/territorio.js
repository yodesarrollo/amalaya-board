// La lámina «Zona Núcleo» puesta en su sitio.
// Fuente: paquete Amalaya_Integracion › Amalaya_Territorio (26-sep-2026):
//   · datos/propuesta_hipotesis.geojson → contornos Z01–Z10 en WGS84, registrados
//     sobre OpenStreetMap por las cuatro esquinas de la Plaza Hidalgo;
//   · datos/colocacion_modulos.json → centro (UTM 12N → lng/lat), escala y giro de
//     cada módulo 3D.
// Relación espacio ↔ zona: por las calles de cada predio en «PAC Valores del
// suelo» (Garmendia/Chihuahua/Serdán = foro; Healy en Yáñez y Sufragio Efectivo =
// plaza de usos mixtos; «Estacionamiento Multinivel HEALY 300» de la lámina =
// Estacionamiento 2). Todo es HIPÓTESIS de maqueta: ni predios ni levantamiento.

export const ZONAS = {
  Z01: { nombre: "Foro musical Amalaya", color: '#bd668b', espacio: "E-001", anillo: [[-110.95404, 29.076975], [-110.95347, 29.077027], [-110.953426, 29.076473], [-110.954034, 29.076364], [-110.95404, 29.076975]] },
  Z02: { nombre: "Plaza Hidalgo", color: '#61a86a', espacio: null, anillo: [[-110.954561, 29.07615], [-110.954071, 29.076187], [-110.954055, 29.076023], [-110.955481, 29.075915], [-110.955498, 29.07608], [-110.954561, 29.07615]] },
  Z03: { nombre: "Locales y oficinas", color: '#ef9939', espacio: "E-004", anillo: [[-110.955537, 29.075887], [-110.954949, 29.075924], [-110.954933, 29.075601], [-110.955609, 29.075406], [-110.955537, 29.075887]] },
  Z04: { nombre: "Vivienda y estudios de ensayo", color: '#e8c853', espacio: "E-004", anillo: [[-110.95609, 29.075205], [-110.95535, 29.07542], [-110.955259, 29.075169], [-110.955383, 29.074951], [-110.955755, 29.074896], [-110.955937, 29.075034], [-110.956124, 29.07508], [-110.95609, 29.075205]] },
  Z05: { nombre: "Volumen azul / referencia al museo", color: '#52aebe', espacio: "E-004", anillo: [[-110.955164, 29.075463], [-110.954739, 29.075569], [-110.954751, 29.075298], [-110.955209, 29.075177], [-110.955164, 29.075463]] },
  Z06: { nombre: "Tiendas y talleres creativos", color: '#ee8052', espacio: "E-004", anillo: [[-110.955197, 29.075196], [-110.954784, 29.075303], [-110.954761, 29.074963], [-110.955244, 29.074817], [-110.955197, 29.075196]] },
  Z07: { nombre: "Estacionamiento frontal HEALY", color: '#7687ba', espacio: "E-005", anillo: [[-110.954574, 29.075423], [-110.954062, 29.075534], [-110.954177, 29.075035], [-110.954707, 29.074842], [-110.954574, 29.075423]] },
  Z08: { nombre: "Estacionamiento posterior aparente", color: '#8e93b4', espacio: "E-003", anillo: [[-110.953508, 29.076556], [-110.953055, 29.07664], [-110.95315, 29.076084], [-110.953622, 29.076014], [-110.953508, 29.076556]] },
  Z09: { nombre: "Conjunto amarillo recortado", color: '#cfb951', espacio: null, anillo: [[-110.952948, 29.076946], [-110.952498, 29.076936], [-110.952752, 29.076421], [-110.953057, 29.076379], [-110.952948, 29.076946]] },
  Z10: { nombre: "Volúmenes posteriores / transición", color: '#c88c76', espacio: "E-002", anillo: [[-110.953353, 29.077021], [-110.95316, 29.077098], [-110.953137, 29.076835], [-110.953373, 29.076699], [-110.953353, 29.077021]] },
}

// Módulos GLB (public/activos3d/modulos/NN/modelo.glb). ancla = centro de su caja,
// para que el centro del módulo caiga en el centro de su zona.
export const MODULOS = [
  { modulo: '01', zona: 'Z01', espacio: "E-001", lng: -110.9537518, lat: 29.0766956, escala: 1.5114, giro: 4.934, anclaX: 17.0, anclaZ: -14.55 },
  { modulo: '02', zona: 'Z03', espacio: "E-004", lng: -110.9552798, lat: 29.0756687, escala: 1.9171, giro: 4.934, anclaX: 14.55, anclaZ: -11.55 },
  { modulo: '03', zona: 'Z04', espacio: "E-004", lng: -110.9556941, lat: 29.0751474, escala: 1.931, giro: 4.934, anclaX: 9.45, anclaZ: -7.95 },
  { modulo: '04', zona: 'Z05', espacio: "E-004", lng: -110.9549741, lat: 29.0753732, escala: 1.7318, giro: 4.934, anclaX: 11.5, anclaZ: -5.0 },
  { modulo: '05', zona: 'Z06', espacio: "E-004", lng: -110.955014, lat: 29.0750599, escala: 1.4756, giro: 4.934, anclaX: 14.05, anclaZ: -12.55 },
  { modulo: '06', zona: 'Z07', espacio: "E-005", lng: -110.9543846, lat: 29.0751882, escala: 2.0995, giro: 4.934, anclaX: 14.0, anclaZ: -11.0 },
  { modulo: '07', zona: 'Z08', espacio: "E-003", lng: -110.9533381, lat: 29.0763272, escala: 1.8494, giro: 4.934, anclaX: 14.0, anclaZ: -11.0 },
  { modulo: '08', zona: 'Z09', espacio: null, lng: -110.9527797, lat: 29.0766793, escala: 1.6162, giro: 4.934, anclaX: 15.55, anclaZ: -11.55 },
]

// Zonas de un espacio: la columna opcional «zona» del Sheet (ej. «Z03,Z04») manda;
// si no hay, la relación por id de arriba.
export function zonasDeEspacio(e) {
  if (/^libre$/i.test(String(e?.zona || '').trim())) return [] // fuera de la lámina: se mueve a mano
  const propia = String(e?.zona || '').split(/[,\s]+/).filter((z) => ZONAS[z])
  if (propia.length) return propia
  return Object.keys(ZONAS).filter((z) => ZONAS[z].espacio === String(e?.id))
}

export function centroDeZonas(zonas) {
  const pts = zonas.flatMap((z) => ZONAS[z].anillo.slice(0, -1))
  if (!pts.length) return null
  return [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]
}

// Filas para CapaModelos3D (un id único por módulo: un espacio puede tener varios).
export function filasModelos(base) {
  return MODULOS.map((m) => ({
    espacio_id: `${m.espacio || 'contexto'}:${m.modulo}`, modulo_id: m.modulo, estado: 'validado', activo: 'si',
    longitud: m.lng, latitud: m.lat, altitud_m: 0, giro_y_deg: m.giro, escala_m_por_unidad: m.escala,
    ancla_local_x: m.anclaX, ancla_local_z: m.anclaZ, url: `${base}activos3d/modulos/${m.modulo}/modelo.glb`,
  }))
}

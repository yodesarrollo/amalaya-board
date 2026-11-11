// 20 / C1-07 / C05 · cuadra 5 · LOTE DE AUTOS CON MARQUESINA ABIERTA SOBRE ROSALES (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   E7-R5MD-262: 2025-03, panorama R5MD4ExFEom6fV9Rm_jF1Q, cámara local (-142.3,92.6), rumbo 262: C1-07: marquesina de lote de autos (JM Automotriz) con malla electrosoldada.
//   E8-Gtxm-262: 2025-03, panorama GtxmNhiNOwFTAG9vcPMQXw, cámara local (-142.7,103.9), rumbo 262: C1-07 extremo sur: faldón con anuncio, malla y retorno al sur.
//   E6-xwTl-305: 2025-03, panorama xwTlxVohnHcUyZ2NsiDldQ, cámara local (-142.8,81.0), rumbo 305: C1-04 completo en escorzo: dos niveles, balaustrada y frontón 1912.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// No es una nave cerrada: es el lote de JM Automotriz con una marquesina de lámina oscura sobre
// postes (la superficie oscura rayada de la aérea), malla electrosoldada sobre murete y faldón con
// anuncio. Se modela como dos cubiertas abiertas (4.6 m) que siguen la planta en L registrada.
// La malla y el faldón no se modelan: una cerca de edificio crea colisiones a otra altura que la de
// sus secciones (pruebas-fabrica) y como equipamiento de cuadra sería un grupo de colisión nuevo que
// la prueba de firmas no admite. `ciega` en las caras a la calle sólo registra que la cubierta no
// tiene vanos. Orden de puntos con área negativa (no se invierte): postes intermedios en los lados largos.
const piso='#8f8c86',lamina='#4a4f52';
export const C05_20={
 id:'C1-07',height:4.6,color:piso,roofColor:lamina,uncertainty:1,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,
 // Contorno en L de la planta registrada (separado 0.2 m de la banqueta).
 points:[[-168.183,85.221],[-151.55,83.66],[-148.03,110.6],[-157.493,113.565],[-161.143,93.282],[-168.183,94.582]],
 sources:['evidence/C05/20261110-modelado/foto-E7-R5MD-262.jpg','evidence/C05/20261110-modelado/foto-E8-Gtxm-262.jpg','evidence/C05/20261110-modelado/foto-E6-xwTl-305.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 facades:[],
 sections:[
  {part:'marquesina-norte',points:[[-150.277,93.4],[-151.55,83.66],[-168.183,85.221],[-168.183,94.3]],height:4.6,color:piso,roofColor:lamina,openCanopy:true,facades:[{edge:0,plain:true,ciega:true,bays:[]}]},
  {part:'marquesina-oriente',points:[[-157.493,113.565],[-148.03,110.6],[-150.268,93.47],[-161,94.1]],height:4.6,color:piso,roofColor:lamina,openCanopy:true,facades:[{edge:1,plain:true,ciega:true,bays:[]}]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H20-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Rosales (Street View mar-2025): lote de venta de autos «JM Automotriz» con marquesina de lámina oscura sobre postes, faldón gris oscuro con anuncio (compra, venta, consignación, avalúo), malla electrosoldada sobre murete de concreto, entrada vehicular al norte junto al edificio de 1912 y anuncio alto «JM» en la esquina sur. La aérea muestra la cubierta oscura en L.',
  estimated:'Altura de la marquesina 4.6 m (faldón de ~3.5 a 4.6 m, ±0.5 m) y posición de postes; malla, faldón y anuncio no se modelan (reglas de colisión de la fábrica y de firmas).',
  unchanged:'Contorno en L de la planta registrada (±3 m), separado 0.2 m de la banqueta.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'20/C1-07: lote de autos con marquesina abierta de lámina oscura (Street View mar-2025); malla y faldón observados, no modelados. Medidas visuales, no métricas.'
};

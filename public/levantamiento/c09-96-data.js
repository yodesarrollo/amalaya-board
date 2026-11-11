// 96 / D2-04 / C09 · cuadra 28 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C09.jpg). No hay foto de calle de C09 en el repositorio.
//
// Visto en la aérea: esquina Sufragio–Juan Álvarez con azotea blanca (mediana #faf7ee) y un hueco oscuro al centro-sur.
// Estimado: fachada por tipología (fábrica de fachadas) en las caras que dan a la calle,
// color de muro y altura (4.0 m: mediana de los frentes de un nivel del centro con Street View); medidas visuales, no métricas.
export const C09_96={block:'C09',evidence:'C09/20261110-modelado',buildings:[{
 id:'D2-04',height:4.0,color:'#d4cab3',roofColor:'#e6e2d6',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C09.jpg','calco/referencia.webp','evidence/D2-04/20261006-01-cierre.json','evidence/C09/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta de C09) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:0,tipo:'casa',sinPuerta:true},{edge:1,tipo:'casa',puertas:[3]}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H96-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Esquina Sufragio–Juan Álvarez: azotea blanca con pretil y frentes sobre ambas banquetas.',
  estimated:'Altura 4.0 m por tipología, vanos por tipología casa de un nivel (puerta sobre Juan Álvarez), color de muro.',
  unchanged:'Planta de inventario (±3 m) y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'96/D2-04: aérea + fachada tipológica (sin foto de calle).'}]};

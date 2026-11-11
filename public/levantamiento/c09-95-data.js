// 95 / D2-03 / C09 · cuadra 28 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C09.jpg). No hay foto de calle de C09 en el repositorio.
//
// Visto en la aérea: conjunto en la esquina Sufragio–Mina con alberca azul en un patio central (cubierta clara alrededor, mediana #dedfd3) y muchas piezas pequeñas en la azotea norte.
// Estimado: fachada por tipología (fábrica de fachadas) en las caras que dan a la calle,
// color de muro y altura (4.0 m: mediana de los frentes de un nivel del centro con Street View); medidas visuales, no métricas.
export const C09_95={block:'C09',evidence:'C09/20261110-modelado',buildings:[{
 id:'D2-03',height:4.0,color:'#d9cbb0',roofColor:'#d9dacd',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 // Patio con alberca visible en la aérea (la planta de inventario lo cubría): se abre
 // el patio y la alberca queda como superficie de agua a nivel de suelo.
 holes:[[[-38.6,96.6],[-30.4,96.6],[-30.4,106.2],[-38.6,106.2]]],
 yardSurface:{points:[[-37.2,97.6],[-31.4,97.6],[-31.4,105.2],[-37.2,105.2]],color:'#4a86b4'},
 sources:['ajuste-visual/C09.jpg','calco/referencia.webp','evidence/D2-03/20261006-01-cierre.json','evidence/C09/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta de C09) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:7,tipo:'casa',puertas:['centro']},{edge:0,tipo:'casa',sinPuerta:true},{edge:1,tipo:'casa',puertas:[2]}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H95-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Esquina Sufragio–Mina: conjunto con alberca en patio central, cubierta clara alrededor y azotea norte con muchas piezas pequeñas; esquina noroeste ochavada.',
  estimated:'Altura 4.0 m por tipología, patio de la alberca a ±1 m, vanos por tipología casa de un nivel en Mina y Sufragio, color de muro.',
  unchanged:'Planta de inventario (±3 m) salvo el patio de la alberca; registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'95/D2-03: aérea + fachada tipológica (sin foto de calle).'}]};

// 125 / D3-01 / C18 · cuadra 33 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C18.jpg). No hay foto de calle de C18 en el repositorio (evidence/,
// recorrido/ ni HEIGHT_REVIEWS de paramento-data.js).
// Terreno: franja al pie del cerro; el suelo sube hacia el cerro (pendiente no medida). Se
// deja sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.
//
// Visto en la aérea: Azotea blanca alargada, en cuña, junto a Garmendia y unos 5 m detrás de la banqueta, con arbolado oscuro al frente.
// Estimado: Planta retrazada a ±1 m sobre la azotea (la de inventario quedaba corrida al poniente, sobre el arbolado); altura 4.0 m; vanos casa de un nivel en las caras al poniente, visibles desde Garmendia; color de muro.
export const C18_125={block:'C18',evidence:'C18/20261110-modelado',buildings:[{
 id:'D3-01',height:4.0,color:'#d3c6ac',roofColor:'#d0cab9',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 // Planta retrazada a ±1 m sobre la aérea (la de inventario, ±3 m, no coincidía con la cubierta);
 // la de inventario se conserva en su registro. Medidas visuales, no métricas.
 points:[[99.9,95],[106.1,95],[102.4,101],[99,108.6],[97.7,109.1],[96,105],[96.6,101]],
 sources:['ajuste-visual/C18.jpg','calco/referencia.webp','evidence/D3-01/20261006-01-cierre.json','evidence/C18/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta abierta de C18) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:6,tipo:'casa',puertas:['centro']},{edge:5,tipo:'casa',sinPuerta:true}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H125-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:"Azotea blanca alargada, en cuña, junto a Garmendia y unos 5 m detrás de la banqueta, con arbolado oscuro al frente.",
  estimated:"Planta retrazada a ±1 m sobre la azotea (la de inventario quedaba corrida al poniente, sobre el arbolado); altura 4.0 m; vanos casa de un nivel en las caras al poniente, visibles desde Garmendia; color de muro.",
  unchanged:"Registro de inventario (evidence/D3-01/20261006-01-cierre.json, ±3 m) conservado como registro.",
  terrain:"Franja al pie del cerro: el terreno sube hacia el cerro y a lo largo de Felipe Salido; pendiente no medida (la aérea no da cotas). El edificio queda sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.",
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según las fotos.'}},
 note:'125/D3-01: aérea + fachada tipológica (sin foto de calle).'}]};

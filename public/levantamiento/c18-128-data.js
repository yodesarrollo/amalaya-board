// 128 / D3-04 / C18 · cuadra 33 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C18.jpg). No hay foto de calle de C18 en el repositorio (evidence/,
// recorrido/ ni HEIGHT_REVIEWS de paramento-data.js).
// Terreno: franja al pie del cerro; el suelo sube hacia el cerro (pendiente no medida). Se
// deja sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.
//
// Visto en la aérea: Azotea blanca junto a Garmendia, parte de un conjunto de azoteas blancas que sigue al oriente fuera del inventario; franja oscura de arbolado hacia la banqueta.
// Estimado: Altura 4.0 m; vanos casa de un nivel sobre Garmendia; color de muro.
export const C18_128={block:'C18',evidence:'C18/20261110-modelado',buildings:[{
 id:'D3-04',height:4.0,color:'#d9cdb5',roofColor:'#d4d0c2',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C18.jpg','calco/referencia.webp','evidence/D3-04/20261006-01-cierre.json','evidence/C18/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta abierta de C18) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:3,tipo:'casa',puertas:['centro'],modulo:2.2}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H128-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:"Azotea blanca junto a Garmendia, parte de un conjunto de azoteas blancas que sigue al oriente fuera del inventario; franja oscura de arbolado hacia la banqueta.",
  estimated:"Altura 4.0 m; vanos casa de un nivel sobre Garmendia; color de muro.",
  unchanged:"Planta de inventario (±3 m) y registro individual; las azoteas vecinas fuera del inventario quedan fuera del conteo de 139.",
  terrain:"Franja al pie del cerro: el terreno sube hacia el cerro y a lo largo de Felipe Salido; pendiente no medida (la aérea no da cotas). El edificio queda sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.",
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según las fotos.'}},
 note:'128/D3-04: aérea + fachada tipológica (sin foto de calle).'}]};

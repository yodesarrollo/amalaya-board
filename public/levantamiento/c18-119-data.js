// 119 / C3-04 / C18 · cuadra 33 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C18.jpg). No hay foto de calle de C18 en el repositorio (evidence/,
// recorrido/ ni HEIGHT_REVIEWS de paramento-data.js).
// Terreno: franja al pie del cerro; el suelo sube hacia el cerro (pendiente no medida). Se
// deja sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.
//
// Visto en la aérea: Esquina Sufragio–Garmendia: cubierta clara en L —ala norte sobre Sufragio y ala sur que baja escalonada— con dos equipos de azotea en la ala norte; jardín arbolado al poniente sobre Garmendia y patio oscuro al oriente.
// Estimado: Planta retrazada a ±1 m sobre la aérea y alineada a la banqueta (la de inventario cubría el jardín y ponía un patio sobre la cubierta); altura 4.0 m por tipología; vanos casa de un nivel en Sufragio, Garmendia y la cara poniente del ala sur, visible detrás del jardín; color de muro.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
export const C18_119={block:'C18',evidence:'C18/20261110-modelado',buildings:[{
 id:'C3-04',height:4.0,color:'#d8c9ad',roofColor:'#d5d9cf',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 // Planta retrazada a ±1 m sobre la aérea (la de inventario, ±3 m, no coincidía con la cubierta);
 // la de inventario se conserva en su registro. Medidas visuales, no métricas.
 points:[[83.5,50.78],[91.2,48.65],[94.41,60.2],[96.1,62],[96.2,69],[94.6,69.3],[94.9,79.3],[91.2,79.6],[89.6,75.5],[88.7,66],[88.6,59.3],[83.5,59.3]],
 sources:['ajuste-visual/C18.jpg','calco/referencia.webp','evidence/C3-04/20261006-01-cierre.json','evidence/C18/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta abierta de C18) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:0,tipo:'casa',puertas:['centro']},{edge:11,tipo:'casa',sinPuerta:true},{edge:7,tipo:'casa',sinPuerta:true},{edge:8,tipo:'casa',puertas:['centro']},{edge:9,tipo:'casa',sinPuerta:true}],
 roofDetails:[tinaco(86.2,53.4),tinaco(89.2,53.0)],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H119-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:"Esquina Sufragio–Garmendia: cubierta clara en L —ala norte sobre Sufragio y ala sur que baja escalonada— con dos equipos de azotea en la ala norte; jardín arbolado al poniente sobre Garmendia y patio oscuro al oriente.",
  estimated:"Planta retrazada a ±1 m sobre la aérea y alineada a la banqueta (la de inventario cubría el jardín y ponía un patio sobre la cubierta); altura 4.0 m por tipología; vanos casa de un nivel en Sufragio, Garmendia y la cara poniente del ala sur, visible detrás del jardín; color de muro.",
  unchanged:"Registro de inventario (evidence/C3-04/20261006-01-cierre.json, ±3 m) conservado como registro.",
  terrain:"Franja al pie del cerro: el terreno sube hacia el cerro y a lo largo de Felipe Salido; pendiente no medida (la aérea no da cotas). El edificio queda sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.",
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según las fotos.'}},
 note:'119/C3-04: aérea + fachada tipológica (sin foto de calle).'}]};

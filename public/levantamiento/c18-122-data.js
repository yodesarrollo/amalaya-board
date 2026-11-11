// 122 / C3-07 / C18 · cuadra 33 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C18.jpg). No hay foto de calle de C18 en el repositorio (evidence/,
// recorrido/ ni HEIGHT_REVIEWS de paramento-data.js).
// Terreno: franja al pie del cerro; el suelo sube hacia el cerro (pendiente no medida). Se
// deja sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.
//
// Visto en la aérea: Dos azoteas blancas contiguas sobre Sufragio separadas por un pretil: la poniente de unos 12 m de fondo y la oriente de unos 10 m con dos calentadores solares; un tinaco junto al frente; arbolado detrás.
// Estimado: Planta retrazada a ±1 m y alineada a la banqueta (la de inventario quedaba unos 3 m detrás); altura 4.0 m; vanos casa de un nivel en Sufragio con una puerta por azotea; color de muro.
import {calentador,tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
export const C18_122={block:'C18',evidence:'C18/20261110-modelado',buildings:[{
 id:'C3-07',height:4.0,color:'#d6cbb4',roofColor:'#e8e5d9',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 // Planta retrazada a ±1 m sobre la aérea (la de inventario, ±3 m, no coincidía con la cubierta);
 // la de inventario se conserva en su registro. Medidas visuales, no métricas.
 points:[[118.2,41.15],[133,37.05],[133,48.3],[125.6,48.6],[125.6,53.2],[118.2,53.4]],
 sources:['ajuste-visual/C18.jpg','calco/referencia.webp','evidence/C3-07/20261006-01-cierre.json','evidence/C18/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta abierta de C18) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:0,tipo:'casa',puertas:[1,3]}],
 roofDetails:[calentador(128.7,42.4),calentador(131.0,42.4),tinaco(122.0,41.6)],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H122-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:"Dos azoteas blancas contiguas sobre Sufragio separadas por un pretil: la poniente de unos 12 m de fondo y la oriente de unos 10 m con dos calentadores solares; un tinaco junto al frente; arbolado detrás.",
  estimated:"Planta retrazada a ±1 m y alineada a la banqueta (la de inventario quedaba unos 3 m detrás); altura 4.0 m; vanos casa de un nivel en Sufragio con una puerta por azotea; color de muro.",
  unchanged:"Registro de inventario (evidence/C3-07/20261006-01-cierre.json, ±3 m) conservado como registro.",
  terrain:"Franja al pie del cerro: el terreno sube hacia el cerro y a lo largo de Felipe Salido; pendiente no medida (la aérea no da cotas). El edificio queda sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.",
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según las fotos.'}},
 note:'122/C3-07: aérea + fachada tipológica (sin foto de calle).'}]};

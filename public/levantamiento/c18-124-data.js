// 124 / C3-09 / C18 · cuadra 33 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C18.jpg). No hay foto de calle de C18 en el repositorio (evidence/,
// recorrido/ ni HEIGHT_REVIEWS de paramento-data.js).
// Terreno: franja al pie del cerro; el suelo sube hacia el cerro (pendiente no medida). Se
// deja sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.
//
// Visto en la aérea: Esquina Sufragio–Abasolo (nombre del inventario): cuerpo norte de azotea clara con patio interior oscuro y tinacos, y cuerpo sur de azotea blanca junto a Abasolo con un patio pequeño con plantas; franja arbolada al poniente que queda abierta.
// Estimado: Planta retrazada a ±1 m sobre las dos azoteas y alineada a las banquetas (la de inventario quedaba unos 4 m detrás de Sufragio y cubría la franja arbolada); dos patios abiertos a ±1 m; altura 4.0 m; vanos casa de un nivel en Sufragio y Abasolo; color de muro.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
export const C18_124={block:'C18',evidence:'C18/20261110-modelado',buildings:[{
 id:'C3-09',height:4.0,color:'#dad0bb',roofColor:'#e8e5dc',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 // Planta retrazada a ±1 m sobre la aérea (la de inventario, ±3 m, no coincidía con la cubierta);
 // la de inventario se conserva en su registro. Medidas visuales, no métricas.
 points:[[155.2,30.89],[166.73,27.69],[169,37.5],[169.3,47.4],[170,47.6],[170.6,62.8],[158,63],[158,58.2],[151.1,58.2],[151.1,52.6],[155.2,52.6]],
 // Patios vistos abiertos en la aérea.
 holes:[[[160.6,39],[165,39],[165,46],[160.6,46]],[[153.7,53.7],[157.3,53.7],[157.3,57.4],[153.7,57.4]]],
 sources:['ajuste-visual/C18.jpg','calco/referencia.webp','evidence/C3-09/20261006-01-cierre.json','evidence/C18/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta abierta de C18) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:0,tipo:'casa',puertas:['centro']},{edge:1,tipo:'casa',sinPuerta:true},{edge:2,tipo:'casa',sinPuerta:true},{edge:4,tipo:'casa',puertas:['centro']}],
 roofDetails:[tinaco(163.2,32.7),tinaco(165.7,30.6),tinaco(163.3,51.8)],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H124-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:"Esquina Sufragio–Abasolo (nombre del inventario): cuerpo norte de azotea clara con patio interior oscuro y tinacos, y cuerpo sur de azotea blanca junto a Abasolo con un patio pequeño con plantas; franja arbolada al poniente que queda abierta.",
  estimated:"Planta retrazada a ±1 m sobre las dos azoteas y alineada a las banquetas (la de inventario quedaba unos 4 m detrás de Sufragio y cubría la franja arbolada); dos patios abiertos a ±1 m; altura 4.0 m; vanos casa de un nivel en Sufragio y Abasolo; color de muro.",
  unchanged:"Registro de inventario (evidence/C3-09/20261006-01-cierre.json, ±3 m) conservado como registro.",
  terrain:"Franja al pie del cerro: el terreno sube hacia el cerro y a lo largo de Felipe Salido; pendiente no medida (la aérea no da cotas). El edificio queda sobre el nivel actual del suelo del mundo, sin terrazas ni taludes.",
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según las fotos.'}},
 note:'124/C3-09: aérea + fachada tipológica (sin foto de calle).'}]};

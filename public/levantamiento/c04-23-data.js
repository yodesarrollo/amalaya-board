// 23 / C1-10 / C04 · cuadra 6 · MODELADO CON AÉREA: DOS CUERPOS JUNTO A ROSALES (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C04.jpg). Las fotos de calle de C04 (Hidalgo H02/H03, dic-2023) muestran
// sólo los locales 21 y 22 del frente norte; este cuerpo queda detrás de árboles.
//
// La planta de inventario de C1-10 (±3 m) era una caja de 6.2 m que cubría también el
// terreno oscuro (patio o sombra) entre este cuerpo y el ala norte de D1-01. La aérea
// muestra dos techos claros separados por un pasillo oscuro de 1.4 m: uno angosto al
// poniente (mediana #d8daca) y otro mayor sobre Rosales (mediana #d2d1c2, más moteado en
// su mitad norte) con una mancha oscura redonda (tinaco) y una franja oscura en su borde
// sur. Se trazan a ±1 m; el frente a Rosales queda 0.25 m dentro de la línea de lote del
// ajuste visual (la aérea lo pone unos 0.4 m más al oriente). El ancla del registro cae
// en el cuerpo de Rosales. Altura: tipológica, 4.0 m (mediana de frentes de un nivel del
// centro con Street View; ±0.7 m); la aérea no da una medida de altura. Fachada: casa de
// un nivel sobre Rosales (puerta y ventanas con reja); caras interiores lisas. Color de
// muro estimado.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d8cdb3',pretil='#ddd5c2';
const seccion=(part,points,roofColor,facades=[],roofDetails=[])=>({part,points,height:4.0,color:muro,roofColor,parapet:true,parapetColor:pretil,facades,roofDetails});
export const C04_23={block:'C04',evidence:'C04/20261110-modelado',buildings:[{
 id:'C1-10',height:4.0,color:muro,roofColor:'#d2d1c2',uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C04.jpg','calco/referencia.webp','cuadras/C04-inventario.jpg','evidence/C1-10/20261006-01-cierre.json','evidence/C04/20261110-modelado/ficha.json'],
 // Aristas en el orden escrito (normalizeSections); la de Rosales (arista 1 de
 // 23-oriente) sale de frentes-calle-lib.mjs contra la banqueta de C04.
 sections:[
  seccion('23-oeste',[[-226.1,68.8],[-223.1,68.5],[-222.9,77.2],[-225.9,77.4]],'#d8daca'),
  seccion('23-oriente',[[-221.7,67.2],[-214.11,67],[-212.57,78.2],[-219.5,78.6],[-219.6,74.8],[-221.4,74.8]],'#d2d1c2',
   [{edge:1,tipo:'casa',puertas:['centro']}],
   [tinaco(-217.4,73.4),ventila(-215,77.2,1.6,.7)])],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:2},
 hypothesis:{id:'H23-01',status:'modelado con aérea en dos cuerpos y fachada tipológica sobre Rosales',measured:false,photoreal:false,generic:false,
  observed:'Dos techos claros separados por un pasillo oscuro de 1.4 m: cuerpo angosto al poniente (mediana #d8daca) y cuerpo mayor sobre Rosales (mediana #d2d1c2, moteado al norte) con una mancha oscura redonda y una franja oscura en su borde sur; terreno oscuro (patio o sombra) entre este cuerpo y el ala norte de D1-01; colores medidos en la aérea.',
  estimated:'Altura de 4.0 m por tipología, contornos a ±1 m, frente a Rosales recortado a 0.25 m de la línea de lote del ajuste visual, tinaco y equipo de azotea en las manchas oscuras con medidas típicas, vanos por tipología casa de un nivel sobre Rosales y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de C1-10; locales 21 y 22 (foto de Hidalgo, ronda 2) y demás vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'23/C1-10: dos cuerpos de un nivel con pasillo intermedio y frente de casa sobre Rosales; aérea + fachada tipológica (sin foto de calle).'}]};

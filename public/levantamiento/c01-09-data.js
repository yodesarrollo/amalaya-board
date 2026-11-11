// 09 / B1-07 / C01 · cuadra 3 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C01.jpg). No hay foto de calle de C01 en el repositorio.
//
// La planta de inventario de B1-07 («gran cubierta con entrantes», ±3 m) dibujaba como techo el
// estacionamiento de Yáñez–Obregón: la aérea muestra un piso claro con unos veinte autos a cielo
// abierto, una barda al norte y, en el borde sur, una caseta de dos cubiertas (blanca y café, con
// tinacos) junto a Yáñez y una caseta blanca pequeña más al poniente; entre ambas queda el acceso.
// Como EB-NE, el recinto queda abierto: se modelan la barda norte y las tres casetas como
// secciones (±1 m) y el piso del estacionamiento no lleva cubierta. La planta de inventario queda
// como registro. Al oriente y al poniente, entre los autos y la banqueta, la aérea muestra franjas
// oscuras con borde claro que pueden ser jardinera, arbolado o sombra de una barda: no se distingue
// (y la línea clara del oriente cae sobre la banqueta trazada), así que ahí no se modela barda.
// Al norte de la barda, fuera del inventario, hay otras cubiertas (ver docs/C01-MODELADO.md).
// Estimado: altura de las casetas 4.0 m por tipología; barda de 2.4 m; vanos por tipología casa de
// un nivel en las caras de las casetas a Yáñez y Obregón; color de muro.
// En esta aérea las bandas oscuras al poniente y al norte de los cuerpos y de la barda son
// sombra o arbolado: no se usan como medida y las alturas son tipológicas.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d6ccb4';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],o={})=>({part,points,height:o.height??4.0,color:o.color??muro,roofColor,parapet:o.parapet??true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C01_09={block:'C01',evidence:'C01/20261110-modelado',buildings:[{
 id:'B1-07',height:4.0,color:muro,roofColor:'#e0ddca',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C01.jpg','calco/referencia.webp','evidence/B1-07/20261006-01-cierre.json','evidence/C01/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  seccion('09-barda-norte',[[-120.8,-13.85],[-92.6,-22.3],[-92.51,-22.01],[-120.71,-13.56]],'#e6e2d6',[],[],{height:2.4,parapet:false,color:'#ddd6c5'}),  // techo medido #edead6
  seccion('09-caseta-poniente',[[-111,8.9],[-106.7,8.6],[-106.6,11.3],[-111,11.6]],'#e6e2d6',[{edge:2,tipo:'casa',puertas:['centro']}],[]),  // techo medido #f3f3e8
  seccion('09-caseta-blanca',[[-100.2,2.9],[-97.5,2.6],[-97.4,9],[-100,9.2]],'#dfddcd',[{edge:2,tipo:'casa',sinPuerta:true}],[tinaco(-98.3,3.4),tinaco(-98,8.3)]),  // techo medido #e5e3d3
  seccion('09-caseta-cafe',[[-97.5,2.6],[-89.4,1.6],[-89.4,8.9],[-97.4,9]],'#87725b',[{edge:1,tipo:'casa',puertas:['centro']},{edge:2,tipo:'casa',sinPuerta:true}],[tinaco(-95.9,4.5)])  // techo medido #87725b
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'comercio',fotoCalle:false,secciones:4},
 hypothesis:{id:'H09-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Estacionamiento a cielo abierto de Yáñez–Obregón con unos veinte autos sobre piso claro: barda al norte, caseta de dos cubiertas (blanca y café, con tinacos) junto a Yáñez y caseta blanca pequeña más al poniente, todas sobre Obregón, con el acceso entre ambas; al oriente y al poniente, franjas oscuras con borde claro (jardinera, arbolado o sombra de barda; no se distingue).',
  estimated:'Altura 4.0 m por tipología en las casetas y barda de 2.4 m (±0.7 m), contornos a ±1 m, vanos por tipología casa de un nivel en las caras de las casetas a Yáñez y Obregón, color de muro y remates.',
  unchanged:'Planta de inventario (±3 m, «gran cubierta») conservada como registro; el piso del estacionamiento queda sin cubierta; registro individual de B1-07; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'9/B1-07: estacionamiento abierto con barda norte y tres casetas; aérea + fachada tipológica (sin foto de calle).'}]};

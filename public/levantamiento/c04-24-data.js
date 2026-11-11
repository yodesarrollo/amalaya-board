// 24 / D1-01 / C04 · cuadra 6 · MODELADO CON AÉREA: CASA DE DOS PATIOS (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C04.jpg). No hay foto de calle de este tramo de Rosales.
//
// La planta de inventario de D1-01 (±3 m, «cuerpo de cubiertas conectadas») era una caja
// de 6.2 m que llenaba también el terreno claro del poniente y la masa de árboles. La aérea
// muestra un conjunto blanco continuo (mediana #f4f2e7): ala norte de 7 m de fondo, masa
// central con tinacos y equipos, crujía sobre Rosales y una casa al sureste; dentro, un
// patio grande de piso claro (#d0ccbc) con bandas oscuras al norte y al poniente (corredor
// o sombra; quedan dentro del patio abierto) y otro patio menor al sureste (#a49d8c). Al
// poniente se apoya un cuerpo blanco rectangular separado por una línea de pretil; va en la
// misma sección (mismo techo y altura) para que la cuadra quepa en el techo fijo de la vista
// ligera, y se pierde sólo esa línea de pretil. Se traza a ±1 m. Sobre Rosales la aérea pone el techo hasta 2.5 m más allá de la línea de lote del
// ajuste visual (posible alero, o desfase de la banqueta): el frente se deja 0.25–1.1 m
// dentro del lote y el patio grande se recorre ~1.2 m al poniente para conservar una crujía
// de 1–1.4 m. El ancla del registro cae en la masa central. Se dejan fuera, sin inventar
// volumen: la cubierta clara del noroeste (fuera de toda planta de inventario; posible
// estacionamiento techado) y la mancha gris-oscura al sur de la masa central (árbol o
// sombra). Altura: tipológica, 4.0 m (±0.7 m); la aérea no da una medida de altura.
// Fachada: casa de un nivel sobre Rosales con dos puertas (patio grande y casa del
// sureste); caras interiores y del poniente lisas. Color de muro estimado. Equipos: dos
// tinacos y dos equipos bajos (el contorno oscuro de 3 × 1.6 m al norte del patio va como uno).
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d8cdb3',pretil='#ddd5c2',blanco='#e6e2d6';
const patio=[[-219.4,87.5],[-212.6,86.5],[-211.4,99.4],[-218.2,100.4]];
const patioSureste=[[-215.3,104.7],[-210.5,104],[-210.1,112.2],[-214.9,112.9]];
export const C04_24={block:'C04',evidence:'C04/20261110-modelado',buildings:[{
 id:'D1-01',height:4.0,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C04.jpg','calco/referencia.webp','cuadras/C04-inventario.jpg','evidence/D1-01/20261006-01-cierre.json','evidence/C04/20261110-modelado/ficha.json'],
 // Aristas en el orden escrito (normalizeSections); la de Rosales (arista 1 de
 // 24-principal) sale de frentes-calle-lib.mjs contra la banqueta de C04.
 sections:[
  {part:'24-principal',points:[[-231,82.2],[-212.44,79.1],[-208.35,113.3],[-217.5,114.7],[-220.1,110.2],[-220.2,103.3],[-233.3,103.2],[-234.1,95.3],[-229.6,95]],
   holes:[patio,patioSureste],height:4.0,color:muro,roofColor:blanco,parapet:true,parapetColor:pretil,
   facades:[{edge:1,tipo:'casa',puertas:[3,9]}],
   roofDetails:[ventila(-227,90,1.6,1.2),ventila(-222.6,91,3,1.6),tinaco(-226.4,95.5),tinaco(-226.7,100.3)]}],
 // Piso del patio grande visto en la aérea (mediana #d0ccbc).
 yardSurface:{points:patio,color:'#d0ccbc'},
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H24-01',status:'modelado con aérea en una sección con dos patios abiertos y fachada tipológica sobre Rosales',measured:false,photoreal:false,generic:false,
  observed:'Conjunto blanco continuo (mediana #f4f2e7): ala norte, masa central con dos tinacos y equipos, crujía sobre Rosales y casa al sureste; patio grande de piso claro (#d0ccbc) con bandas oscuras al norte y al poniente, patio menor al sureste (#a49d8c); cuerpo blanco rectangular adosado al poniente tras una línea de pretil; terreno claro abierto y árboles entre el conjunto y Pedro Moreno; colores medidos en la aérea.',
  estimated:'Altura de 4.0 m por tipología, contornos y patios a ±1 m, cuerpo poniente en la misma sección (sin su línea de pretil), frente a Rosales dentro de la línea de lote del ajuste visual (la aérea lo pone hasta 2.5 m más al oriente), patio grande recorrido ~1.2 m al poniente, bandas oscuras del patio tratadas como parte abierta, equipos de azotea con medidas típicas, vanos por tipología casa de un nivel sobre Rosales con dos puertas y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D1-01; cubierta clara del noroeste y mancha oscura al sur sin modelar; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'24/D1-01: casa de un nivel con patio grande y patio al sureste, crujía sobre Rosales y cuerpo poniente en una sección; aérea + fachada tipológica (sin foto de calle).'}]};

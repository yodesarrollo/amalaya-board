// 25 / D1-02 / C04 · cuadra 6 · MODELADO CON AÉREA: CONJUNTO BAJO JUNTO A PALIZA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C04.jpg). No hay foto de calle de Paliza ni de este tramo de Rosales.
//
// La planta de inventario de D1-02 (±3 m, «conjunto de cubierta baja junto a Paliza; se
// excluye la explanada de acceso») era una caja de 6.2 m. La aérea muestra dos cuerpos
// blancos (medianas #f5f1e6 y #faf8ef): uno grande al poniente, con un tinaco y equipos, y
// otro sobre Rosales; entre ellos una franja oscura de 4 m al poniente
// del cuerpo de Rosales (patio en sombra, #5b5e54) y, al norte de ese cuerpo, un patio
// oscuro abierto a Rosales (#3f4945). Al sur los dos cuerpos rematan en una franja de techo
// con una hilera de manchas, que sigue el borde sur de la planta de inventario; la
// explanada de acceso hacia Paliza queda abierta. Se trazan a ±1 m; el frente a Rosales
// queda 0.3 m dentro de la línea de lote del ajuste visual. El saliente de 3 × 4 m al norte
// del cuerpo poniente y los tinacos a su pie se omiten para que la cuadra quepa en el techo
// fijo de la vista ligera. El ancla del registro cae en el cuerpo poniente. Altura: 3.2 m porque el inventario lo registra como cubierta baja; la
// aérea no da una medida de altura. Fachadas: casa de un nivel sobre Rosales y en las caras
// sur, visibles desde Paliza a través de la explanada; caras interiores lisas. Color de
// muro estimado.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d8cdb3',pretil='#ddd5c2',blanco='#e6e2d6';
const seccion=(part,points,facades=[],roofDetails=[])=>({part,points,height:3.2,color:muro,roofColor:blanco,parapet:true,parapetColor:pretil,facades,roofDetails});
export const C04_25={block:'C04',evidence:'C04/20261110-modelado',buildings:[{
 id:'D1-02',height:3.2,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C04.jpg','calco/referencia.webp','cuadras/C04-inventario.jpg','evidence/D1-02/20261006-01-cierre.json','evidence/C04/20261110-modelado/ficha.json'],
 // Aristas en el orden escrito (normalizeSections); la de Rosales (arista 3 de
 // 25-oriente) sale de frentes-calle-lib.mjs contra la banqueta de C04; la arista 5 de
 // 25-principal es su cara sur hacia la explanada de Paliza.
 sections:[
  seccion('25-principal',[[-236.7,121.9],[-219.1,119.3],[-214.6,118.7],[-214.5,123.1],[-218.4,123.4],[-217.6,134.9],[-238.6,138.9],[-236.2,135.5]],
   [{edge:5,tipo:'casa',puertas:['centro']}],
   [tinaco(-233.9,122.6),ventila(-228.5,125.5,1,.8),ventila(-227.6,128.4,1,.8)]),
  seccion('25-oriente',[[-214.6,126.6],[-210.6,126.2],[-210.4,124.1],[-206,123.9],[-204.7,132.3],[-217.6,134.9],[-217.76,132.6],[-214.5,132.4]],
   [{edge:3,tipo:'casa',puertas:['centro']},{edge:4,tipo:'casa',puertas:['centro']}])],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:2},
 hypothesis:{id:'H25-01',status:'modelado con aérea en dos cuerpos bajos y fachadas tipológicas',measured:false,photoreal:false,generic:false,
  observed:'Dos cuerpos blancos (medianas #f5f1e6 y #faf8ef): el poniente con un saliente al norte, un tinaco y equipos; el de Rosales separado por una franja oscura de 4 m (patio en sombra) y con un patio oscuro al norte abierto a Rosales; franja de techo al sur con una hilera de manchas sobre el borde sur de la planta de inventario; explanada abierta hacia Paliza; colores medidos en la aérea.',
  estimated:'Altura de 3.2 m por la cubierta baja del inventario, contornos a ±1 m, franja sur del mismo nivel que los cuerpos, patios tratados como abiertos, frente a Rosales a 0.3 m de la línea de lote del ajuste visual, equipos de azotea con medidas típicas, vanos por tipología casa de un nivel sobre Rosales y en las caras sur y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D1-02; explanada de acceso abierta; saliente norte de 3 × 4 m y tinacos a su pie sin modelar (presupuesto de la vista ligera); vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'25/D1-02: conjunto bajo en dos cuerpos con patios en sombra, frente de casa sobre Rosales y caras sur hacia la explanada de Paliza; aérea + fachada tipológica (sin foto de calle).'}]};

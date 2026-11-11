// 106 / C2-12 / C19 · cuadra 29 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// La planta de inventario de C2-12 (±3 m, un contorno con dos huecos) no coincidía con el
// conjunto que muestra la aérea: quedaba corta hacia Sufragio Efectivo y Garmendia y sus huecos
// no caían sobre los patios. La aérea muestra once cuerpos de un nivel alrededor de un patio
// central arbolado: cada cuerpo es una sección propia (etapa 07, sólidos y vacíos). El patio
// central, el patio oscuro, el pozo de luz, el carril de estacionamiento del poniente y la
// explanada sur quedan abiertos; la planta de inventario se conserva como registro.
// Trazo a ±1 m sobre la aérea (cuadrícula de 1 m); techos con su color mediano: blancos, techo
// rojo, ala gris al oriente, lámina gris verdosa y lámina azulada; tinacos en los puntos vistos.
// Fachadas: tipología «casa de un nivel» sobre Sufragio Efectivo, Garmendia y el carril de
// estacionamiento; barda con portón donde la lámina gris llega a Garmendia; caras a patios lisas.
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d6ccb4';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],parapet=true)=>({part,points,height:4.0,color:muro,roofColor,parapet,parapetColor:'#ddd5c2',facades,roofDetails});
export const C19_106={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'C2-12',height:4.0,color:muro,roofColor:'#e6e2d6',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/C2-12/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de scripts/frentes-calle-lib.mjs (banqueta de C19) y se prueban en pruebas-fabrica.
 sections:[
  seccion('106-ala-oeste',[[35.4,66.9],[40.8,65],[40.8,63.68],[50,60.99],[52.9,76.9],[44.3,77],[43.4,80.4],[39.1,81]],'#e6e2d6',[{edge:0,tipo:'casa',sinPuerta:true},{edge:2,tipo:'casa',puertas:['centro']},{edge:7,tipo:'casa',puertas:[1,3]}],[tinaco(43.6,63.9),tinaco(48,62.6),tinaco(45.6,66),tinaco(42.3,68.4),tinaco(39,70.8),tinaco(45.6,71.6),tinaco(45.5,73.7)]),  // techo medido #f9f5ee
  seccion('106-crujia-centro',[[50,60.99],[55,59.53],[55.5,64],[57.3,70.3],[60,83.2],[60.6,88.7],[56.4,88.8],[56,81.5],[49.4,81.5],[49.3,77],[52.9,76.9]],'#e6e2d6',[{edge:0,tipo:'casa',puertas:['centro']}],[tinaco(51.3,78.1),tinaco(55.9,79.7)]),  // techo medido #fbf9f2
  seccion('106-franja-norte',[[55,59.53],[70.9,54.88],[70.9,60.9],[55.5,64]],'#e6e2d6',[{edge:0,tipo:'casa',puertas:[1,3]}],[tinaco(60.2,59.1),tinaco(65.2,58.1)]),  // techo medido #faf5ed
  seccion('106-techo-rojo',[[55.5,64],[70.9,60.9],[71.2,67],[57.3,70.3]],'#dda390',[],[],false),  // techo medido #dda390
  seccion('106-ala-este',[[70.9,54.88],[74.07,53.97],[80.6,77.5],[74.3,79.2],[71.2,67],[70.9,60.9]],'#dadad1',[{edge:0,tipo:'casa',sinPuerta:true},{edge:1,tipo:'casa',puertas:[2,5]}],[tinaco(76.6,73)]),  // techo medido #dadad1
  seccion('106-cuarto-patio',[[64.9,68.6],[68.6,67.7],[69.3,73.6],[65.5,74.3]],'#cec7b4',[],[tinaco(67.7,70.9)],false),  // techo medido #cec7b4
  seccion('106-bloque-sureste',[[64,77.4],[71.5,74.8],[72.6,80.3],[65.2,82.9]],'#e6e2d6'),  // techo medido #fdfcf7
  seccion('106-lamina-gris',[[65.2,82.9],[72.6,80.3],[74.3,79.2],[80.6,77.5],[82.5,84.5],[67.6,88.8]],'#a0b1a1',[{edge:3,tipo:'muro'}],[],false),  // techo medido #a0b1a1
  seccion('106-sur-blanco',[[60,83.2],[65.2,83],[67.5,88.9],[61.2,91],[60.6,88.7]],'#e6e2d6',[],[tinaco(61.3,85.4),tinaco(61.6,87.8)]),  // techo medido #fbfbf2
  seccion('106-lamina-azul',[[49.9,92.4],[56.4,88.8],[60.6,88.7],[61.2,91],[61.4,92],[53,95.3]],'#cfd6ce',[],[],false),  // techo medido #cfd6ce
  seccion('106-nave-suroeste',[[39.6,84.8],[47.4,82.4],[49.7,92.2],[53,95.3],[52.6,98.4],[48.6,98.6],[44.4,100.4]],'#deddcf',[{edge:6,tipo:'casa',puertas:[1,3]}])  // techo medido #eae8da
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:11},
 hypothesis:{id:'H106-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Conjunto de once cuerpos de un nivel alrededor de un patio central arbolado: ala poniente y crujía central de azoteas blancas con tinacos, franja blanca y techo rojo sobre Sufragio Efectivo, ala gris al oriente sobre Garmendia, cuarto y bloque blanco dentro del patio, lámina gris verdosa hasta Garmendia, cuerpo blanco sur, lámina azulada, nave clara al suroeste y un patio oscuro; carril de estacionamiento al poniente y explanada sur abiertos; colores de techo medidos en la aérea.',
  estimated:'Alturas de 4.0 m por tipología en todas las secciones, contornos a ±1 m, vanos por tipología casa de un nivel en Sufragio Efectivo, Garmendia y el carril de estacionamiento, barda con portón en la lámina gris, color de muro y remates.',
  unchanged:'Planta de inventario conservada como registro; registro individual de C2-12; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'106/C2-12: conjunto de once cuerpos alrededor del patio central; aérea + fachada tipológica (sin foto de calle).'}]};

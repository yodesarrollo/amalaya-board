// 112 / D2-21 / C15 · cuadra 30 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C15.jpg). No hay foto de calle de C15 en el repositorio.
//
// La planta de inventario de D2-21 (±3 m, cuadrilátero girado) no coincide con las
// cubiertas: deja fuera la esquina noroeste de la azotea blanca y cubre el jardín del
// sur. La aérea muestra, en la esquina Felipe Salido–Juan Álvarez, una azotea blanca en
// L, una cubierta rosada al oriente separada por un muro diagonal, una cubierta clara al
// sureste y un anexo crema. Cada cuerpo es una sección (sólidos y vacíos, como 94/D2-20)
// trazada a ±1 m sobre la aérea (cuadrícula de 1 m); el jardín queda abierto y la planta
// de inventario se conserva como registro.
// Alturas: tipológicas, 4.0 m (mediana de frentes de un nivel del centro con Street View;
// ±0.7 m). En esta aérea el sol viene del este: la banda oscura al norte es asfalto y
// arbolado, no sombra de altura. Fachadas: tipología «casa de un nivel» en las caras a la
// calle y en las que quedan a menos de 4 m de la banqueta; color de muro estimado.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d8cdb3',blanco='#e6e2d6';
const seccion=(part,points,roofColor,facades=[],roofDetails=[])=>({part,points,height:4.0,color:muro,roofColor,parapet:true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C15_112={block:'C15',evidence:'C15/20261110-modelado',buildings:[{
 id:'D2-21',height:4.0,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C15.jpg','calco/referencia.webp','evidence/D2-21/20261006-01-cierre.json','evidence/C15/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de frentes-calle-lib.mjs contra la banqueta de C15.
 sections:[
  // Azotea blanca en L (mediana #faf5ec): cuerpo norte retirado 2 m de Juan Álvarez y
  // cuerpo sur al paño de la banqueta; el muro diagonal la separa de la cubierta rosada.
  seccion('112-blanco',[[7.9,177.5],[12.5,177.5],[12.5,178.3],[14.9,178.3],[14.9,180.2],[16.5,184.2],[18.2,188.9],[5.9,188.9],[5.9,184.2],[7.9,184.2]],blanco,
   [{edge:0,tipo:'casa',sinPuerta:true},{edge:2,tipo:'casa',sinPuerta:true},{edge:7,tipo:'casa',sinPuerta:true},{edge:9,tipo:'casa',puertas:['centro']}]),
  // Cubierta rosada (mediana #d4b8aa) con un tinaco en su esquina noreste.
  seccion('112-rojo',[[14.9,178.3],[21.0,178.3],[21.0,184.1],[16.5,184.2],[14.9,180.2]],'#d4b8aa',
   [{edge:0,tipo:'casa',puertas:['centro']}],
   [tinaco(20.2,179.3)]),
  // Cubierta clara al sureste (mediana #e3decc) y anexo crema (mediana #dcd2b1).
  seccion('112-sureste',[[16.5,184.2],[21.9,184.1],[21.9,188.3],[18.0,188.3]],'#e3decc'),
  seccion('112-crema',[[18.6,188.6],[22.6,188.6],[22.6,191.8],[18.6,191.8]],'#dcd2b1')
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:4},
 hypothesis:{id:'H112-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Esquina Felipe Salido–Juan Álvarez: azotea blanca en L (cuerpo norte retirado unos 2 m de Juan Álvarez, cuerpo sur al paño), cubierta rosada al oriente separada por un muro diagonal, cubierta clara al sureste, anexo crema y un tinaco; jardín arbolado al sur; colores de techo medidos en la aérea.',
  estimated:'Alturas de 4.0 m por tipología en las cuatro secciones, contornos a ±1 m, pertenencia de la cubierta rosada, la clara y el anexo crema al registro D2-21 por contigüidad con su planta de inventario, vanos por tipología casa de un nivel y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D2-21; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'112/D2-21: esquina Felipe Salido–Juan Álvarez en cuatro cuerpos; aérea + fachada tipológica (sin foto de calle).'}]};

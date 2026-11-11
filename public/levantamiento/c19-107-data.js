// 107 / D2-11 / C19 · cuadra 29 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: sobre Juan Álvarez, cuerpo blanco continuo desde la esquina (franja
// angosta al frente), un bloque blanco detrás y una cubierta gris con franjas al sur; un tinaco
// en la franja del frente. La planta de inventario (±3 m) empezaba 7 m al sur de la esquina y
// dejaba sobre la calle un hueco que la aérea muestra techado: tres secciones trazadas a ±1 m;
// el patio oscuro del norte y el jardín arbolado al oriente quedan abiertos.
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d4cab3';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],parapet=true)=>({part,points,height:4.0,color:muro,roofColor,parapet,parapetColor:'#ddd5c2',facades,roofDetails});
export const C19_107={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'D2-11',height:4.0,color:muro,roofColor:'#dfdccf',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/D2-11/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de scripts/frentes-calle-lib.mjs (banqueta de C19) y se prueban en pruebas-fabrica.
 sections:[
  seccion('107-frente',[[2.3,85.9],[6.5,85.6],[6.5,101.1],[2.3,101.1]],'#dfdccf',[{edge:3,tipo:'casa',puertas:[1,3]}],[tinaco(3.9,91.8)]),  // techo medido #ebe8da
  seccion('107-blanco',[[6.5,90.4],[16.2,90],[17.3,95.9],[6.5,96.4]],'#e6e2d6'),  // techo medido #fbf9f1
  seccion('107-lamina',[[6.5,96.4],[17.3,95.9],[18,100],[15.1,100.3],[14.8,101],[6.5,101.1]],'#c3bdab',[],[],false)  // techo medido #c3bdab
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:3},
 hypothesis:{id:'H107-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Frente continuo de un nivel sobre Juan Álvarez desde la esquina, bloque blanco detrás y cubierta gris con franjas al sur; un tinaco en la franja del frente; patio oscuro al norte y jardín arbolado al oriente.',
  estimated:'Altura 4.0 m por tipología, contornos a ±1 m, vanos por tipología casa de un nivel sobre Juan Álvarez, color de muro.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; registro individual; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'107/D2-11: frente de Juan Álvarez al sur de la esquina; aérea + fachada tipológica (sin foto de calle).'}]};

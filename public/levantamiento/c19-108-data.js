// 108 / D2-12 / C19 · cuadra 29 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: cuerpo en L sobre Juan Álvarez con azoteas blancas (mediana #f3f1e4) y,
// pegado a su lado oriente, un bloque blanco con tinacos que la planta de inventario (±3 m)
// dejaba fuera. Dos secciones trazadas a ±1 m; el jardín y el patio del sur quedan abiertos.
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d9cfb9';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],parapet=true)=>({part,points,height:4.0,color:muro,roofColor,parapet,parapetColor:'#ddd5c2',facades,roofDetails});
export const C19_108={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'D2-12',height:4.0,color:muro,roofColor:'#e6e2d6',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/D2-12/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de scripts/frentes-calle-lib.mjs (banqueta de C19) y se prueban en pruebas-fabrica.
 sections:[
  seccion('108-cuerpo',[[2.8,101.6],[14.7,101.3],[15,112.5],[10.3,112.7],[10.4,116.4],[2.7,116.8]],'#e6e2d6',[{edge:5,tipo:'casa',puertas:[1,3]}],[tinaco(13.9,104)]),  // techo medido #f4f1e4
  seccion('108-blanco-este',[[15.3,100.5],[23.6,99.9],[23.9,106.3],[15.4,106.6]],'#e6e2d6',[],[tinaco(16.3,102.1),tinaco(17.3,104.4)])  // techo medido #f4f5ee
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:2},
 hypothesis:{id:'H108-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo en L de un nivel sobre Juan Álvarez con azoteas blancas y, a su oriente, bloque blanco con tinacos; jardín arbolado y patio del sur abiertos.',
  estimated:'Altura 4.0 m por tipología, contornos a ±1 m, vanos por tipología casa de un nivel sobre Juan Álvarez, color de muro.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; registro individual; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'108/D2-12: cuerpo en L de Juan Álvarez y bloque oriental; aérea + fachada tipológica (sin foto de calle).'}]};

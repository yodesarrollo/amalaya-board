// 30 / B2-01 / C30 · cuadra 8 · MODELADO CON FOTO DE CALLE SOBRE LA PLANTA REGISTRADA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Foto: Street View dic-2023 desde Garmendia (evidence/c30-cierre-20261008/c30-garmendia-medio-20261008.jpg, rumbo 270):
// cuerpo turquesa de un nivel con cortina metálica, ventana con reja naranja, puerta con reja oscura y
// un vano alto pequeño, bandas malva. Fachada, altura 4.6 m y planta del paquete C30 del 8-oct. Aérea
// Esri z19: cubierta clara (#f5f1e5 en la parte despejada) con tres equipos menores; la parte sur de la
// planta queda bajo una mancha oscura (árbol, patio o cubierta oscura; no se distingue).
import {ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
export const C30_30={
 id:'B2-01',height:4.6,color:'#76b7ab',roofColor:'#e6e2d6',uncertainty:.9,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c30-cierre-20261008/c30-garmendia-medio-20261008.jpg','calco/referencia.webp','ajuste-visual/C30.jpg','evidence/C30/20261110-modelado/ficha.json'],
 // Arista 1 = Garmendia (12.75 m) en el orden de la planta registrada.
 facades:[{edge:1,plain:true,bays:[{x:1.5,w:1,h:2.45,b:0,rect:true,door:true,frameColor:'#618a7c'},{x:4.5,w:2.8,h:1.8,b:.65,rect:true,frameColor:'#bbad79'},{x:9,w:3.7,h:2.7,b:0,rect:true,noBars:true,fillColor:'#414842',shutter:true},{x:5,w:.8,h:.7,b:3.25,rect:true,frameColor:'#bdad79'}],bands:[{y:2.88,h:.17,d:.45,color:'#846d68'},{y:4.5,h:.17,d:.16,color:'#977b72'}]}],
 roofDetails:[ventila(39.2,-62.7),ventila(42.9,-62.6),ventila(39.7,-60.3)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H30-01',status:'modelado con foto de calle sobre la planta registrada',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo turquesa de un nivel en Garmendia (Street View dic-2023): cortina metálica, ventana con reja naranja, puerta con reja oscura y vano alto pequeño; bandas malva. En la aérea, cubierta clara con tres equipos menores y una mancha oscura al sur.',
  estimated:'Posición y medida de vanos (paquete C30, ±0.5 m), color exacto y medidas de los equipos; la mancha oscura al sur de la cubierta (árbol, patio o cubierta oscura) no se distingue y la cubierta se conserva continua.',
  unchanged:'Planta registrada (±3 m), altura 4.6 m y fachada de Garmendia del paquete C30 del 8-oct; caras interiores sin vanos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'30/B2-01: cuerpo turquesa bajo con cortina, ventana, puerta y vano alto (Street View dic-2023); cubierta clara con tres equipos. Medidas visuales, no métricas.'
};

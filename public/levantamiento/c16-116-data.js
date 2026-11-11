// 116 / D3-16 / C16 · cuadra 31 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C16.jpg). No hay foto de calle de C16 en el repositorio.
//
// Visto en la aérea: casa de patio en la esquina Garmendia–Felipe Salido, azotea blanca
// (mediana #faf8ef; ala oriente crema #f7f2e8) con un patio interior con vegetación (verde
// grisáceo, mediana #77867c), dos tinacos y tres equipos pequeños grises.
// Estimado: fachada por tipología (fábrica de fachadas) en las caras a Garmendia y en la cara
// norte, visible desde Felipe Salido; color de muro y altura (4.0 m: mediana de los frentes de
// un nivel del centro con Street View); medidas visuales, no métricas.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
export const C16_116={block:'C16',evidence:'C16/20261110-modelado',buildings:[{
 id:'D3-16',height:4.0,color:'#d8ccb3',roofColor:'#e6e2d6',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 // Patio trazado a ±1 m sobre la aérea: sustituye al hueco de inventario, que quedaba
 // ~1 m al poniente y 2 m corto al norte. El piso del patio lleva el verde medido.
 holes:[[[63.6,178.0],[66.0,178.3],[67.8,180.5],[66.8,181.0],[66.3,185.0],[64.3,187.2],[63.0,184.8],[63.7,181.2]]],
 yardSurface:{points:[[63.9,178.4],[65.8,178.7],[67.1,180.4],[66.4,181.1],[65.9,184.9],[64.3,186.6],[63.5,184.7],[64.0,181.3]],color:'#738276'},
 sources:['ajuste-visual/C16.jpg','calco/referencia.webp','evidence/D3-16/20261006-01-cierre.json','evidence/C16/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta. 5 y 6 dan a Garmendia (frentes-calle-lib.mjs,
 // banqueta de C16); 0 da a Felipe Salido a 4.8 m de la banqueta: la planta de inventario
 // (±3 m) queda retranqueada y la aérea muestra la cubierta a unos 2 m de la banqueta.
 facades:[{edge:6,tipo:'casa',puertas:['centro']},{edge:5,tipo:'casa',sinPuerta:true},{edge:0,tipo:'casa',puertas:['fin']}],
 roofDetails:[tinaco(69.8,181.1),tinaco(65.3,190.8),ventila(64.3,189.6),ventila(63.0,181.2,.6,.6),ventila(69.4,192.7)],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H116-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Casa de patio en la esquina Garmendia–Felipe Salido: azotea blanca con ala oriente crema, patio interior con vegetación, dos tinacos y tres equipos pequeños grises; franja poniente de cubierta tostada (#c3b5a2) sobre Garmendia.',
  estimated:'Altura 4.0 m por tipología, patio a ±1 m, vanos por tipología casa de un nivel en Garmendia y en la cara norte visible desde Felipe Salido, color de muro; la franja tostada no se separa como cuerpo propio.',
  unchanged:'Planta de inventario (±3 m) salvo el contorno del patio; registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'116/D3-16: aérea + fachada tipológica (sin foto de calle).'}]};

// 13 / B1-04 / C02 · cuadra 4 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C02.jpg). No hay foto de calle de B1-04 en el repositorio.
//
// Visto en la aérea: cuerpo intermedio sobre Pino Suárez (el inventario lo rotula «Yáñez»)
// con azotea blanca (mediana #f7f4ea), ala angosta al norte (#e9e4d6), un tinaco y dos equipos.
// Estimado: comercio de barrio por tipología en la cara a Pino Suárez y en el chaflán a menos
// de 4 m de la banqueta; color de muro y altura (4.0 m por tipología; antes 7.2 m estimada sin
// foto); medidas visuales, no métricas.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
// Tinaco de 0.95 m: en C02 los equipos quedan a 1 m o menos sobre la cubierta (pruebas-lamina).
const tinacoBajo=(x,z)=>({...tinaco(x,z),w:.95,h:.95,d:.95});
export const C02_13={block:'C02',evidence:'C02/20261110-modelado',buildings:[{
 id:'B1-04',height:4.0,color:'#d2d0c5',roofColor:'#e6e2d6',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C02.jpg','calco/referencia.webp','cuadras/C02-inventario.jpg','evidence/B1-04/20261006-01-cierre.json','evidence/C02/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; 3 da a Pino Suárez (frentes-calle-lib.mjs) y 2,
 // el chaflán, queda a 2.9 m de la banqueta.
 facades:[{edge:3,tipo:'comercio'},{edge:2,tipo:'comercio'}],
 roofDetails:[tinacoBajo(-172.3,-12.4),ventila(-170.0,-6.4),ventila(-175.8,-7.1)],
 fabrica:{fecha:'2026-11-10',tipologia:'comercio',fotoCalle:false},
 hypothesis:{id:'H13-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo intermedio sobre Pino Suárez con azotea blanca, ala angosta al norte, un tinaco y dos equipos; colores medidos en la aérea.',
  estimated:'Altura 4.0 m por tipología (antes 7.2 m sin foto), comercio de barrio en Pino Suárez y en el chaflán, color de muro.',
  unchanged:'Planta de inventario (±3 m) y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'13/B1-04: aérea + fachada tipológica (sin foto de calle).'}]};

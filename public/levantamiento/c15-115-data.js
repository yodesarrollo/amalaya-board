// 115 / D2-24 / C15 · cuadra 30 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C15.jpg). No hay foto de calle de C15 en el repositorio.
//
// La planta de inventario de D2-24 (±3 m) quedaba unos 3 m al poniente de la azotea:
// cubría el jardín arbolado sobre Juan Álvarez y parte de las cubiertas del sur. La
// aérea muestra un cuerpo de azotea blanca de unos 14 × 8 m con seis tinacos, detrás del
// jardín. Se modela como una sección (como 94/D2-20) trazada a ±1 m sobre la aérea; el
// jardín queda abierto y la planta de inventario se conserva como registro.
// Altura: tipológica, 4.0 m (mediana de frentes de un nivel del centro con Street View;
// ±0.7 m). En esta aérea el sol viene del este; las sombras no se usan como medida.
// Fachada: casa de un nivel en la cara poniente, visible desde Juan Álvarez a través del
// jardín (a 4.5 m de la banqueta). Color de muro estimado.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d2c8b2';
export const C15_115={block:'C15',evidence:'C15/20261110-modelado',buildings:[{
 id:'D2-24',height:4.0,color:muro,roofColor:'#e4e0d2',uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C15.jpg','calco/referencia.webp','evidence/D2-24/20261006-01-cierre.json','evidence/C15/20261110-modelado/ficha.json'],
 // Aristas en el orden de la sección tal como está escrita (normalizeSections).
 sections:[{part:'115-blanco',points:[[10.0,192.3],[23.8,192.3],[23.8,200.0],[10.0,200.0]],
  height:4.0,color:muro,roofColor:'#e4e0d2',parapet:true,parapetColor:'#ddd5c2',
  facades:[{edge:3,tipo:'casa',puertas:['centro']}],
  roofDetails:[tinaco(11.0,193.8),tinaco(10.9,197.8),tinaco(15.3,195.4),tinaco(19.6,196.8),tinaco(20.7,198.0),tinaco(22.9,193.9)]}],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H115-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo de azotea blanca (mediana #e4e0d2) detrás del jardín arbolado de Juan Álvarez, con seis tinacos; cubiertas contiguas al sur fuera del inventario.',
  estimated:'Altura de 4.0 m por tipología, contorno a ±1 m, vanos por tipología casa de un nivel en la cara poniente y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D2-24; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'115/D2-24: cuerpo blanco detrás del jardín de Juan Álvarez; aérea + fachada tipológica (sin foto de calle).'}]};

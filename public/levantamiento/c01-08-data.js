// 08 / B1-06 / C01 · cuadra 3 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C01.jpg). No hay foto de calle de C01 en el repositorio.
//
// Visto en la aérea: cuerpo oriente del conjunto bancario en la esquina Serdán–Yáñez, azotea
// blanca (mediana #f8f7ef) con una hilera de ventilas, dos equipos grandes oscuros y otros menores;
// entre este cuerpo y 7/B1-05, una franja de cubierta gris verdosa (mediana #8c998b). La azotea
// rebasa unos 4 m al oriente el trazo de banqueta y el límite INEGI de C01 sobre Yáñez (la banqueta
// oriente de C01 quedó trazada sobre la cubierta; ver «sides» de C01 en cuadras.json): el cuerpo
// se modela hasta la banqueta trazada y esa franja queda como pendiente de la calle. Dos secciones
// trazadas a ±1 m; la planta de inventario queda como registro.
// Estimado: altura 4.0 m por tipología, frentes comerciales de un nivel hacia Serdán y Yáñez, puerta
// en la cubierta gris hacia Serdán, color de muro.
// En esta aérea las bandas oscuras al poniente y al norte de los cuerpos y de la barda son
// sombra o arbolado: no se usan como medida y las alturas son tipológicas.
import {ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#dcd6c8';
const aire=(x,z)=>({x,z,w:.9,h:.8,d:.7,color:'#9c9b93'});  // condensador de aire acondicionado visto en la aérea (medidas típicas)
const equipo=(x,z,w,d)=>({x,z,w,h:1.2,d,color:'#6f716c'});  // equipo grande de azotea visto en la aérea (altura estimada)
const seccion=(part,points,roofColor,facades=[],roofDetails=[],o={})=>({part,points,height:o.height??4.0,color:o.color??muro,roofColor,parapet:o.parapet??true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C01_08={block:'C01',evidence:'C01/20261110-modelado',buildings:[{
 id:'B1-06',height:4.0,color:muro,roofColor:'#e6e2d6',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C01.jpg','calco/referencia.webp','evidence/B1-06/20261006-01-cierre.json','evidence/C01/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  seccion('08-cuerpo',[[-114.6,-77.1],[-98.86,-79.78],[-94.56,-54.5],[-109.8,-53.2],[-110.8,-60.2]],'#e6e2d6',[{edge:0,tipo:'comercio'},{edge:1,tipo:'comercio'}],[ventila(-109.6,-74.4),ventila(-99.9,-76.2),ventila(-99.2,-72),ventila(-108.9,-70.2),ventila(-98.4,-67.9),ventila(-97.7,-63.6),aire(-111,-67.2),equipo(-106.3,-61.7,3.4,2.6),equipo(-102.3,-62.8,2,2),aire(-101.8,-57.4)]),  // techo medido #f8f7ef
  seccion('08-gris',[[-118.25,-71],[-113.45,-71],[-110.95,-60.2],[-110,-53.4],[-116.55,-52.3]],'#8c998b',[{edge:0,tipo:'casa',puertas:['centro']}],[])  // techo medido #8c998b
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'comercio',fotoCalle:false,secciones:2},
 hypothesis:{id:'H08-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo oriente del conjunto bancario en la esquina Serdán–Yáñez: azotea blanca con pretil, hilera de ventilas, dos equipos grandes y condensadores; franja de cubierta gris verdosa entre los dos cuerpos del banco; la azotea rebasa unos 4 m al oriente el trazo de banqueta de Yáñez.',
  estimated:'Altura 4.0 m por tipología en las dos secciones (±0.7 m), contornos a ±1 m con el borde oriente limitado a la banqueta trazada, frentes comerciales de un nivel (cortinas) hacia Serdán y Yáñez, puerta en la cubierta gris, altura de los equipos, color de muro y remates.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; registro individual de B1-06; banqueta y calzada de Yáñez sin cambio; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'8/B1-06: cuerpo oriente del conjunto bancario; aérea + fachada tipológica (sin foto de calle).'}]};

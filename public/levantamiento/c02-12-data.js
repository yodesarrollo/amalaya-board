// 12 / B1-03 / C02 · cuadra 4 · FRENTE HISTÓRICO OBSERVADO + AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto: Street View de enero de 2026 desde Rosales y Obregón, registrado en el paquete C02 de
// octubre (pórtico y dos franjas de ventanas de la antigua Procuraduría; 8.2 m), y la aérea
// (Esri World Imagery z19, calco/referencia.webp, y ajuste-visual/C02.jpg). No hay captura
// guardada en el repositorio.
//
// Se conservan sin cambio el frente observado, la altura y la planta del paquete de octubre
// (scripts/pruebas-paramento.mjs los fija). La aérea aporta el color de la azotea (mediana
// #f3efe5) y seis equipos. La prensa reporta la demolición del inmueble en 2026: el volumen
// queda como registro histórico rotulado hasta tener una foto actual.
import {ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const columns=[3.2,8.4,13.6,18.7];
const obregonFront=[.65,4.05].flatMap(b=>columns.map(x=>({x,w:2.55,h:1.85,b,rect:true,noBars:true,fillColor:'#485253',frameColor:'#dedbd2'})));
const rosalesFront=[
 ...columns.map(x=>({x,w:4.15,h:3.15,b:0,rect:true,portico:true,noBars:true,fillColor:'#cecdc4'})),
 ...columns.map(x=>({x,w:2.65,h:1.5,b:4.05,rect:true,noBars:true,fillColor:'#535b57',frameColor:'#dedbd2'})),
 ...columns.map(x=>({x,w:2.15,h:.55,b:6.45,rect:true,noBars:true,fillColor:'#535b57',frameColor:'#dedbd2'}))
];
export const C02_12={block:'C02',evidence:'C02/20261110-modelado',buildings:[{
 id:'B1-03',height:8.2,color:'#d5d4cc',roofColor:'#e6e2d6',parapet:true,keepDetails:true,uncertainty:4,liteLod:true,
 sources:['ajuste-visual/C02.jpg','calco/referencia.webp','cuadras/C02-inventario.jpg','evidence/B1-03/20261006-01-cierre.json','https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=29.07605%2C-110.95693&heading=90&pitch=0','https://www.elimparcial.com/son/hermosillo/2026/08/28/demuelen-antiguo-edificio-de-la-procuraduria-en-hermosillo-para-mejorar-la-distribucion-vial/','https://www.radiosonora.com.mx/derribo-de-inmueble-dara-paso-a-ampliacion-del-bulevar-hidalgo/','evidence/C02/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta: 3 a Obregón y 4 a Rosales (observadas).
 facades:[{edge:3,plain:true,bays:obregonFront},{edge:4,plain:true,bays:rosalesFront,bands:[{y:3.3,h:.3,d:.3,color:'#dfddd5'}]}],
 roofDetails:[ventila(-192.3,8.8,1.6,1.4),ventila(-190.6,14.5,1.2,1.0),ventila(-193.0,16.3,1.2,1.2),ventila(-185.7,18.5,1.0,1.0),ventila(-183.2,20.8,1.2,.8),ventila(-190.0,19.1,1.0,.8)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada',fotoCalle:false,streetViewOctubre:true},
 hypothesis:{id:'H12-01',status:'frente histórico observado y azotea según la aérea',measured:false,photoreal:false,generic:false,
  observed:'Frentes a Rosales (pórtico y ventanas en dos franjas) y a Obregón (dos franjas de ventanas) de la antigua Procuraduría en Street View de enero de 2026, registrados en octubre; azotea blanca con seis equipos en la aérea, color medido.',
  estimated:'Altura 8.2 m y proporciones de vanos del paquete de octubre (estimación visual), color de muro, tamaño de los equipos.',
  unchanged:'Planta, frente y altura del paquete de octubre. La prensa reporta la demolición en 2026: se conserva como registro histórico rotulado hasta tener foto actual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'12/B1-03: frente histórico de la antigua Procuraduría (Street View ene-2026, registrado en octubre) + azotea según la aérea. Demolición reportada en 2026; volumen como registro histórico.'}]};

// 10 / B1-01 / C02 · cuadra 4 · MODELADO CON AÉREA, FRENTE OBSERVADO Y FÁBRICA DE FACHADAS (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Fotos disponibles: aérea (Esri World Imagery z19, calco/referencia.webp, y ajuste-visual/C02.jpg)
// y la observación de Street View desde Rosales registrada en el paquete C02 de octubre
// (cuadra-c02-aproximada.js, que este módulo sustituye y se conserva como registro). No hay
// foto de calle de C02 guardada en el repositorio.
//
// Visto: conjunto de la esquina Rosales–Serdán con dos cubiertas: tostada al poniente (mediana
// #b7b09e) y blanca al oriente (#edeae3) con una hilera de tinacos y equipos; paños acristalados
// en el frente a Rosales (observación de octubre).
// Estimado: comercio en planta baja y ventanas del nivel superior por tipología en Serdán y
// Pino Suárez; el módulo acristalado sigue por continuidad en el tramo sur de Rosales. Alturas
// del paquete de octubre (6.0 y 7.6 m, estimación visual); medidas visuales, no métricas.
import {tinaco,ventila,frenteComercio,PALETA} from './fabrica-fachadas.js?v=3b7f2a768403';
// Tinaco de 0.95 m: en C02 los equipos quedan a 1 m o menos sobre la cubierta (pruebas-lamina).
const tinacoBajo=(x,z)=>({...tinaco(x,z),w:.95,h:.95,d:.95});
const A=[-216.63450713641788,-58.51784682465417],B=[-171.051,-63.974],C=[-166.99860088200882,-41.45450353152855],D=[-165.8364320028746,-33.48811989288829],E=[-198.947,-25.748],F=[-202.336,-21.327],G=[-210.61589394658634,-19.58861507934798],H=[-212.2178685062412,-29.956688431062503];
const split=[-193.84275356820894,-61.245923412327085];
const poniente=[A,split,E,F,G,H],oriente=[split,B,C,D,E];
const largo=(p,e)=>{const a=p[e],b=p[(e+1)%p.length];return Math.hypot(b[0]-a[0],b[1]-a[1]);};
// Comercio de la fábrica en planta baja y, por continuidad tipológica, una ventana enrejada por
// módulo en el nivel superior con banda de entrepiso. Estimado, no observado.
const dosNiveles=(pts,edge,h)=>{const f=frenteComercio(largo(pts,edge),h),sup=h>=7?{b:4.4,h:1.6}:{b:3.5,h:1.4};
 return {edge,plain:true,fabrica:{tipo:'comercio-dos-niveles',longitud:+largo(pts,edge).toFixed(3)},
  bays:[...f.bays,...f.bays.map(v=>({x:v.x,w:1.6,h:sup.h,b:sup.b,rect:true,frontBars:true,barColor:PALETA.hierro,frameColor:PALETA.marco,frameWidth:.08,fillColor:PALETA.vidrio}))],
  bands:[...f.bands,{y:+(sup.b-.35).toFixed(2),h:.2,d:.1,color:PALETA.marco}]};};
// Paño acristalado observado desde Rosales (paquete de octubre) y su continuidad en el tramo sur.
const vidrio=x=>({x,w:4.7,h:3,b:.12,rect:true,noBars:true,fillColor:'#394643',frameColor:'#ecebe4'});
const bandaRosales=[{y:3.25,h:.25,d:.18,color:'#e6e6df'}];
export const C02_10={block:'C02',orderLabel:4,evidence:'C02/20261110-modelado',buildings:[{
 id:'B1-01',points:[A,B,C,D,E,F,G,H],height:7.6,color:'#c6c2b6',uncertainty:3,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C02.jpg','calco/referencia.webp','cuadras/C02-inventario.jpg','evidence/B1-01/20261006-01-cierre.json','https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=29.07605%2C-110.95693&heading=90&pitch=0','evidence/C02/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  {part:'cubierta-poniente',points:poniente,height:6.0,color:'#d7d7d0',roofColor:'#b7b09e',parapet:true,parapetColor:'#ddd5c2',
   facades:[dosNiveles(poniente,0,6.0),
    {edge:4,plain:true,bays:[vidrio(5.25)],bands:bandaRosales},
    {edge:5,plain:true,bays:[3.5,10,16.5,23].map(vidrio),bands:bandaRosales}],
   roofDetails:[ventila(-204.8,-31.5,1.0,1.8)]},
  {part:'cubierta-oriente',points:oriente,height:7.6,color:'#d8d5c9',roofColor:'#e6e2d6',parapet:true,parapetColor:'#ddd5c2',
   facades:[dosNiveles(oriente,0,7.6),dosNiveles(oriente,1,7.6),dosNiveles(oriente,2,7.6)],
   roofDetails:[tinacoBajo(-188.3,-52.5),tinacoBajo(-184.9,-53.5),tinacoBajo(-181.1,-54.1),tinacoBajo(-178.6,-54.6),
    ventila(-175.1,-56.1,1.6,.8),ventila(-171.9,-61.8,1.6,.9),ventila(-171.5,-54.7,1.2,.8),ventila(-186.5,-46.1,1.4,.6),ventila(-171.8,-40.9,.8,1.8)]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'comercio',fotoCalle:false,secciones:2},
 hypothesis:{id:'H10-01',status:'modelado con aérea, frente observado en octubre y fábrica de fachadas',measured:false,photoreal:false,generic:false,
  observed:'Esquina Rosales–Serdán: cubierta tostada al poniente y blanca al oriente con una hilera de cuatro tinacos y cinco equipos, colores medidos en la aérea; paños acristalados del frente a Rosales registrados en octubre con Street View.',
  estimated:'Comercio en planta baja y ventanas del nivel superior en Serdán y Pino Suárez por tipología; un paño acristalado más en el tramo sur de Rosales por continuidad; alturas de 6.0 y 7.6 m del paquete de octubre (estimación visual); color de muro.',
  unchanged:'Planta de inventario de ocho vértices y división en dos cubiertas del paquete de octubre; registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'10/B1-01: aérea + frente acristalado observado en octubre + fábrica de fachadas (sin foto guardada).'}]};

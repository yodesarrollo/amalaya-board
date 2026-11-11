// 6 / C1-11 / C07 · cuadra 2 · MODELADO CON FOTO DE CALLE Y AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con al menos una foto se modela el edificio con
// formas estimadas: lo observado donde se vio y su tipología por continuidad en el resto.
//
// Fotos: panorama R-001 punto 1 (recorrido/G5UapkZfu_gIeRoydqjPBw.jpg, Street View,
// fecha de captura sin verificar), tomado desde Obregón al oriente de la esquina noreste;
// nota de la revisión del 7-oct (W01, Street View 2025-03, en paramento-data.js): frente de
// dos niveles en la esquina con Pino Suárez; aérea Esri z19 (calco/referencia.webp y
// ajuste-visual/C07.jpg).
//
// Visto en el panorama: un nivel alto de color salmón (el panorama lo muestra a la sombra)
// con arcos ciegos color crema y cornisa; dos arcos anchos junto a la esquina y arcos
// angostos que siguen sobre Obregón; pórtico de vano recto en la esquina noreste; sobre
// Yáñez, una ventana en arco, el paso cubierto de autos y un muro blanco con puerta de arco
// rojizo.
// Altura del frente norte: 5.0 m (ángulo del remate a ~16 m de la cámara; ±0.5 m).
// Visto en la aérea: cinco cuerpos de azotea blanca, un tragaluz gris verdoso, equipos,
// un patio central oscuro (árbol o toldo), jardín sobre Pino Suárez y estacionamiento
// al sur. La cubierta llega unos 3 m sobre la banqueta de Yáñez (pórtico y alero); el
// muro se coloca 0.3 m dentro de la línea de banqueta.
// Estimado: arcos ciegos continuados en el frente norte de los cuerpos centro y noroeste,
// ventanas del segundo nivel, fachadas sur y poniente por tipología (barda con portón al
// sur y casa hacia el jardín), color salmón a pleno sol, alturas de los cuerpos sin foto
// por continuidad (5.0 m).
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const salmon='#dca690',crema='#eadfc8',blanco='#ebe6d9',sombra='#2b2d2c',vidrio='#2d3336';
const remate=h=>({y:+(h-.12).toFixed(2),h:.24,d:.2,color:crema});
const zoclo={y:.3,h:.6,d:.035,color:'#c48f78'};
const arco=(x,w=.9,h=3.0,b=.6)=>({x,w,h,b,blind:true,noBars:true,fillColor:crema,archFrameColor:crema});
const ventana=x=>({x,w:1.1,h:1.6,b:4.9,rect:true,noBars:true,frameColor:crema,frameWidth:.08,fillColor:vidrio});
const seccion=(part,points,height,color,roofColor,facades=[],roofDetails=[])=>({part,points,height,color,roofColor,parapet:true,parapetColor:crema,facades,roofDetails});
// Patio central visto en la aérea (vegetación o sombra; mediana #414638): queda abierto.
const patio=[[-129.6,48.2],[-119.6,47.8],[-119.6,55.4],[-129.6,55.6]];
export const C07_06={block:'C07',evidence:'C07/20261110-modelado',buildings:[{
 id:'C1-11',height:5.0,color:salmon,roofColor:'#e6e2d6',uncertainty:.5,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['recorrido/G5UapkZfu_gIeRoydqjPBw.jpg','ajuste-visual/C07.jpg','calco/referencia.webp','evidence/C1-11/20261006-01-cierre.json','evidence/paramento-20261007/revision.json','evidence/C07/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de frentes-calle-lib.mjs contra la banqueta de C07.
 sections:[
  // Esquina con Pino Suárez: dos niveles según W01; arcos y ventanas altas estimados.
  seccion('6-noroeste',[[-129.8,37.3],[-122.8,36.8],[-122.8,47.6],[-129.8,48.0]],8.5,salmon,'#e6e2d6',
   [{edge:0,plain:true,bays:[1.0,2.7,4.4,6.1].flatMap(x=>[arco(x),ventana(x)]),bands:[remate(8.5),{y:4.4,h:.18,d:.12,color:crema},zoclo]},
    {edge:3,tipo:'casa',sinPuerta:true}],
   [ventila(-127.3,41.4,1.4,.8)]),
  // Centro del frente de Obregón: arcos ciegos por continuidad con lo visto.
  seccion('6-norte',[[-122.8,36.4],[-115.2,35.8],[-115.2,47.6],[-122.8,47.6]],5.0,salmon,'#d8dcd1',
   [{edge:0,plain:true,bays:[1.0,2.7,4.4,6.1].map(x=>arco(x)),bands:[remate(5.0),zoclo]}],
   [ventila(-120.3,40.2,1.2,.9),ventila(-118.4,44.4,1.2,.9)]),
  // Esquina Obregón–Yáñez, vista en el panorama: arcos ciegos, pórtico, ventana en arco y paso cubierto.
  seccion('6-noreste',[[-115.2,35.8],[-99.4,33.9],[-99.76,48.0],[-115.2,48.0]],5.0,salmon,'#e6e2d6',
   [{edge:0,plain:true,bays:[arco(14.81,1.4,3.5,.2),arco(13.01,1.4,3.5,.2),...[11.3,9.6,7.9,6.2,4.5,2.8,1.1].map(x=>arco(x))],bands:[remate(5.0),zoclo]},
    {edge:1,plain:true,bays:[
      {x:3.2,w:5.6,h:3.4,b:0,rect:true,portico:true,noBars:true,fillColor:salmon},
      {x:7.1,w:1.0,h:2.4,b:.3,noBars:true,archFrameColor:crema},
      {x:11.0,w:4.4,h:3.3,b:.05,rect:true,noBars:true,fillColor:sombra,recess:.6,revealColor:salmon}],
     bands:[remate(5.0),zoclo]}],
   [{x:-110.1,z:45.6,w:7.8,h:.3,d:4.0,color:'#8b9988'},ventila(-107.5,40.1,1.4,1.0),ventila(-100.7,39.9,1.0,.7)]),
  // Cuerpo sureste de muro blanco: puerta de arco rojizo vista sobre Yáñez; fachada sur por tipología.
  seccion('6-sureste',[[-115.2,48.0],[-99.76,48.0],[-100.2,60.2],[-117.2,66.9],[-123.1,55.6],[-119.4,55.6],[-119.4,48.0]],5.0,blanco,'#e6e2d6',
   [{edge:1,plain:true,bays:[{x:3.0,w:1.0,h:2.5,b:.05,wood:true,noBars:true,archFrameColor:'#b8846a'}],bands:[remate(5.0)]},
    {edge:2,tipo:'muro'}],
   [ventila(-116.8,55.7,.8,1.4),ventila(-112.8,58.6,1.4,.9),ventila(-110.5,53.0,.7,1.3),tinaco(-106.5,54.6),tinaco(-104.4,55.4),ventila(-103.3,56.6,1.0,.6)]),
  // Cuerpo suroeste, sin foto: casa de un nivel hacia la calle sur y hacia el jardín.
  seccion('6-suroeste',[[-130.9,55.8],[-123.1,55.6],[-117.2,66.9],[-127.3,70.1]],5.0,blanco,'#e6e2d6',
   [{edge:2,tipo:'casa',puertas:['centro']},{edge:3,tipo:'casa',sinPuerta:true}])
 ],
 yardSurface:{points:patio,color:'#414638'},
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:true,secciones:5},
 hypothesis:{id:'H6-01',status:'modelado con foto de calle, aérea y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Panorama R-001 punto 1 (esquina Obregón–Yáñez): un nivel alto salmón con arcos ciegos crema y cornisa, dos arcos anchos junto a la esquina y arcos angostos sobre Obregón, pórtico de vano recto en la esquina, ventana en arco, paso cubierto de autos y muro blanco con puerta de arco rojizo sobre Yáñez; remate a unos 5.0 m. Nota W01 (2025-03): dos niveles en la esquina con Pino Suárez. Aérea: cinco cuerpos de azotea blanca, tragaluz, equipos, patio central oscuro, jardín al poniente y estacionamiento al sur.',
  estimated:'Contornos a ±1 m sobre la aérea; altura de 5.0 m por el ángulo del remate (±0.5 m) y por continuidad en los cuerpos sin foto; 8.5 m del cuerpo noroeste por la nota W01; arcos continuados en el frente norte de los cuerpos centro y noroeste; ventanas del segundo nivel; barda con portón al sur y casa hacia el jardín y la calle sur; colores de muro a pleno sol; el alero sobre la banqueta de Yáñez no se modela.',
  unchanged:'Planta de inventario conservada como registro; registro individual de C1-11; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Con al menos una foto, modelar el edificio con formas estimadas: lo observado donde se vio y su tipología por continuidad en el resto; más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'6/C1-11: esquina Obregón–Yáñez en cinco cuerpos con patio central; foto de calle + aérea, resto por tipología.'}]};

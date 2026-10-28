import {C02_APROXIMADA} from './cuadra-c02-aproximada.js?v=762653c8bba5';
import {SERDAN_APROXIMADO} from './serdan-aproximado-data.js?v=0bbe41f3555a';
import {C05_APROXIMADA} from './cuadra-c05-aproximada.js?v=5b91975adb8a';
import {CORREDOR_OBREGON_20261026} from './corredor-obregon-20261026.js?v=0b3a3165be8d';
import {BLOQUE1_SERDAN} from './bloque1-serdan-20261026.js?v=25a7d7b95b21';
// Visible features only. Dimensions are visual estimates from the retained photos.
// Existing fitted footprints are read from the scene, never retraced by this layer.
export const CUADRA_DETAILS = [{
 block:'C08', orderLabel:1, evidence:'c08-punto2-20261008',
 buildings:[
  {id:'C2-01',height:4.6,color:'#c5c4bf',uncertainty:0.8,
   sources:['c08-ne-foto.jpg'],
   facades:[
    {edge:0,plain:true,bays:[4.4,11.4].map(x=>({x,w:1.75,h:2.8,b:.25,rect:true,frameColor:'#99786b'})),bands:[{y:.45,h:.8,d:.07,color:'#96796d'},{y:4.4,h:.18,d:.25,color:'#967367'}]},
    {edge:1,plain:true,bays:[{x:2,w:1.65,h:2.8,b:.2,rect:true,frameColor:'#99786b'},{x:6.1,w:1.65,h:3.0,b:0,rect:true,door:true,frameColor:'#99786b'},{x:9.7,w:1.15,h:2.65,b:.25,rect:true,frameColor:'#99786b'}],bands:[{y:.45,h:.8,d:.07,color:'#96796d'},{y:4.4,h:.18,d:.25,color:'#967367'}]}
   ],note:'Un nivel, paños grises y marcos pardos; norte y corredor oriental visibles. Reversos sin vanos supuestos.'},
  {id:'C2-02',height:5.3,color:'#c6dadd',uncertainty:1,
   sources:['c08-se-foto.jpg','c08-ne-foto.jpg'],
   facades:[
    {edge:2,plain:true,bays:[{x:2.8,w:1.7,h:2.75,b:.25,rect:true,frameColor:'#dfe4dd'},{x:6.9,w:1.7,h:2.75,b:.25,rect:true,frameColor:'#dfe4dd'},{x:11,w:2.3,h:3.9,b:.05,rect:true,door:true,wood:true,frameColor:'#e1e0d5'},{x:15.9,w:1.7,h:2.75,b:.25,rect:true,frameColor:'#dfe4dd'}],bands:[{y:4.62,h:.12,d:.18,color:'#b8c6c1'},{y:5.02,h:.17,d:.26,color:'#d9ded3'}]},
    {edge:1,plain:true,bays:[4.6,10.1,15.6,20].map(x=>({x,w:1.55,h:2.55,b:.25,rect:true,frameColor:'#d8ded7'})),bands:[{y:5.02,h:.17,d:.26,color:'#d9ded3'}]}
   ],note:'Frente azul claro en Sufragio y retorno al corredor; puerta central de madera y ventanas enrejadas. Proporciones aproximadas.'},
  {id:'C2-03',height:4.2,color:'#d4d5cb',uncertainty:1.2,
   sources:['c08-porton-foto.jpg','c08-oeste-foto.jpg'],facades:[],
   note:'Cuerpo interior de servicio detrás del estacionamiento. Cubierta y paños neutros; sin reproducir ventanas ocultas ni asignarle la fachada de la esquina suroeste.'}
 ],
 // The blue handrail follows the already reviewed ramp. End at its foot remains open.
 rail:{building:'C2-01',a:[-20.9522,28.3762],b:[-19.3874,35.2414],offset:1.05,height:.92,color:'#28659a'},
 fence:{id:'C08-cerramiento-oeste',points:[[-89.2,34.1],[-90.7,62.9],[-89.5,76.5]],baseHeight:.48,height:2.15,color:'#a6a89e',sources:['c08-nw-foto.jpg','c08-porton-foto.jpg']},
 walls:[
  {id:'sur',a:[-31,75.2],b:[-88.8,91],height:4.8,color:'#d8d9d0',
   bays:[{x:33.1,w:4.8,h:3.45,b:0,rect:true,open:true,noBars:true,frameColor:'#999e96'},
    ...[4.5,9,13.5,23,27.5].map(x=>({x,w:1.45,h:3.15,b:.1,rect:true,frameColor:'#929a95'})),
    {x:18,w:2,h:4.2,b:0,door:true},
    ...[40,43.5].map(x=>({x,w:1.4,h:2.65,b:.15,rect:true,blind:true,noBars:true,frameColor:'#929a95'})),
    {x:49.5,w:2,h:3.8,b:0,door:true},{x:55.5,w:1.35,h:2.8,b:.15,rect:true}],
   bands:[{y:.8,h:1.5,d:.06,color:'#919b98'},{y:4.53,h:.12,d:.16,color:'#acb1a8'},{y:4.72,h:.14,d:.28,color:'#cacfc6'}],
   sources:['c08-sw-foto.jpg','c08-sur-cerramiento-20261008.jpg'],note:'Fachada histórica conservada como muro, con acceso abierto al estacionamiento; sin techo ni relleno del patio.'},
  {id:'oeste-sur',a:[-88.8,91],b:[-89.5,76.5],height:3.65,color:'#c8cfc2',bays:[],sources:['c08-oeste-foto.jpg']}
 ]
},{block:'C30',orderLabel:8,evidence:'c30-cierre-20261008',buildings:[
 {id:'CH-YG-BIB',ownerPrefix:'Huella OSM 1533334038',points:[[9.12708,-99.045067],[-3.68388,-96.704018],[3.33396,-59.313869],[17.53488,-65.105461]],height:9.6,color:'#bbbdb5',uncertainty:1.5,
  sources:['c30-serdan-biblioteca-20261008.jpg','https://www.colson.edu.mx/nota.aspx?nx=7106','https://www.elimparcial.com/son/hermosillo/2025/05/27/biblioteca-gerardo-cornejo-culmina-mayo-con-actividades-culturales-y-literarias/'],
  facades:[{edge:0,plain:true,bays:[{x:2.8,w:3.6,h:2.9,b:.1,rect:true,noBars:true,fillColor:'#344044'},{x:8.3,w:4.4,h:2.9,b:.1,rect:true,noBars:true,fillColor:'#354446'},...[3.45,6.55].flatMap(b=>[3.0,9.0].map(x=>({x,w:4.5,h:2.25,b,rect:true,noBars:true,fillColor:'#455758'})))],bands:[{y:3.23,h:.24,d:.22,color:'#aaa8a0'},{y:6.35,h:.24,d:.22,color:'#aaa8a0'},{x:7.8,w:5.8,y:3.35,h:.64,d:.15,color:'#96563f'},{y:9.36,h:.2,d:.28,color:'#bcbab0'}],fins:[.6,1.25,1.9,2.55,3.2,3.85,4.5,5.15,5.8,6.45,7.1,7.75,8.4,9.05,9.7,10.35,11].map(x=>({x,b:6.6,h:2.05,w:.07,d:.12,color:'#343d3b'}))}],
  note:'Biblioteca terminada: la foto de 2023 mostraba obra y la referencia de 2025 muestra una fachada cerrada con vidrio, panel rojizo y elementos oscuros. Interpretación visual aproximada, sin dimensiones medidas.'},
 {id:'CH-YG-BBVA',ownerPrefix:'Huella OSM 499759374',points:[[-34.04916,-90.00264],[-75.495239,-82.424751],[-68.341316,-43.492401],[-26.895241,-51.070286]],height:6.2,color:'#e2e4df',uncertainty:1.2,
  sources:['c30-yanez-banco-20261008.jpg','c30-serdan-biblioteca-20261008.jpg'],
  facades:[{edge:0,plain:true,bays:[{x:22,w:4.4,h:2.8,b:.05,rect:true,noBars:true,fillColor:'#536777'}],bands:[{x:22,w:13,y:4.5,h:.7,d:.18,color:'#315678'}]},
   {edge:1,plain:true,fins:[4,9,14,19,24,29,34].map(x=>({x,b:.2,h:3.4,w:.26,d:.2,color:'#d1d4cc'}))}],
  note:'Volumen y huella conservados; frente blanco, acceso retranqueado y paños verticales. No se reproducen marcas ni anuncios como texturas.'},
 {id:'A2-05',height:7.2,color:'#ddd9cc',uncertainty:1.2,sources:['c30-serdan-centro-20261008.jpg'],
  facades:[{edge:0,plain:true,bays:[{x:6.1,w:9.6,h:2.8,b:.1,rect:true,noBars:true,fillColor:'#58615b'}],bands:[{y:3.25,h:.32,d:.3,color:'#c8c5b8'},{y:6.9,h:.18,d:.2,color:'#cfcec2'}]}],note:'Frente de dos niveles con paño superior ciego y acceso amplio; cota visual aproximada.'},
 {id:'A2-06',height:6.2,color:'#807468',uncertainty:1.2,sources:['c30-garmendia-norte-20261008.jpg','c30-serdan-centro-20261008.jpg'],
  facades:[{edge:1,plain:true,bands:[{y:2.4,h:.035,d:.04,color:'#514b43'},{y:4.75,h:.035,d:.04,color:'#514b43'}]}],note:'Paño lateral pardo continuo observado en Garmendia; sin añadir ventanas donde la fotografía muestra muro.'},
 {id:'B2-01',height:4.6,color:'#76b7ab',uncertainty:.9,sources:['c30-garmendia-medio-20261008.jpg'],
  facades:[{edge:1,plain:true,bays:[{x:1.5,w:1,h:2.45,b:0,rect:true,door:true,frameColor:'#618a7c'},{x:4.5,w:2.8,h:1.8,b:.65,rect:true,frameColor:'#bbad79'},{x:9,w:3.7,h:2.7,b:0,rect:true,noBars:true,fillColor:'#414842',shutter:true},{x:5,w:.8,h:.7,b:3.25,rect:true,frameColor:'#bdad79'}],bands:[{y:2.88,h:.17,d:.45,color:'#846d68'},{y:4.5,h:.17,d:.16,color:'#977b72'}]}],note:'Cuerpo turquesa bajo, cortina, ventana y puerta diferenciadas; pequeño vano alto observado.'},
 {id:'B2-02',height:3.6,color:'#62a8bf',uncertainty:.8,sources:['c30-garmendia-sur-20261008.jpg'],
  facades:[{edge:3,plain:true,bays:[{x:.8,w:1,h:1.2,b:.8,rect:true,frameColor:'#c9b65c'},{x:2.45,w:.9,h:2.2,b:0,rect:true,door:true,frameColor:'#c9b65c'},{x:4.05,w:1,h:1.2,b:.8,rect:true,frameColor:'#c9b65c'}],bands:[{y:3.3,h:.12,d:.14,color:'#8d8081'}]}],note:'Frente azul bajo con dos ventanas y puerta; no se reproduce el mural ni se llena el patio lateral.'}
 ],access:{building:'CH-YG-BBVA',edge:0,center:22,steps:3,rise:.12,tread:.28,width:3.2,source:'c30-yanez-banco-20261008.jpg'},heritage:{ownerPrefix:'PH-01 · Instituto Sonorense de Cultura · fachada patrimonial interpretada',a:[-56.9592,-.166425],b:[34.54488,-8.066065],westEndX:-25,redStartX:2,height:7.45,westHeight:10.2,source:'c30-obregon-isc-20261008.jpg',note:'Tres frentes distintos: poniente de dos niveles, pórtico central de cuatro arcos visibles y paño rojo oriental con pilastras. El ala este previa se conserva. Proporciones estimadas, no medidas.'}
}];

CUADRA_DETAILS.push(C02_APROXIMADA);
CUADRA_DETAILS.push(...SERDAN_APROXIMADO);
CUADRA_DETAILS.push(C05_APROXIMADA);
CUADRA_DETAILS.push(...CORREDOR_OBREGON_20261026);
CUADRA_DETAILS.push(...BLOQUE1_SERDAN);

// Chihuahua: the panorama and the aerial footprint show distinct fronts. All
// heights and the internal split are visual estimates, not parcel boundaries.
CUADRA_DETAILS.push({block:'C21',evidence:'recorrido-R002-P05-P07',buildings:[
 {id:'EB-NW',ownerPrefix:'ESQUINA NOROESTE',points:[[65.48577,-36.82626],[80.48021,-37.82364],[82.88317,-22.9738],[67.88873,-21.97642]],height:4.4,color:'#789465',uncertainty:2.0,
  sources:['recorrido/cjTHuFQqgbHlqPDeYtUDaQ.jpg','recorrido/kwpqUP9tZmmjDfiFDIJbsg.jpg'],
  facades:[{edge:0,plain:true,bays:[3,8,12].map(x=>({x,w:1.35,h:2.15,b:.55,rect:true,frameColor:'#ece9dd'})),bands:[{y:4.23,h:.18,d:.20,color:'#eeeae0'}]},
   {edge:3,plain:true,bays:[3.5,8.5,12.5].map(x=>({x,w:1.2,h:2.1,b:.55,rect:true,frameColor:'#ece9dd'})),bands:[{y:4.23,h:.18,d:.20,color:'#eeeae0'}]}],
  note:'Esquina verde de un nivel en Garmendia y Chihuahua, con rejas y marcos claros; anchuras y altura estimadas.'},
 {id:'B3-01',points:[[84.044,-37.19],[84.044,-21.327],[91.083,-20.547],[101.251,-21.587],[101.251,-22.628],[112.17399,-24.12317],[110.27508,-38.82501]],height:4.4,color:'#f2f0e7',uncertainty:2.5,
  sources:['recorrido/qU0XiVpeIHZyTixjEBUfgg.jpg','recorrido/kwpqUP9tZmmjDfiFDIJbsg.jpg'],facades:[],sections:[
   {part:'frente-rojo',points:[[84.044,-37.19],[84.044,-21.327],[91.083,-20.547],[92,-20.64079],[92,-37.68597]],height:4.2,color:'#a95345',facades:[{edge:4,plain:true,bays:[{x:1.5,w:1.05,h:2,b:.55,rect:true,frameColor:'#dbd4c9'},{x:4,w:1.1,h:2.5,b:.08,rect:true,door:true,frameColor:'#d8d1c6'},{x:6.3,w:1.0,h:2,b:.55,rect:true,frameColor:'#d8d1c6'}],bands:[{y:4,h:.16,d:.18,color:'#dfd7c8'}]}]},
   {part:'frente-blanco',points:[[92,-37.68597],[92,-20.64079],[101.251,-21.587],[101.251,-22.628],[112.17399,-24.12317],[110.27508,-38.82501]],height:4.4,color:'#e8e8df',facades:[{edge:5,plain:true,bays:[{x:2.8,w:2.3,h:2.8,b:.05,door:true},{x:7,w:2.8,h:2.9,b:.05,rect:true,door:true,fillColor:'#3b3734'},{x:11.5,w:1.35,h:2.0,b:.55,rect:true,frameColor:'#dedbd1'},{x:15.2,w:1.5,h:2.6,b:.1,door:true}],bands:[{y:4.25,h:.16,d:.2,color:'#f1eee3'}]}]}
  ],note:'Cuerpos rojo y blanco sobre Chihuahua, diferenciados por panoramas contiguos; la división interior y el fondo son aproximados.'}
]});

// In this corner the available panorama shows cars behind masonry and grilles;
// the capture date is unknown.
// Keep it open: the former generic solid and roof do not represent the photo.
CUADRA_DETAILS.push({block:'C23',evidence:'recorrido-R002-P01-P02',buildings:[],openLots:[{
 id:'EB-NE',ownerPrefix:'ESQUINA NORESTE',points:[[176.42772,-41.7172],[152.41932,-40.05295],[155.14107,-23.4478],[179.14947,-25.11205]],
 height:3.0,color:'#9d8d7d',sources:['recorrido/77G-ooH2G6Dx2QbnJ20OAQ.jpg','recorrido/TMvGKzSUcJSVhkTRRxjHIA.jpg'],
 walls:[{edge:0,bays:[4,11,18].map(x=>({x,w:2.25,h:2.35,b:.15,rect:true,open:true,fullBars:true}))},{edge:3,bays:[4,10,14].map(x=>({x,w:2.0,h:2.3,b:.15,rect:true,open:true,fullBars:true}))}],
 note:'Recinto abierto con autos, muro de mampostería y rejas visibles en el panorama; sin cubierta genérica. Estado actual y límites exactos por verificar.'
}]});


// Edificio visible 76: D1-05. Only this owner is replaced. Native anchors retained.
// Street View: north/west Dec 2023; east Jan 2026. No survey or hidden rear detail.
{
 const trim='#74715a', white='#e7e5dc';
 const bands=[{y:.23,h:.46,d:.10,color:trim},{y:4.65,h:.13,d:.20,color:trim},{y:4.98,h:.24,d:.30,color:trim}];
 const window=x=>({x,w:2.05,h:2.9,b:.3,rect:true,frameColor:trim,fillColor:'#55594e'});
 CUADRA_DETAILS.push({block:'C13',evidence:'D1-05/20261028-seis-pasos',buildings:[{
  id:'D1-05',height:5.15,color:white,roofColor:'#e5e2d5',uncertainty:3,keepDetails:false,
  sources:['evidence/D1-05/d105-norte-202312.jpg','evidence/D1-05/d105-esquina-noroeste-202312.jpg','evidence/D1-05/d105-oeste-202312.jpg','evidence/D1-05/d105-este-202601.jpg','ajuste-visual/C13.jpg'],
  facades:[
   {edge:0,plain:true,trimColor:trim,pilasters:[0,.2,.4,.6,.8,1],balustrade:{trim,color:white},bands,
    bays:[{...window(3.2),lintel:true},{x:9,w:2.35,h:3.55,b:.05,rect:true,door:true,wood:true,noBars:true,panels:true,lintel:true,frameColor:trim},... [15.7,22.2,28.3].map(x=>({...window(x),lintel:true}))]},
   {edge:1,plain:true,bands:bands.slice(1),bays:[window(6),window(17.8)]},
   {edge:4,plain:true,bands:bands.slice(1),bays:[window(5.5),window(16.7)]}
  ],
  note:'76 / D1-05: aproximación visual exterior de un nivel, frente norte con cuatro ventanas, puerta de madera, pilastras, cornisa y balaustrada; dos ventanas en cada lateral visible. Huella original y cubierta clara conservadas. Altura de cuerpo 5.15 m y remate hasta 6.20 m son proporciones nominales sin medición; incertidumbre de huella heredada ±3 m. Reverso y cubierta parcialmente ocultos sin detalles inventados. Jardín y cerco oriental externos no se absorben al edificio.'
 }]});
}

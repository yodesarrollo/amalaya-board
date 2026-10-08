// Visual reconstruction, not a cadastral survey. Coordinates use the existing local frame.
// Shared frontage constrained by P08/P09 Street View rays and checked against the aerial roof edge.
// P08: heading 65 / FOV 90, blue-red x=705, red-yellow x=753 (1363px viewport).
// P09: heading 355 / FOV 80, corresponding x=475 and x=1232. Approximate camera model.
export const PARAMENTO_VERSION='paramento-obregon-hidalgo-ronda2-20261008';
export const frontZ=x=>5.901-(x-85.258)*.133417;
const pt=x=>[x,frontZ(x)];
export const FRONT_BUILDINGS=[
 {id:'EB-SW',part:'barra',owner:'La Barra Hidalgo · paramento revisado P08-P09',color:'#1458b9',height:5.7,
  points:[pt(74.8),pt(85.258),[81.1,-18.7],[69.8,-17.3],[72.8,5.45]],
  facades:[{edge:0,bays:[4.6,6.7,8.8].map(x=>({x,w:1.35,h:3.75,b:.2}))},{edge:3,bays:[3,6.8,10.6,14.4,18.2].map(x=>({x,w:1.45,h:3.85,b:.15}))},{edge:4,bays:[{x:1.35,w:1.65,h:4.35,b:0,door:true}]}],evidence:['R-001-P08','R-001-P09']},
 {id:'EB-SW',part:'club',owner:'Club Obregón · frente contiguo revisado P09',color:'#a74442',height:5.7,
  points:[pt(85.258),pt(92.194),[89.35,-14.8],[83.7,-14.1]],
  facades:[{edge:0,bays:[{x:1.85,w:1.8,h:4.45,b:0,door:true},{x:5.35,w:1.35,h:3.9,b:.1}]}],evidence:['R-001-P09']},
 {id:'EB-SW',part:'colegio-alto',owner:'El Colegio · remate alto amarillo P09-P10',color:'#cba346',height:5.7,
  points:[pt(92.194),pt(102.1),[100.6,-7.7],[90.65,-6.4]],
  facades:[{edge:0,bays:[{x:2.2,w:1.45,h:3.9,b:.2,blind:true}]}],evidence:['R-001-P09','R-001-P10']},
 {id:'EB-SW',part:'colegio',owner:'El Colegio · acceso bajo amarillo P10',color:'#cba346',height:4.6,
  points:[pt(102.1),pt(112.65),[109.75,-19.2],[104.4,-18.7],[106,-5],[101.2,-4.3]],
  facades:[{edge:0,cornice:'low',bays:[{x:2,w:1.45,h:3.4,b:.2},{x:5.4,w:1.7,h:3.95,b:0,door:true,wood:true},{x:8.9,w:1.45,h:3.4,b:.2}]}],evidence:['R-001-P10']},
 {id:'B3-03',part:'estacionamiento-frente',owner:'Planta física · B3-03',color:'#b38c69',height:5.8,
  replace:'Planta física · B3-03',points:[[129.147,2.336],[151.568,.776],[150.786,-4.165],[127.843,-3.125]],
  facades:[{edge:0,bays:[1.9,5.7,9.5,13.3,17.1,20.7].map(x=>({x,w:2.8,h:4.5,b:0,open:true}))}],evidence:['R-001-P11','R-001-P12']},
 {id:'EB-SE',part:'almacen-esquina',owner:'ESQUINA SURESTE · ABASOLO / OBREGÓN · fachada almacén revisada',color:'#dddcd0',height:9.5,
  replacePrefix:'ESQUINA SURESTE · ABASOLO / OBREGÓN',points:[[151.568,.776],[180.9,-1.24],[182.1,-2.5],[180.25,-24.1],[150.7,-22.8]],
  facades:[{edge:0,plain:true,bays:[{x:24.4,w:4.3,h:4.9,b:0,door:true,rect:true}]}],evidence:['R-001-P12','R-001-P13','R-001-P14']},
 {id:'ISC-58',part:'ala-este',owner:'ISC-58 · ala este del frente a Plaza Hidalgo',color:'#bd7563',height:6.0,
  points:[[34.5,-8.07],[60,-10.27],[57.85,-24],[32.95,-21]],
  facades:[{edge:0,bays:[3,8.3,13.6,18.9,23].map(x=>({x,w:2.6,h:4.7,b:0,open:true,noBars:true}))},{edge:1,bays:[3.6,8.8].map(x=>({x,w:2.8,h:4.7,b:0,open:true,noBars:true}))}],evidence:['R-001-P06','R-001-P07','R-001-P08','ground-reference.jpg']},
 {id:'C3-01',part:'estructura-sur',owner:'Planta física · C3-01',replace:'Planta física · C3-01',color:'#e0dfd7',height:5.4,
  points:[[99.947,17.871],[75.3348554,20.9391593],[76.2589761,25.8278854],[80.394,40.754],[105.0542661,36.6839911],[116.3720963,33.5010527],[114.286,23.331],[100.468,24.112]],
  facades:[{edge:0,plain:true,bays:[3,9,15,21].map(x=>({x,w:5.1,h:4.15,b:.3,rect:true,open:true,noBars:true}))}],evidence:['R-001-P07','R-001-P08','R-001-P09']}
];
export const HEIGHT_REVIEWS=[
 {id:'B1-03',height:14.0,color:'#cccabc',reason:'Obregón W01/W02: cuerpo de varios niveles junto a Rosales, visible sobre los árboles y desde Pino Suárez; altura visual aproximada.'},
 {id:'C1-01',height:3.5,color:'#d5d2c7',reason:'Obregón W02 sur: local bajo de un nivel junto al patio abierto; altura visual aproximada.'},
 {id:'C1-11',height:8.5,color:'#c9c4b6',reason:'Obregón W01 este: frente de dos niveles con mural en la esquina con Pino Suárez; altura visual aproximada.'},
 {id:'B1-08',height:4.2,color:'#d9d4c6',reason:'Hidalgo P-H01: cuerpo bajo de dos portones; no usar la altura genérica de todos los edificios.'},
 {id:'B1-09',height:22.0,color:'#c9c7b8',reason:'Hidalgo P-H01: torre de varios niveles detrás del cuerpo bajo. Altura aproximada por proporción visual, no medida.'},
 {id:'C1-08',height:3.8,color:'#dedbd0',reason:'Hidalgo P-H02: frente de un nivel junto al restaurante; altura visual aproximada.'},
 {id:'C1-09',height:3.3,color:'#dedbd0',reason:'Hidalgo P-H02: cuerpo vecino bajo; no corresponde a una masa de 6.2 m.'}
 ,{id:'C2-01',height:4.6,color:'#ab7166',reason:'Obregón P04: frente contiguo de un nivel junto a la fachada gris.'}
 ,{id:'C2-04',height:5.3,color:'#c9c9bf',reason:'Obregón P05: fachada gris clásica de un nivel alto; estimación visual.'}
 ,{id:'C2-06',height:3.6,color:'#e1ded2',reason:'Obregón P06: frente blanco de un nivel bajo, distinto del vecino clásico.'}
 ,{id:'C2-07',height:4.6,color:'#b28971',reason:'Obregón P07: local de un nivel y estructura abierta contigua; altura visual.'}
 ,{id:'C3-02',height:3.9,color:'#ddd7bc',reason:'Obregón P11-P12: frentes bajos continuos, no bloques iguales de 6.2 m.'}
 ,{id:'C3-03',height:4.0,color:'#8ebbb7',reason:'Obregón P12-P14: frente bajo turquesa; altura visual.'}
];
export const COURTYARD_REVIEWS=[{id:'B3-02',holes:[[[127,-8],[145,-9],[143,-25],[125,-24]]],evidence:['R-001-P11','R-001-P12','ground-reference.jpg'],reason:'Patio de estacionamiento visible en imagen aérea y a través de rejas: eliminar el sólido que llenaba el patio.'}];
export const JOIN_REVIEWS=[
 {id:'C1-03',vertices:[{index:0,point:[-181.9,64.6]},{index:1,point:[-173.9,63.3]}],reason:'Obregón W02 sur y aérea: el lote frente a la calle es patio con reja y estructura abierta; conservar solamente el cuerpo techado posterior.'},
 {id:'B1-08',vertices:[{index:0,point:[-244.1,14.6]},{index:1,point:[-233.5,12.5]},{index:2,point:[-231.2,23.9]},{index:3,point:[-241.8,26]}],reason:'Hidalgo H01: separar el edificio de dos portones de las rampas y rejas laterales; la huella anterior cerraba todo el antepatio.'},
 {id:'C1-08',vertices:[{index:2,point:[-228.7,62]},{index:3,point:[-240.5,63.4]}],reason:'Hidalgo H02 e imagen aérea: el frente bajo termina antes del patio; retirar el volumen que llenaba la zona abierta posterior.'},
 {id:'C2-01',vertices:[{index:0,point:[-36.89248,27.94785]}],reason:'P03-P04: fachada unida a OB-02, sin el callejón entre los dos cuerpos.'},
 {id:'C2-04',vertices:[{index:2,point:[1.5995,24.632]}],reason:'P05-P06: encuentro del frente gris con el local blanco.'},
 {id:'C2-06',vertices:[{index:0,point:[1.5995,24.632]},{index:1,point:[21.544,22.551]}],reason:'P05-P07: conservar la continuidad entre frentes, sin vacíos arbitrarios.'},
 {id:'C2-07',vertices:[{index:0,point:[21.544,22.551]}],reason:'P06-P07: encuentro compartido de las fachadas contiguas.'}
];

// Round 2: only Hidalgo/Obregon. Pixel controls are approximate, not surveying.
// H01 south: white E/W=493/685 px, blue E/W=685/914 px, heading170 FOV90.
// H03: same fronts from pano GHjVsKhk1o70QiqooiuTMw, heading220 FOV60.
// The two views distinguish small street-front buildings from the larger old roof envelopes.
const whiteEast=[-227.4,50.8],whiteWest=[-231.5,51.5],blueEast=[-231.7,50.2],blueWest=[-236.9,52.3];
const splitFront=[-168.3,43.613],splitBack=[-165.95,55.637];
export const ROUND2_BUILDINGS=[
 {id:'B1-08',part:'hidalgo-portones',owner:'Planta física · B1-08',replace:'Planta física · B1-08',height:4.2,color:'#d9d4c6',
  points:[[-241.8,26],[-231.2,23.9],[-233.5,12.5],[-244.1,14.6]],
  facades:[{edge:0,plain:true,bands:[{y:4.12,h:.16,d:.28,color:'#ae4743'}],bays:[
   {x:4.05,w:2.55,h:3.32,b:0,rect:true,noBars:true,fillColor:'#969b98',frameColor:'#b94441',shutter:true},
   {x:7.05,w:2.55,h:3.32,b:0,rect:true,noBars:true,fillColor:'#969b98',frameColor:'#b94441',shutter:true},
   {x:1.05,w:.72,h:1.55,b:0,rect:true,frameColor:'#b94441'},
   {x:2.05,w:.6,h:.73,b:.7,rect:true,frameColor:'#b94441'},
   {x:9.15,w:.6,h:.73,b:.7,rect:true,frameColor:'#b94441'},
   {x:10.1,w:.66,h:1.55,b:0,rect:true,frameColor:'#b94441'}]}],evidence:['H01-norte-2023-12']},
 {id:'B1-09',part:'hidalgo-torre',owner:'Planta física · B1-09',replace:'Planta física · B1-09',height:22,color:'#c9c7b8',
  // The former narrow tower was too far behind the low garage. Refit to its visible front,
  // keeping the tower behind the portones; plan and height remain visual estimates.
  points:[[-245.3,17.6],[-231.3,14.8],[-234.7,-2.1],[-248.7,.7]],
  facades:[{edge:0,plain:true,bays:[7.6,10.3,13,15.7,18.4].map(b=>({x:7.1,w:10.2,h:1.75,b,rect:true,noBars:true,fillColor:'#333b3a'})),
   fins:Array.from({length:9},(_,i)=>({x:2+i*1.275,b:6.8,h:14.1,w:.085,d:.38,color:'#aa604e'})),
   bands:[7.6,10.3,13,15.7,18.4].flatMap(y=>[-.62,-.15,1.94].map(dy=>({x:7.1,w:10.5,y:y+dy,h:.11,d:.38,color:'#b9b59d'})))}],evidence:['H01-norte-2023-12','H01-torre-pitch25','H04-norte-2023-12']},
 {id:'C1-08',part:'hidalgo-local-azul',owner:'Planta física · C1-08',replace:'Planta física · C1-08',height:3.8,color:'#2e68b1',
  points:[blueEast,blueWest,[-235.9,59.1],[-230.8,58.2]],
  facades:[{edge:0,plain:true,bays:[{x:.92,w:1.03,h:2.72,b:.18,rect:true,noBars:true,door:true},{x:3.68,w:2.38,h:1.4,b:1.1,rect:true,noBars:true,frameColor:'#c5b493'}],
   bands:[{y:.38,h:.58,d:.1,color:'#b29375'},{y:1.08,x:3.68,w:2.65,h:.13,d:.35,color:'#cfba96'}],canopy:{y:3.18,depth:1.05,color:'#99564d'}}],evidence:['H01-sur-2023-12','H03-sur-2023-12']},
 {id:'C1-09',part:'hidalgo-local-blanco',owner:'Planta física · C1-09',replace:'Planta física · C1-09',height:3.3,color:'#dedbd0',
  points:[whiteEast,whiteWest,[-230.4,59.4],[-226.1,58.6]],
  facades:[{edge:0,plain:true,bays:[{x:1,w:.82,h:1.32,b:1.03,rect:true},{x:3.06,w:.82,h:1.32,b:1.03,rect:true}]}],
  lowWalls:[{a:whiteWest,b:blueEast,height:1.65,color:'#dedbd0'}],evidence:['H01-sur-2023-12','H03-sur-2023-12']},
 {id:'C1-02',part:'obregon-dos-alturas',owner:'Planta física · C1-02',replace:'Planta física · C1-02',height:7.2,color:'#b8ae9b',
  points:[[-157.233,42.314],[-174.961,44.395],[-172.615,57.397],[-154.886,52.716]],
  sections:[
   {part:'oeste-dos-niveles',height:7.2,color:'#666a68',points:[splitFront,[-174.961,44.395],[-172.615,57.397],splitBack],
    facades:[{edge:0,plain:true,bays:[... [1.2,3.34,5.5].map(x=>({x,w:1.65,h:2.68,b:.04,rect:true,noBars:true,frameColor:'#96968a'})),{x:3.35,w:5.55,h:1.65,b:4.45,rect:true,noBars:true,fillColor:'#596467',frameColor:'#adb0a9'}],
     fins:[1.5,2.42,3.35,4.28,5.2].map(x=>({x,b:4.45,h:1.65,w:.045,d:.04,color:'#bcc0b9'})),bands:[{y:3.15,h:.12,d:.17,color:'#535852'}]}]},
   {part:'este-un-nivel',height:4.3,color:'#b9aa94',points:[[-157.233,42.314],splitFront,splitBack,[-154.886,52.716]],facades:[]}
  ],evidence:['W02-sur-2023-12','W01-oeste-2025-03']}
];

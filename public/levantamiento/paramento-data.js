// Visual reconstruction, not a cadastral survey. Coordinates use the existing local frame.
// Shared frontage constrained by P08/P09 Street View rays and checked against the aerial roof edge.
// P08: heading 65 / FOV 90, blue-red x=705, red-yellow x=753 (1363px viewport).
// P09: heading 355 / FOV 80, corresponding x=475 and x=1232. Approximate camera model.
export const PARAMENTO_VERSION='paramento-obregon-hidalgo-20261007';
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

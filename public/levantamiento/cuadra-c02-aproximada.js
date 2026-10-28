// C02: visual interpretation of the retained aerial image and a historical
// press photograph. Dimensions and correspondence are approximate, not surveyed.
// The possible Edificio Soto correspondence and its post-2026 extent remain open.
const A=[-216.63450713641788,-58.51784682465417], B=[-171.051,-63.974], C=[-166.99860088200882,-41.45450353152855], D=[-165.8364320028746,-33.48811989288829], E=[-198.947,-25.748], F=[-202.336,-21.327], G=[-210.61589394658634,-19.58861507934798], H=[-212.2178685062412,-29.956688431062503];
const split=[-193.84275356820894,-61.245923412327085];
const columns=[3.2,8.4,13.6,18.7];
const obregonFront=[.65,4.05].flatMap(b=>columns.map(x=>({x,w:2.55,h:1.85,b,rect:true,noBars:true,fillColor:'#485253',frameColor:'#dedbd2'})));
const rosalesFront=[
 ...columns.map(x=>({x,w:4.15,h:3.15,b:0,rect:true,portico:true,noBars:true,fillColor:'#cecdc4'})),
 ...columns.map(x=>({x,w:2.65,h:1.5,b:4.05,rect:true,noBars:true,fillColor:'#535b57',frameColor:'#dedbd2'})),
 ...columns.map(x=>({x,w:2.15,h:.55,b:6.45,rect:true,noBars:true,fillColor:'#535b57',frameColor:'#dedbd2'}))
];
export const C02_APROXIMADA={block:'C02',orderLabel:4,evidence:'C02-inventario-y-ajuste-visual',buildings:[
 {id:'B1-01',points:[A,B,C,D,E,F,G,H],height:7.6,color:'#c6c2b6',uncertainty:3,keepDetails:true,
  sources:['C02-inventario.jpg','C02.jpg','https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=29.07605%2C-110.95693&heading=90&pitch=0'],facades:[],sections:[
   {part:'cubierta-poniente',points:[A,split,E,F,G,H],height:6.0,color:'#d7d7d0',roofColor:'#aaa89f',parapet:true,
    facades:[{edge:5,plain:true,bays:[3.5,10,16.5,23].map(x=>({x,w:4.7,h:3,b:.12,rect:true,noBars:true,fillColor:'#394643',frameColor:'#ecebe4'})),bands:[{y:3.25,h:.25,d:.18,color:'#e6e6df'}]}],roofDetails:[
    {x:-207,z:-49,w:2.6,d:2.2,h:.55,color:'#8f918a'},
    {x:-205,z:-35,w:2,d:1.8,h:.42,color:'#bdbdb2'}
   ]},
   {part:'cubierta-oriente',points:[split,B,C,D,E],height:7.6,color:'#d8d5c9',roofColor:'#deded3',parapet:true,facades:[],roofDetails:[
    {x:-188,z:-53,w:2.8,d:2.3,h:.5,color:'#b6b8ad'},
    {x:-181,z:-49,w:2.3,d:2.1,h:.72,color:'#b5b5aa'},
    {x:-176,z:-43,w:2.3,d:2.0,h:.7,color:'#aaa99d'},
    {x:-183,z:-37,w:2.9,d:2.3,h:.6,color:'#b1b0a5'}
   ]}
  ],note:'Dos cubiertas, bordes y equipos interpretados de la foto aérea; el frente oeste sugiere paños acristalados observados desde Rosales. Tamaños y alturas aproximados, no medición.'},
 {id:'B1-02',height:5.0,color:'#aaa9a2',roofColor:'#c8c9be',parapet:true,uncertainty:3,
  sources:['C02-inventario.jpg','C02.jpg'],facades:[],
  roofDetails:[-200,-198,-196,-194,-192,-190,-188].map(x=>({x,z:-11.2,w:.18,d:5.6,h:.1,color:'#9d9e95'})),
  note:'Cubierta quebrada con líneas interpretadas de la textura de la fotografía aérea; altura estimada.'},
 {id:'B1-03',height:8.2,color:'#d5d4cc',roofColor:'#d3d2c8',parapet:true,keepDetails:true,uncertainty:4,
  sources:['C02-inventario.jpg','C02.jpg','https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=29.07605%2C-110.95693&heading=90&pitch=0','https://www.elimparcial.com/son/hermosillo/2026/08/28/demuelen-antiguo-edificio-de-la-procuraduria-en-hermosillo-para-mejorar-la-distribucion-vial/'],
  facades:[{edge:3,plain:true,bays:obregonFront},{edge:4,plain:true,bays:rosalesFront,bands:[{y:3.3,h:.3,d:.3,color:'#dfddd5'}]}],
  roofDetails:[{x:-195,z:13,w:2.4,d:2.2,h:.5,color:'#aaa9a1'},{x:-190,z:18,w:2.2,d:2,h:.65,color:'#999d96'}],
  note:'Interpretación histórica del frente de la antigua Procuraduría, con pórtico y ventanas en dos franjas observados en Street View de enero de 2026; dimensiones y correspondencia registral aproximadas. La demolición de 2026 impide asumir que siga en pie.'},
 {id:'B1-04',height:7.2,color:'#d2d0c5',roofColor:'#e1e1d7',parapet:true,uncertainty:3,
  sources:['C02-inventario.jpg','C02.jpg'],facades:[],roofDetails:[
   {x:-173,z:-4,w:6,d:6,h:.24,color:'#cdcec4'},
   {x:-172,z:-4,w:1.5,d:1.4,h:.5,color:'#aeb2a8'}
  ],note:'Cubierta oriental clara con volumen menor interpretado de imagen aérea; altura y posición aproximadas.'}
]};

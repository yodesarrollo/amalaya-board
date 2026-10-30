// D1-09 / 84 · PRACTICO-2 · conservative facade H84-N-01, not a survey.
// Existing footprint, split, heights, roof colours and mineral PBR stay exact.
const p=[[-102.483,108.307],[-89.969,110.388],[-88.666,113.768],[-90.23,134.051],[-98.573,136.131],[-99.355,138.732],[-112.39,136.912],[-113.694,132.231],[-105.351,131.711]];
const t=(131.711-p[2][1])/(p[3][1]-p[2][1]);
const q=[p[2][0]+(p[3][0]-p[2][0])*t,131.711];
export const C10_84={block:'C10',evidence:'D1-09/20261030-equipo',buildings:[{
 id:'D1-09',height:6.2,color:'#d4d2c7',roofColor:'#e3e4dc',uncertainty:3,keepDetails:true,facades:[],
 surfaceMaterial:{metalness:0,roughness:.96},
 sources:['ajuste-visual/C10.jpg','evidence/D1-09/20261006-01-cierre.json'],
 sections:[
  {part:'84-nave',points:[p[0],p[1],p[2],q,p[8]],height:6.2,color:'#d4d2c7',roofColor:'#e3e4dc',facades:[
   // p0→p1 is north/Sufragio. Existing sections bypass winding reversal;
   // local -Z faces the street. Retain the exact points rather than changing
   // the shared factory. The .50/.52 band depths cross the existing .22 wall,
   // leaving only .01/.02 of visible exterior relief. They are visual boxes,
   // NOT measured construction thickness. Ray tests verify street visibility.
   {edge:0,plain:true,clipBands:true,
    bays:[
     {x:2.5,w:1.10,h:2.30,b:.06,rect:true,noBars:true,open:false,recess:.17,fillColor:'#646e69'},
     {x:8,w:4.65,h:3.35,b:.06,rect:true,noBars:true,open:false,recess:.17,fillColor:'#737c77'}
    ],
    bands:[
     {y:.26,h:.52,d:.50,color:'#b2b0a4'},
     {y:6.04,h:.18,d:.52,color:'#bebfb3'},
     // Unornamented jambs and lintels; no cornice, sign or invented identity.
     {x:1.90,w:.10,y:1.23,h:2.46,d:.50,color:'#b2b0a4'},
     {x:3.10,w:.10,y:1.23,h:2.46,d:.50,color:'#b2b0a4'},
     {x:2.5,w:1.30,y:2.41,h:.10,d:.50,color:'#b2b0a4'},
     {x:5.625,w:.10,y:1.755,h:3.51,d:.50,color:'#b2b0a4'},
     {x:10.375,w:.10,y:1.755,h:3.51,d:.50,color:'#b2b0a4'},
     {x:8,w:4.85,y:3.46,h:.10,d:.50,color:'#b2b0a4'}
    ]
   }
  ]},
  {part:'84-anexo-sur',points:[p[8],q,p[3],p[4],p[5],p[6],p[7]],height:3.5,color:'#c8c6ba',roofColor:'#c5c5ba',facades:[]}
 ],
 hypothesis:{id:'H84-N-01',status:'pendiente de decisión del propietario',scope:'Frente norte p0→p1 de 84-nave hacia Sufragio',basis:'HIPÓTESIS conservadora autorizada por PRACTICO-2; sin fotografía exacta atribuible del frente en esta entrega',proposed:['portón liso cerrado','acceso peatonal visual cerrado','zócalo interrumpido en cerramientos','jambas y dinteles planos','banda superior discreta'],access:'Representación visual únicamente; no acredita puerta existente, uso ni permiso de entrada; colisiones originales conservadas'},
 note:'Nave y anexo sur aproximados a partir de huella histórica y aérea de fecha desconocida; límite interior y alturas 6.2/3.5 m estimados sin medición. Patio exterior preservado. HIPÓTESIS H84-N-01: frente norte con portón liso cerrado y puerta peatonal cerrada, zócalo, jambas/dinteles planos y remate discreto; posición, proporción y tonos propuestos, no observados. Resto de fachadas y cubierta oculta sin detalles nuevos. Cerramientos visuales, sin paso abierto ni interiores. No certifica predio, uso ni estado actual; pendiente de decisión del propietario.'
}]};

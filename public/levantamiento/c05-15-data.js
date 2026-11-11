// 15 / C1-02 / C05 · cuadra 5 · OBREGÓN–ROSALES: DOS NIVELES, TAPROOM Y BAR LA VERBENA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   N2-oKG8-150: 2023-12, panorama oKG8On2xhMVJgSINqq7SfQ, cámara local (-189.2,32.6), rumbo 150: patio con mesas, malla y portón; C1-02 poniente oscuro de dos niveles con anuncio en azotea.
//   N3-SlP1-172: 2023-12, panorama SlP16E56G3v3vcUC8Wy7uA, cámara local (-169.2,30.7), rumbo 172: C1-02: taproom de ladrillo (oriente) y cuerpo oscuro de dos niveles (poniente).
//   E1-3cKC-224: 2025-03, panorama 3cKCXJj4nSnQBj052piFlQ, cámara local (-146.8,38.1), rumbo 224: esquina NE: C1-02 blanco con lámina ondulada, Bar La Verbena y C1-04 (1912).
//   E2-2UUS-258: 2025-03, panorama 2UUSGaghzvRBHyhbHcXLWQ, cámara local (-145.7,48.8), rumbo 258: C1-02 cara oriente (puerta, ventana, letrero) y Bar La Verbena.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// Sustituye la construcción de la ronda 2 (paramento-data.js, «obregon-dos-alturas»; no se edita):
// la aérea y la foto de la esquina NE (mar-2025) ponen el frente de Obregón 1.5–2 m al norte del
// trazo anterior. Con el frente en su lugar, la misma foto W02 da ~6.5 m al cuerpo oscuro (antes
// 7.2 m) y sus vanos se escalan en esa proporción (×0.903) sin mover su posición horizontal.
// El taproom de ladrillo tiene pretil alto en Obregón (5.4 m) y cuerpo blanco más bajo en Rosales
// (4.3 m, el de la ronda 2). El hueco de 3.7 m de la planta en Rosales entre C1-02 y C1-04 es el
// Bar La Verbena (foto E2): se agrega como sección. pruebas-paramento.mjs 67/68 se conservan.
// Bandas y molduras en tramos cortos (cada cara < 0.9 m²): la caminata las muestra completas y
// la vista ligera las omite como detalle, igual que rejas y marcos (techo de 325 KB).
const corto=(o,L)=>{const w=o.w??L,x0=(o.x??L/2)-w/2,y0=o.b??(o.y-o.h/2),vertical=o.h>w;
 const n=Math.max(1,Math.ceil((vertical?o.h*Math.max(w,o.d):w*Math.max(o.h,o.d))/.9)),out=[];
 for(let i=0;i<n;i++){const p={...o};if(vertical){const hh=o.h/n;p.h=+hh.toFixed(3);if(o.b!==undefined)p.b=+(y0+i*hh).toFixed(3);else p.y=+(y0+(i+.5)*hh).toFixed(3);}
  else{const hw=w/n;p.x=+(x0+(i+.5)*hw).toFixed(3);p.w=+hw.toFixed(3);}out.push(p);}return out;};
const oscuro='#666a68',ladrillo='#a3826f',blanco='#e8e6e0',vidrio='#2f3537',marco='#f1efe9';
const s=0.9028; // escala vertical de la ronda 2 (7.2 → 6.5 m)
export const C05_15={
 id:'C1-02',height:6.5,color:oscuro,roofColor:'#d9d6cf',uncertainty:1,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,
 points:[[-157.233,40.75],[-174.961,42.2],[-172.615,57.397],[-165.95,55.637],[-160.53,57.41],[-154.35,56.339]],
 sources:['evidence/C05/20261110-modelado/foto-N2-oKG8-150.jpg','evidence/C05/20261110-modelado/foto-N3-SlP1-172.jpg','evidence/C05/20261110-modelado/foto-E1-3cKC-224.jpg','evidence/C05/20261110-modelado/foto-E2-2UUS-258.jpg','evidence/paramento-ronda2-20261008/W02-foto.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 facades:[],
 sections:[
  // Cuerpo oscuro de dos niveles (ronda 2: vanos, parteluces y banda; alturas ×s).
  // Anuncio «Carne asada · Mariscos» en la azotea, esquina noroeste (foto N2).
  {part:'oeste-dos-niveles',points:[[-168.3,41.655],[-174.961,42.2],[-172.615,57.397],[-165.95,55.637]],height:6.5,color:oscuro,roofColor:'#d9d6cf',
   facades:[{edge:0,plain:true,reverseFins:true,bays:[...[1.2,3.34,5.5].map(x=>({x,w:1.65,h:+(2.68*s).toFixed(2),b:.04,rect:true,noBars:true,frameColor:'#96968a'})),
     {x:3.35,w:5.55,h:+(1.65*s).toFixed(2),b:+(4.45*s).toFixed(2),rect:true,noBars:true,fillColor:'#596467',frameColor:'#adb0a9'}],
    fins:[1.5,2.42,3.35,4.28,5.2].map(x=>({x,b:+(4.45*s).toFixed(2),h:+(1.65*s).toFixed(2),w:.045,d:.04,color:'#bcc0b9'})),bands:corto({y:+(3.15*s).toFixed(2),h:.12,d:.17,color:'#535852'},6.683)}],
   roofDetails:[{x:-174.2,z:45,w:.22,h:1.2,d:4,color:'#e2b13c'}]},
  // Pretil de ladrillo del taproom sobre Obregón (foto N3): ventana doble con marco
  // blanco, letrero rojo, puerta de vidrio y caja verde de medidores.
  {part:'oriente-pretil-ladrillo',points:[[-157.233,40.75],[-168.3,41.655],[-168.233,42.054],[-157.155,41.147]],height:5.4,color:ladrillo,roofColor:'#8d6a59',
   facades:[{edge:0,plain:true,reverseBands:true,bays:[{x:2.5,w:2.6,h:1.6,b:.7,rect:true,noBars:true,fillColor:vidrio,frameColor:marco,frameWidth:.1,mullion:true},
     {x:7.8,w:1.5,h:2.3,b:.05,rect:true,door:true,noBars:true,fillColor:vidrio,frameColor:marco,frameWidth:.08}],
    bands:[{x:2.5,w:1.9,y:2.65,h:.4,d:.04,color:'#c43d34'},{x:9.9,w:1.5,y:1.55,h:.6,d:.2,color:'#3f6b45'}].flatMap(o=>corto(o,11.104))}]},
  // Cuerpo blanco del taproom (cara a Rosales, fotos E1 y E2): puerta angosta, ventana
  // corrediza con letrero oscuro encima y zoclo de azulejo; la lámina ondulada asoma.
  {part:'oriente-blanco',points:[[-157.155,41.147],[-168.233,42.054],[-166.254,53.83],[-155.222,51]],height:4.3,color:blanco,roofColor:'#e2dfd8',
   facades:[{edge:0,plain:true,ciega:true,bays:[]},
    {edge:3,plain:true,reverseBands:true,bays:[{x:1.56,w:.85,h:2.1,b:.05,rect:true,door:true,noBars:true,fillColor:vidrio,frameColor:'#c9c9c4',frameWidth:.06},
     {x:3.9,w:1.6,h:1.45,b:.76,rect:true,noBars:true,fillColor:'#3a4144',frameColor:'#c9c9c4',frameWidth:.06}],
     bands:[{x:3.95,w:1.4,y:2.93,h:.48,d:.04,color:'#2b2b2b'},{y:.2,h:.4,d:.03,color:'#d2d0ca'}].flatMap(o=>corto(o,10.041))}]},
  // Bar La Verbena (foto E2): fachada estrecha pardo, puerta y portón con reja, cornisa,
  // zoclo oscuro y letras; cubierta oscura en la aérea.
  {part:'bar-la-verbena',points:[[-155.211,51.06],[-161.467,52.666],[-160.53,57.41],[-154.35,56.339]],height:4.6,color:'#8c7d6c',roofColor:'#3f4446',
   facades:[{edge:3,plain:true,reverseBands:true,bays:[{x:1.55,w:1,h:2.2,b:.05,rect:true,door:true,frontBars:true,barColor:'#1f2730',fillColor:'#34404e'},
     {x:3.85,w:1.55,h:2.3,b:.05,rect:true,frontBars:true,barColor:'#1f2730',fillColor:'#20262a'}],
    bands:[{y:.35,h:.66,d:.05,color:'#3b3532'},{y:2.85,h:.22,d:.16,color:'#5c4c3f'},{x:2.8,w:3,y:3.65,h:.45,d:.03,color:'#2f3d55'}].flatMap(o=>corto(o,5.349))}]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H15-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Obregón (dic-2023): cuerpo poniente oscuro de dos niveles con local vidriado, banda de ventanas arriba y anuncio amarillo en la azotea; al oriente taproom de ladrillo «Espuma Artesanal» con pretil más alto, ventana doble, letrero Tecate y puerta de vidrio. Esquina y Rosales (mar-2025): el taproom es blanco hacia Rosales, con lámina ondulada, puerta angosta y ventana corrediza; sigue el Bar La Verbena (fachada parda angosta con puerta y portón enrejados) hasta el edificio de 1912.',
  estimated:'Frente adelantado 1.5–2 m a la línea de la aérea y de la foto NE; alturas por proporción en las fotos (cuerpo oscuro 6.5 m, pretil 5.4 m, cuerpo blanco 4.3 m, bar 4.6 m, ±0.5 m); vanos del cuerpo oscuro de la ronda 2 escalados ×0.903; fondo del bar (6.5 m) por la mancha oscura de la aérea.',
  unchanged:'Posición horizontal de los vanos del cuerpo oscuro (ronda 2, W02), cara poniente y trasera lisas; pruebas-paramento 67/68: segundo nivel en el cuerpo poniente y un nivel al oriente.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'15/C1-02: cuerpo oscuro de dos niveles, taproom de ladrillo y blanco, y Bar La Verbena (Street View dic-2023 y mar-2025). Medidas visuales, no métricas.'
};

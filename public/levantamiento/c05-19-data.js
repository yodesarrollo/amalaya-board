// 19 / C1-06 / C05 · cuadra 5 · GRAN CUBIERTA SOBRE PINO SUÁREZ: TLM, IGLESIA Y LOCAL (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   W5-CTBD-078: 2026-01, panorama CTBDKzCC9yaKvB-wjbf3yg, cámara local (-198.2,90.5), rumbo 78: C1-06 norte: local de tres cortinas con faldón de lámina y TLM.
//   W6-6lgT-082: 2026-01, panorama 6lgTMZDwujdhISd8VtZErg, cámara local (-197.1,100.8), rumbo 82: C1-06: faldón negro TLM, muro blanco y pasaje cubierto con reja.
//   W7-HnAl-070: 2026-01, panorama HnAlGNoqvHLjuxFmAEi4dg, cámara local (-196.1,110.7), rumbo 70: C1-06 sur: Iglesia Misericordia y Verdad, puerta y letrero pintado.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// Planta registrada partida por la aérea en la cubierta blanca principal (6.0 m, foto: faldón negro
// hasta ~5.95 m) y la franja de lámina al oriente (5.4 m, sin cambio). La cara de Pino Suárez queda
// a 3.9 m de la banqueta en la planta registrada (no es «calle» para la fábrica) pero se modela con
// la foto. La planta se invierte al construir: bandas con x y fins van con reverseBands/reverseFins.
// Bandas y molduras en tramos cortos (cada cara < 0.9 m²): la caminata las muestra completas y
// la vista ligera las omite como detalle, igual que rejas y marcos (techo de 325 KB).
const corto=(o,L)=>{const w=o.w??L,x0=(o.x??L/2)-w/2,y0=o.b??(o.y-o.h/2),vertical=o.h>w;
 const n=Math.max(1,Math.ceil((vertical?o.h*Math.max(w,o.d):w*Math.max(o.h,o.d))/.9)),out=[];
 for(let i=0;i<n;i++){const p={...o};if(vertical){const hh=o.h/n;p.h=+hh.toFixed(3);if(o.b!==undefined)p.b=+(y0+i*hh).toFixed(3);else p.y=+(y0+(i+.5)*hh).toFixed(3);}
  else{const hw=w/n;p.x=+(x0+(i+.5)*hw).toFixed(3);p.w=+hw.toFixed(3);}out.push(p);}return out;};
const blanco='#ebebe7',negro='#1f2023';
export const C05_19={
 id:'C1-06',height:6,color:blanco,roofColor:'#e3ddd3',uncertainty:1,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,
 points:[[-191.386,86.261],[-171.051,82.62],[-168.965,95.362],[-162.186,94.062],[-158.536,113.305],[-185.911,119.806]],
 sources:['evidence/C05/20261110-modelado/foto-W5-CTBD-078.jpg','evidence/C05/20261110-modelado/foto-W6-6lgT-082.jpg','evidence/C05/20261110-modelado/foto-W7-HnAl-070.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 facades:[],
 sections:[
  // Arista 4 = Pino Suárez (33.99 m, del sur al norte): puerta parda al sur, puerta de la
  // iglesia, pasaje cubierto de TLM con reja, muro blanco con juntas y, al norte, local de
  // dos cortinas con faldón de lámina y armazón de toldo; faldón negro de TLM e iglesia.
  {part:'principal',points:[[-191.386,86.261],[-171.051,82.62],[-168.965,95.362],[-165.261,114.902],[-185.911,119.806]],height:6,color:blanco,roofColor:'#e3ddd3',
   facades:[{edge:4,plain:true,reverseBands:true,reverseFins:true,
    bays:[{x:4.6,w:2,h:2.7,b:.05,rect:true,shutter:true,noBars:true,fillColor:'#6b4f3a',frameColor:'#2b2b2b',frameWidth:.06},
     {x:11.8,w:1.1,h:2.35,b:.05,rect:true,door:true,noBars:true,fillColor:'#2f3539',frameColor:'#2b2b2b',frameWidth:.06},
     {x:17.55,w:6.2,h:3.6,b:.05,rect:true,portico:true,fillColor:'#c9cccb'},
     {x:30.45,w:2.1,h:3,b:.05,rect:true,shutter:true,noBars:true,fillColor:'#bfc0bb',frameColor:'#2d4f8a',frameWidth:.1},
     {x:32.65,w:1.9,h:3,b:.05,rect:true,shutter:true,noBars:true,fillColor:'#bfc0bb',frameColor:'#2d4f8a',frameWidth:.1}],
    bands:[{x:14.6,w:29.2,y:4.95,h:2,d:.08,color:negro},{x:31.6,w:4.8,y:4.95,h:2,d:.06,color:'#d6d5cf'},{x:31.6,w:4.8,y:3.45,h:.2,d:.9,color:'#5b2d2a'}].flatMap(o=>corto(o,33.989)),
    fins:[22.6,26].flatMap(x=>corto({x,b:0,h:3.9,w:.3,d:.08,color:'#e2e2de'},33.989))}]},
  {part:'oriente-lamina',points:[[-168.965,95.362],[-162.186,94.062],[-158.536,113.305],[-165.261,114.902]],height:5.4,color:'#cfcac0',roofColor:'#cfcabd',facades:[]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H19-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Pino Suárez (Street View ene-2026): muro blanco con faldón negro corrido («TLM Limpieza y Mantenimiento» e «Iglesia Misericordia y Verdad»), pasaje cubierto con reja y alambre de púas hacia una puerta de vidrio al fondo, puerta de la iglesia con letrero pintado y puerta parda al sur; al norte local de tres cortinas con faldón de lámina blanca y armazón de toldo. En la aérea, cubierta blanca grande y franja de lámina al oriente.',
  estimated:'Altura 6.0 m (faldón hasta ~5.95 m, ±0.4 m), posiciones de vanos (±1 m), fondo del pasaje (1 m en el modelo); la tercera cortina del local cae en el hueco entre C1-05 y C1-06 de las plantas registradas.',
  unchanged:'Planta registrada (±3 m) como contorno; franja de lámina con su altura anterior (5.4 m); caras interiores sin vanos supuestos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'19/C1-06: muro blanco con faldón negro (TLM e iglesia), pasaje cubierto y local de cortinas (Street View ene-2026). Medidas visuales, no métricas.'
};

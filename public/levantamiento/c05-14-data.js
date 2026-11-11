// 14 / C1-01 / C05 · cuadra 5 · ESQUINA OBREGÓN–PINO SUÁREZ, COMERCIO DE UN NIVEL (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   N1-oKG8-184: 2023-12, panorama oKG8On2xhMVJgSINqq7SfQ, cámara local (-189.2,32.6), rumbo 184: C1-01 norte (Pachos Burros) y patio con mesas y malla.
//   W1-uVxg-112: 2026-01, panorama uVxgIxiTiM9pkDTbWCVGgg, cámara local (-204.4,44.0), rumbo 112: esquina NO: C1-01 (Su Super Burro) con banda roja.
//   W2-_SAM-080: 2026-01, panorama _SAMgp_uVUVZbeDKMFcXHw, cámara local (-203.0,54.3), rumbo 80: C1-01 cara poniente: banda roja, frente enrejado, jardinera y menú.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// Planta registrada sin cambio (frente a las dos calles); altura 3.5 m de HEIGHT_REVIEWS (W02), que
// las fotos confirman (banda roja de 2.6 a 3.4 m sobre la banqueta).
// Bandas y molduras en tramos cortos (cada cara < 0.9 m²): la caminata las muestra completas y
// la vista ligera las omite como detalle, igual que rejas y marcos (techo de 325 KB).
const corto=(o,L)=>{const w=o.w??L,x0=(o.x??L/2)-w/2,y0=o.b??(o.y-o.h/2),vertical=o.h>w;
 const n=Math.max(1,Math.ceil((vertical?o.h*Math.max(w,o.d):w*Math.max(o.h,o.d))/.9)),out=[];
 for(let i=0;i<n;i++){const p={...o};if(vertical){const hh=o.h/n;p.h=+hh.toFixed(3);if(o.b!==undefined)p.b=+(y0+i*hh).toFixed(3);else p.y=+(y0+(i+.5)*hh).toFixed(3);}
  else{const hw=w/n;p.x=+(x0+(i+.5)*hw).toFixed(3);p.w=+hw.toFixed(3);}out.push(p);}return out;};
const muro='#dcdad4',reja='#2b2b2b',interior='#3a332d';
const planta=[[-198.947,44.915],[-187.997,44.135],[-185.39,59.477],[-197.643,61.037]];
const frente=(x,w)=>({x,w,h:2.55,b:.05,rect:true,frontBars:true,barColor:reja,fillColor:interior});
export const C05_14={
 id:'C1-01',height:3.5,color:muro,roofColor:'#c8c6bf',uncertainty:.8,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,points:planta,
 sources:['evidence/C05/20261110-modelado/foto-N1-oKG8-184.jpg','evidence/C05/20261110-modelado/foto-W1-uVxg-112.jpg','evidence/C05/20261110-modelado/foto-W2-_SAM-080.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 // Aristas en el orden de la planta registrada: 0 = Obregón (10.98 m, de la esquina al
 // oriente), 3 = Pino Suárez (16.17 m, del sur a la esquina). La planta se invierte al
 // construir: bandas con x y fins van con reverseBands/reverseFins.
 facades:[
  // Obregón (dic-2023, «Pachos Burros»): frente enrejado junto a la esquina, puerta de
  // vidrio, cartel, cortina metálica, banda de letrero gris y zoclo de piedra.
  {edge:0,plain:true,reverseBands:true,bays:[frente(2.3,3.0),
    {x:5.15,w:.95,h:2.3,b:.05,rect:true,door:true,noBars:true,fillColor:'#2e3438',frameColor:'#d9d6cf',frameWidth:.06},
    {x:8.9,w:1.6,h:2.4,b:.05,rect:true,shutter:true,noBars:true,fillColor:'#8f9696'}],
   bands:[{x:7.4,w:6.4,y:2.95,h:.7,d:.1,color:'#5d6470'},{x:6.95,w:1.55,y:1.5,h:1.75,d:.04,color:'#8a4f2a'},{x:7.6,w:2.4,y:.27,h:.5,d:.05,color:'#8d8274'}].flatMap(o=>corto(o,10.978))},
  // Pino Suárez (ene-2026, «Su Super Burro»): banda roja corrida, menú impreso, jardinera
  // con bugambilia, frente enrejado y el frente abierto de la esquina (asador).
  {edge:3,plain:true,reverseBands:true,bays:[frente(11,2.4),{x:14.35,w:2.9,h:2.55,b:.05,rect:true,noBars:true,fillColor:'#2f2925'}],
   bands:[{y:3,h:.8,d:.12,color:'#cf4f3b'},{x:3.4,w:5.4,y:1.5,h:1.8,d:.04,color:'#5a3550'},{x:7.9,w:3.3,y:.3,h:.55,d:.3,color:'#9a8f7e'},{x:7.9,w:3.1,y:1.5,h:1.7,d:.25,color:'#4d6b3d'}].flatMap(o=>corto(o,16.175))}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H14-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Esquina Obregón–Pino Suárez: comercio de un nivel. En Obregón (Street View dic-2023, «Pachos Burros») frente enrejado junto a la esquina, puerta de vidrio, cartel, cortina metálica, banda de letrero gris y zoclo de piedra. En Pino Suárez (ene-2026, «Su Super Burro Calientito») banda roja corrida, menú impreso, jardinera con bugambilia, frente enrejado y frente abierto con asador en la esquina.',
  estimated:'Posición y medida de vanos (±0.5–1 m), ancho de bandas, color exacto; la cara de Obregón es de dic-2023 (puede haber cambiado de letrero). El frente abierto de la esquina y el letrero alto de 2026 se resumen en un vano oscuro.',
  unchanged:'Planta registrada (±3 m), altura 3.5 m de HEIGHT_REVIEWS (W02); caras al patio y al sur sin vanos supuestos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'14/C1-01: esquina comercial de un nivel con banda de letrero, rejas y cortina (Street View dic-2023 y ene-2026). Medidas visuales, no métricas.'
};

// 17 / C1-04 / C05 · cuadra 5 · EDIFICIO DE 1912 SOBRE ROSALES, DOS NIVELES (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   E1-3cKC-224: 2025-03, panorama 3cKCXJj4nSnQBj052piFlQ, cámara local (-146.8,38.1), rumbo 224: esquina NE: C1-02 blanco con lámina ondulada, Bar La Verbena y C1-04 (1912).
//   E3-2sN0-262: 2025-03, panorama 2sN0NLM1w4GRGPYORkDqPQ, cámara local (-144.6,59.4), rumbo 262: C1-04 extremo norte: cortina con toldo, ventanas de arco, balaustrada.
//   E4-2u7_-264: 2025-03, panorama 2u7_MV735asIxUULlSE_7w, cámara local (-143.7,70.2), rumbo 264: C1-04 centro: «1912.», loggia con balcón, ventanas de abanico y portón.
//   E5-2u7_-264b: 2025-03, panorama 2u7_MV735asIxUULlSE_7w, cámara local (-143.7,70.2), rumbo 264: C1-04 planta baja: pilastras, rejas y zoclo.
//   E6-xwTl-305: 2025-03, panorama xwTlxVohnHcUyZ2NsiDldQ, cámara local (-142.8,81.0), rumbo 305: C1-04 completo en escorzo: dos niveles, balaustrada y frontón 1912.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// Edificio de dos niveles fechado «1912» en el frontón: balaustrada, loggia central con balcón y
// tres pares de arcos, ventanas de abanico con reja y pilastras guinda en planta baja, portón al
// centro y una cortina con toldo al norte. Altura: cornisa ~9.6 m y balaustrada hasta ~10.3 m
// (antes 5.3 m). Fondo de 12 m por la cubierta blanca de la aérea; el resto de la planta registrada
// queda como cuerpo trasero de 5.3 m (sin cambio) con la cubierta oscura de la aérea.
// La planta se invierte al construir: bandas con x y fins van con reverseBands/reverseFins.
// Bandas y molduras en tramos cortos (cada cara < 0.9 m²): la caminata las muestra completas y
// la vista ligera las omite como detalle, igual que rejas y marcos (techo de 325 KB).
const corto=(o,L)=>{const w=o.w??L,x0=(o.x??L/2)-w/2,y0=o.b??(o.y-o.h/2),vertical=o.h>w;
 const n=Math.max(1,Math.ceil((vertical?o.h*Math.max(w,o.d):w*Math.max(o.h,o.d))/.9)),out=[];
 for(let i=0;i<n;i++){const p={...o};if(vertical){const hh=o.h/n;p.h=+hh.toFixed(3);if(o.b!==undefined)p.b=+(y0+i*hh).toFixed(3);else p.y=+(y0+(i+.5)*hh).toFixed(3);}
  else{const hw=w/n;p.x=+(x0+(i+.5)*hw).toFixed(3);p.w=+hw.toFixed(3);}out.push(p);}return out;};
const crema='#e3d6bd',guinda='#7b3f37',cornisa='#8a5a4c',vidrio='#3b4042',tapiado='#d9cfb9';
const L=25.241,c=L/2; // arista 1 (Rosales) de norte a sur; vanos simétricos respecto al portón
const abanico=x=>({x,w:1.3,h:2.45,b:1.6,frontBars:true,barColor:'#262626',fillColor:vidrio,archFrameColor:guinda});
const extremoPB=x=>({x,w:1.35,h:2.1,b:1.4,rect:true,frontBars:true,barColor:'#262626',fillColor:vidrio,frameColor:guinda,frameWidth:.1,paintedArch:guinda});
const arcoPA=x=>({x,w:1.3,h:2.6,b:5.9,noBars:true,fillColor:tapiado,archFrameColor:guinda});
const rectPA=x=>({x,w:1.15,h:2.1,b:6.1,rect:true,noBars:true,fillColor:'#cfc6b2',frameColor:'#ece6d6',frameWidth:.14});
const bifora=x=>[-.47,.47].map(d=>({x:+(x+d).toFixed(2),w:.72,h:2.45,b:5.85,noBars:true,fillColor:'#2f3436',archFrameColor:guinda}));
const balaustres=[];for(let x=.6;x<L-.5;x+=.32)if(x<c-2.25||x>c+2.25)balaustres.push({x:+x.toFixed(2),b:9.6,h:.62,w:.07,d:.12,color:'#e4dccb'});
const barandal=[];for(let x=c-3.6;x<=c+3.6;x+=.14)barandal.push({x:+x.toFixed(2),b:5.62,h:.9,w:.022,d:.56,color:'#262626'});
export const C05_17={
 id:'C1-04',height:9.6,color:crema,roofColor:'#d8d4c8',uncertainty:1,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,
 points:[[-172.093,59.477],[-154.2,56.373],[-151.33,81.45],[-168.704,84.701]],
 sources:['evidence/C05/20261110-modelado/foto-E1-3cKC-224.jpg','evidence/C05/20261110-modelado/foto-E3-2sN0-262.jpg','evidence/C05/20261110-modelado/foto-E4-2u7_-264.jpg','evidence/C05/20261110-modelado/foto-E5-2u7_-264b.jpg','evidence/C05/20261110-modelado/foto-E6-xwTl-305.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 facades:[],
 sections:[
  {part:'frente-1912',points:[[-165.927,58.407],[-154.2,56.373],[-151.33,81.45],[-163.049,83.691]],height:9.6,color:crema,roofColor:'#d8d4c8',
   facades:[{edge:1,plain:true,reverseBands:true,reverseFins:true,
    bays:[extremoPB(3.1),{x:6.37,w:1.9,h:3,b:.05,rect:true,shutter:true,noBars:true,fillColor:'#8f9696',frameColor:guinda,frameWidth:.08},abanico(9.45),
     {x:c,w:1.6,h:4,b:.05,noBars:true,fillColor:'#8f979b',archFrameColor:guinda},abanico(15.79),abanico(18.87),extremoPB(22.14),
     arcoPA(3.1),rectPA(6.37),...bifora(c-2.32),...bifora(c),...bifora(c+2.32),rectPA(18.87),arcoPA(22.14)],
    bands:[{y:.55,h:1,d:.06,color:'#6e3a33'},{y:3.4,h:.1,d:.05,color:guinda},{y:5.35,h:.32,d:.3,color:cornisa},{y:5.75,h:.08,d:.06,color:guinda},{y:9.4,h:.3,d:.34,color:cornisa}].flatMap(o=>corto(o,L)),
    fins:[...[7.9,11,14.24,17.33].map(x=>({x,b:0,h:5.2,w:.42,d:.18,color:guinda})),
     ...[9.2,16.05].map(x=>({x,b:5.5,h:3.7,w:.3,d:.12,color:guinda})),...[11.46,13.78].map(x=>({x,b:5.6,h:2.8,w:.22,d:.1,color:guinda})),
     {x:6.37,b:3.12,h:.45,w:2.3,d:.9,color:'#1f2224'},{x:c,b:5.48,h:.14,w:7.6,d:.6,color:cornisa},...barandal,{x:c,b:6.5,h:.05,w:7.24,d:.58,color:'#262626'},
     ...balaustres,{x:c,b:10.2,h:.12,w:24.6,d:.26,color:'#e4dccb'},
     {x:c,b:9.6,h:.75,w:4.4,d:.16,color:'#e8dfca'},{x:c,b:10.35,h:.1,w:4.6,d:.22,color:cornisa},{x:c,b:9.85,h:.22,w:1,d:.17,color:'#5a4a40'}].flatMap(o=>corto(o,L))}]},
  {part:'trasero',points:[[-172.093,59.477],[-165.927,58.407],[-163.049,83.691],[-168.704,84.701]],height:5.3,color:'#cfc8b8',roofColor:'#55595a',facades:[]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H17-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Rosales (Street View mar-2025): edificio de dos niveles fechado «1912» en el frontón, crema con molduras guinda. Planta baja: siete ejes —ventanas de abanico con reja, portón gris al centro, cortina con toldo negro al norte, zoclo y pilastras guinda—. Planta alta: loggia central con balcón de herrería y tres pares de arcos con óculo, ventanas rectangulares y de arco tapiadas, cornisa y balaustrada. En la aérea la cubierta blanca tiene ~12 m de fondo y el resto del lote cubierta oscura.',
  estimated:'Altura (cornisa 9.6 m, balaustrada ~10.3 m, ±0.5 m), ejes simétricos respecto al portón (±0.5 m), medidas de vanos, balcón y balaustres; ventanas extremas de planta baja como vano rectangular con arco pintado (así se ven en la foto); fondo de 12 m del cuerpo alto; cuerpo trasero a 5.3 m.',
  unchanged:'Planta registrada (±3 m) como contorno de ambos cuerpos; cuerpo trasero con la altura anterior (5.3 m) por falta de foto.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'17/C1-04: edificio de 1912 de dos niveles con loggia, balcón, ventanas de abanico y balaustrada (Street View mar-2025). Medidas visuales, no métricas.'
};

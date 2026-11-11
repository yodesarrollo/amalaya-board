// 18 / C1-05 / C05 · cuadra 5 · PÓRTICO COMERCIAL SOBRE PINO SUÁREZ CON TERRAZA EN AZOTEA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   W3-zkr1-080: 2026-01, panorama zkr1ojX6lJNjQzrUxHDnYg, cámara local (-200.7,69.8), rumbo 80: C1-05: pórtico de columnas, faldón blanco, cortinas y terraza en azotea.
//   W4-15N5-062: 2026-01, panorama 15N50oKFyBIljzYLk4CvXw, cámara local (-199.4,80.2), rumbo 62: C1-05 sur: pórtico, cortinas, pilares de ladrillo y barandal de azotea.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// Planta registrada sin cambio. Altura 4.4 m (antes 4.2) por la foto: faldón blanco hasta el pretil.
// Las manchas en dos filas de la aérea son las mesas de la terraza «La Terraza de ¡EnQue Tucchi!».
// La planta se invierte al construir: bandas con x van con reverseBands.
// Bandas y molduras en tramos cortos (cada cara < 0.9 m²): la caminata las muestra completas y
// la vista ligera las omite como detalle, igual que rejas y marcos (techo de 325 KB).
const corto=(o,L)=>{const w=o.w??L,x0=(o.x??L/2)-w/2,y0=o.b??(o.y-o.h/2),vertical=o.h>w;
 const n=Math.max(1,Math.ceil((vertical?o.h*Math.max(w,o.d):w*Math.max(o.h,o.d))/.9)),out=[];
 for(let i=0;i<n;i++){const p={...o};if(vertical){const hh=o.h/n;p.h=+hh.toFixed(3);if(o.b!==undefined)p.b=+(y0+i*hh).toFixed(3);else p.y=+(y0+(i+.5)*hh).toFixed(3);}
  else{const hw=w/n;p.x=+(x0+(i+.5)*hw).toFixed(3);p.w=+hw.toFixed(3);}out.push(p);}return out;};
const blanco='#eeece6',cortina='#cfd0cb',poste='#5c2f2b';
const portico=(x,w)=>({x,w,h:2.55,b:.05,rect:true,portico:true,fillColor:cortina});
export const C05_18={
 id:'C1-05',height:4.4,color:blanco,roofColor:'#d6d3c9',uncertainty:.8,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,points:[[-197.643,63.637],[-188.258,62.597],[-184.608,81.06],[-192.95,83.92]],
 sources:['evidence/C05/20261110-modelado/foto-W3-zkr1-080.jpg','evidence/C05/20261110-modelado/foto-W4-15N5-062.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 // Arista 3 = Pino Suárez (20.82 m, del sur al norte): pórtico de columnas redondas
 // blancas delante de cortinas y pilares de ladrillo; faldón blanco con letrero y una
 // lona de carnes asadas en la mitad sur.
 facades:[{edge:3,plain:true,reverseBands:true,bays:[portico(1.2,1.9),portico(4.65,4),portico(9.15,4),portico(13.65,4),portico(18.15,4)],
  bands:[{x:5.2,w:9.6,y:3.45,h:1.5,d:.03,color:'#6d4b3b'},{x:15.5,w:5.5,y:3.6,h:.45,d:.02,color:'#b8353a'}].flatMap(o=>corto(o,20.819))}],
 // Postes del barandal guinda de la terraza, en las esquinas y a media cara poniente; los postes de
 // focos (~2.5 m) se acortan a 1.2 m porque pruebas-lamina acota los equipos a 1.3 m sobre la cubierta.
 roofDetails:[[-197.1,64.1],[-196,70.4],[-194.4,77.2],[-192.5,83.3],[-188.7,63.2],[-185.1,80.6]].map(([x,z])=>({x,z,w:.09,h:1.2,d:.09,color:poste})),
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H18-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Pino Suárez (Street View ene-2026): local comercial de un nivel con pórtico de columnas redondas blancas, faldón blanco con el letrero «La Terraza de ¡EnQue Tucchi!» y una lona de carnes asadas, cortinas metálicas blancas entre pilares de ladrillo y puerta de vidrio; en la azotea barandal guinda con postes y focos. En la aérea, mesas en dos filas sobre la azotea.',
  estimated:'Separación de columnas (~4.5 m, ±1 m), fondo del pórtico (1 m), altura 4.4 m (±0.4 m); postes de la terraza acortados a 1.2 m (límite de equipos de azotea de pruebas-lamina); mesas, barandal y focos no se modelan.',
  unchanged:'Planta registrada (±3 m); caras norte, oriente y sur sin vanos supuestos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'18/C1-05: pórtico comercial con faldón blanco y terraza en azotea (Street View ene-2026). Medidas visuales, no métricas.'
};

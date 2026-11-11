// 89 / D1-12 / C11 · cuadra 26 · MODELADO CON FOTO Y FORMAS ESTIMADAS (10-nov-2026).
// Criterio del propietario: con al menos una foto se modela el edificio; el genérico
// queda sólo para los edificios sin ninguna foto. Medidas visuales, no métricas.
//
// Foto: Street View dic-2023, panorama wCAjZTaNz6Qt4POhDordqw, cámara 29.0740423,
// -110.9557832, mirando al norte desde Bavispe (docs/OLA-C11-20261029.md y
// evidence/D1-12/20261029-ola1/paquete.json). Se observó un muro amarillo con vano
// superior enrejado, ventana inferior con reja saliente y nichos cuadrados.
// La cámara proyecta sobre la arista ORIGINAL 5 (frente sur, Bavispe) a 18.92 m de la
// esquina suroeste y a 3.5 m del paño: el tramo observado mide unos 7 m (14.5–22.4 m).
//
// Planta efectiva de seis vértices y dos patios, altura provisional 6.2 m e
// incertidumbre ±3 m se conservan; el orden de puntos no se invierte (área negativa).
const yellow='#d6b04e',cream='#e9ddb4',niche='#b5933f',dark='#2d3336',iron='#262626';

// Módulo observado: ventana baja con reja saliente, vano alto enrejado y, en el
// frente sur, dos nichos cuadrados a la altura del vano alto. La toma (3.5 m, campo
// de 90° a 2.5 m de altura) sólo ve el paño hasta ~4.9 m: todo lo observado queda
// por debajo de esa cota. Cotas estimadas a partir de la altura provisional de 6.2 m.
const modulo=(x,nichos)=>[
 {x,w:1.15,h:1.55,b:.95,rect:true,frontBars:true,barColor:iron,frameColor:cream,frameWidth:.08,fillColor:dark},
 {x,w:.95,h:.85,b:3.75,rect:true,barColor:iron,fillColor:dark},
 ...(nichos?[-1.45,1.45].map(d=>({x:x+d,w:.4,h:.4,b:3.95,rect:true,noBars:true,recess:.12,fillColor:niche})):[])
];
const remate={y:6.03,h:.22,d:.20,color:cream};
const serie=(inicio,paso,n)=>Array.from({length:n},(_,i)=>+(inicio+i*paso).toFixed(3));

// Frente sur (arista 5, 49.89 m): el módulo observado queda en 18.92 m y se repite
// cada 4.4 m a lo largo del mismo cuerpo (repetición ESTIMADA).
const sur=serie(18.92-3*4.4,4.4,10);
// Poniente (arista 4, 37.71 m) y norte (aristas 3 y 1): misma tipología por
// continuidad del conjunto, sin foto propia (ESTIMADO); sin nichos.
const poniente=serie(3.854,5,7),norteOeste=serie(3.337,4.6,5),norteEste=serie(3.162,4.6,4);

export const OBSERVADO_89={edge:5,x:18.92,ancho:7.1,pano:'wCAjZTaNz6Qt4POhDordqw',fecha:'2023-12'};
export const C11_89={block:'C11',evidence:'D1-12/20261110-modelado',buildings:[{
 id:'D1-12',height:6.2,color:yellow,roofColor:'#cdc5b0',uncertainty:3,parapet:true,parapetColor:'#e3d7ad',
 surfaceMaterial:{metalness:0,roughness:.95},
 // Vista ligera del celular (D3, 10-nov-2026): muro y vanos como paneles planos;
 // el recorrido 3D conserva los vanos perforados reales.
 liteLod:true,
 sources:['ajuste-visual/C11.jpg','evidence/D1-12/20261029-ola1/paquete.json'],
 facades:[
  // Arista 0: colindancia oriente dentro de la manzana; sin vanos ni remate.
  {edge:0,plain:true,bays:[]},
  {edge:1,plain:true,bays:norteEste.flatMap(x=>modulo(x,false)),bands:[remate]},
  {edge:2,plain:true,bays:[],bands:[remate]},
  {edge:3,plain:true,bays:norteOeste.flatMap(x=>modulo(x,false)),bands:[remate]},
  {edge:4,plain:true,bays:poniente.flatMap(x=>modulo(x,false)),bands:[remate]},
  {edge:5,plain:true,bays:sur.flatMap(x=>modulo(x,true)),bands:[remate]}
 ],
 hypothesis:{
  id:'H89-01',status:'modelado con foto y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Frente sur, tramo de 14.5 a 22.4 m desde la esquina suroeste: muro amarillo, ventana baja con reja saliente, vano alto enrejado y nichos cuadrados (Street View dic-2023).',
  estimated:'Repetición del módulo cada 4.4 m en el resto del frente sur; misma tipología sin nichos en poniente y norte; cotas de vanos, color exacto, remate y pretil.',
  unchanged:'Planta efectiva, dos patios, altura provisional 6.2 m, colindancia oriente y colisiones del conjunto.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Lo genérico es sólo para lo que no tiene ni una foto; con foto se modela. Sin Chrome: usar la foto documentada y la aérea; el resto como estimado.'}
 },
 note:'89/D1-12: conjunto amarillo alrededor de dos patios. Frente sur sobre Bavispe con el módulo observado en Street View dic-2023 (ventana baja con reja saliente, vano alto enrejado y nichos cuadrados) y su repetición estimada; poniente y norte con la misma tipología por continuidad, sin foto propia; oriente en colindancia sin vanos. Remate y pretil estimados. Planta, patios y altura provisional 6.2 m conservados; medidas visuales, no métricas; sin accesos ni interiores inventados.'
}]};

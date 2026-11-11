// 27 / B1-09 / C03 · cuadra 7 · TORRE CON PARASOLES MODELADA CON FOTO DE CALLE (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: H01 con cámara inclinada 25° (evidence/paramento-ronda2-20261008/
// H01-torre-foto.jpg), H01 de frente (paramento-20261007/H01-foto.jpg) y H04 desde la esquina
// Rosales / Hidalgo (paramento-ronda2-20261008/H04-foto.jpg), Street View dic-2023.
//
// Antes, la torre salía de la ronda 2 de octubre (ROUND2_BUILDINGS en paramento-data.js, que no se
// modifica): el paquete toma ese grupo como dueño, lo retira y lo reconstruye aquí con la misma
// planta y la misma altura (HEIGHT_REVIEWS 22 m), sin muros duplicados.
//
// Visto en la foto: prisma de piedra clara en placas; en la cara sur, una retícula de parasoles al
// centro con márgenes ciegos a los lados: 11 aletas verticales rojizas (la ronda 2 tenía 9) que
// bajan hasta la azotea del cuerpo bajo, bandas de 4 lamas horizontales claras entre cinco hileras
// de ventanas oscuras y una zona baja de lamas sin ventanas; pretil ciego arriba. La cara oriente es
// ciega y clara (H04) salvo una columna de vanos hundidos con marco rojizo junto a la esquina
// noreste. Antena de celosía al centro de la azotea.
// Estimado: altura 22 m por proporción visual (no medida, ±2 m); niveles de las hileras de la ronda 2
// con la parte de vidrio reducida a lo que se ve oscuro (1.1 m) y lamas en el resto; posición de la
// columna de vanos de la cara oriente por la foto H04; colores de la foto a media luz. Caras norte y
// poniente sin foto: muro ciego del mismo material.
// No modelado: la antena (rebasa el límite de 1.3 m de equipos de azotea) y una celosía de ladrillo
// al noreste cuya posición no se puede fijar. En la aérea la torre se ve desplazada ~15 m al noreste
// por la inclinación de la toma (la cara sur con sus parasoles aparece al norte del cuerpo bajo):
// el color de la azotea se toma del techo desplazado y sus equipos no se ubican.
const piedra='#d6cfc5',aleta='#9c5a48',lama='#c2ad90',vidrio='#3a3633';
const hileras=[7.6,10.3,13,15.7,18.4];
const lamas=[4.6,5.1,5.6,6.1,6.6,7.1,...hileras.flatMap(b=>[1.35,1.7,2.05,2.4].map(d=>+(b+d).toFixed(2)))];
export const C03_27={block:'C03',evidence:'C03/20261110-modelado',buildings:[{
 id:'B1-09',height:22,color:piedra,roofColor:'#dedcd4',uncertainty:2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/paramento-ronda2-20261008/H01-torre-foto.jpg','evidence/paramento-20261007/H01-foto.jpg','evidence/paramento-ronda2-20261008/H04-foto.jpg','calco/referencia.webp','ajuste-visual/C03.jpg','evidence/C03/20261110-modelado/ficha.json'],
 // Aristas de la planta registrada (área negativa, sin inversión): 0 sur (sobre el cuerpo bajo,
 // hacia Blvd. Hidalgo), 1 oriente (hacia Rosales), 2 norte, 3 poniente.
 facades:[
  {edge:0,plain:true,reverseFins:true,reverseBands:true,
   bays:hileras.map(b=>({x:7.1,w:10.2,h:1.1,b,rect:true,noBars:true,fillColor:vidrio})),
   fins:Array.from({length:11},(_,i)=>({x:+(2+i*1.02).toFixed(2),b:4.3,h:16.6,w:.09,d:.38,color:aleta})),
   bands:lamas.map(y=>({x:7.1,w:10.5,y,h:.09,d:.38,color:lama}))},
  {edge:1,plain:true,bays:hileras.map(b=>({x:16.2,w:.8,h:1.4,b,rect:true,noBars:true,recess:.5,fillColor:vidrio,frameColor:aleta,frameWidth:.12}))}],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H27-01',status:'modelado con foto de calle sobre la planta registrada',measured:false,photoreal:false,generic:false,
  observed:'Torre de piedra clara en placas; en la cara sur, retícula central de parasoles con 11 aletas verticales rojizas, bandas de lamas horizontales claras y cinco hileras de ventanas oscuras, márgenes ciegos y pretil ciego; zona baja de lamas sobre el cuerpo bajo; cara oriente ciega con una columna de vanos hundidos con marco rojizo junto a la esquina noreste; antena de celosía en la azotea.',
  estimated:'Altura 22 m por proporción visual (±2 m, HEIGHT_REVIEWS); niveles de hileras de la ronda 2 con vidrio de 1.1 m y 4 lamas entre hileras; separación de aletas 1.02 m; columna de vanos de la cara oriente en x 16.2 m por la foto H04; color de azotea tomado del techo desplazado en la aérea; colores de la foto a media luz.',
  unchanged:'Planta registrada de la ronda 2 (ROUND2_BUILDINGS, sin editar paramento-data.js) y altura 22 m; caras norte y poniente sin foto, ciegas; antena y celosía de ladrillo al noreste sin modelar; traslape con el cuerpo bajo B1-08 heredado.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'27/B1-09: torre de piedra clara con parasoles rojizos y lamas en la cara sur; modelada con las fotos H01 y H04 sobre la planta y altura de la ronda 2.'}]};

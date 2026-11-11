// 26 / B1-08 / C03 · cuadra 7 · CUERPO BAJO DE DOS PORTONES MODELADO CON FOTO DE CALLE (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: H01 (Street View, dic-2023, Blvd. Miguel Hidalgo frente a Rosales;
// evidence/paramento-20261007/H01-foto.jpg y paramento-ronda2-20261008/H01-torre-foto.jpg) y H04
// desde la esquina Rosales / Hidalgo; aérea Esri z19 (calco/referencia.webp).
//
// Antes, este frente salía de la ronda 2 de octubre (ROUND2_BUILDINGS en paramento-data.js, que no
// se modifica): el paquete toma ese grupo como dueño, lo retira y lo vuelve a construir aquí con
// la misma planta y la misma altura (HEIGHT_REVIEWS 4.2 m), así que no quedan muros duplicados.
//
// Visto en la foto: cuerpo de un nivel con aplanado claro en placas, remate rojo continuo, dos
// portones enrollables plateados con marco rojo grueso y machón entre ellos; a la izquierda una
// puerta angosta con reja y una ventanita con reja, a la derecha otra ventanita y otra puerta, todas
// con marco rojo; dos lámparas de muro arriba de las ventanitas y, sobre la azotea al pie de la
// torre, dos cajas grises de ductos que también se ven como manchas oscuras en la aérea. El remate
// rojo da vuelta a la cara oriente (H04). La explanada, la reja y los pilares de ladrillo quedan fuera
// de la planta y no se modelan.
// Estimado: vanos y lámparas a ±0.25 m sobre la foto ortogonal (la ronda 2 ya los había ajustado);
// remate de la cara poniente por simetría con la oriente; colores de la foto a media luz.
// La planta se traslapa 29 m² con la base de la torre (B1-09): el cuerpo bajo abraza su pie.
import {ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#ddd6ca',rojo='#cc4f4c',marco='#c04845',lamina='#bdb8ae';
const remate={y:4.1,h:.22,d:.3,color:rojo};
const porton=x=>({x,w:2.55,h:3.32,b:0,rect:true,noBars:true,shutter:true,fillColor:lamina,frameColor:marco,frameWidth:.18});
const chico=(x,w,h,b)=>({x,w,h,b,rect:true,frameColor:marco,frameWidth:.1});
const lampara=x=>({x,b:3.3,h:.24,w:.5,d:.2,color:'#3b3c39'});
export const C03_26={block:'C03',evidence:'C03/20261110-modelado',buildings:[{
 id:'B1-08',height:4.2,color:muro,roofColor:'#ece8dc',uncertainty:.6,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/paramento-20261007/H01-foto.jpg','evidence/paramento-ronda2-20261008/H01-torre-foto.jpg','evidence/paramento-ronda2-20261008/H04-foto.jpg','calco/referencia.webp','ajuste-visual/C03.jpg','evidence/C03/20261110-modelado/ficha.json'],
 // Aristas de la planta registrada (área negativa, sin inversión): 0 sur (Blvd. Hidalgo, tras la
 // explanada de ~9 m), 1 oriente (hacia Rosales), 2 norte (dentro de la torre), 3 poniente.
 facades:[
  {edge:0,plain:true,bands:[remate],fins:[lampara(1.37),lampara(9.43)],
   bays:[porton(4.05),porton(7.05),chico(1.05,.72,1.55,0),chico(2.05,.6,.73,.7),chico(9.15,.6,.73,.7),chico(10.1,.66,1.55,0)]},
  {edge:1,plain:true,bands:[remate],bays:[]},
  {edge:3,plain:true,bands:[remate],bays:[]}],
 // Cajas de ductos al pie de la torre (foto H01 y aérea) y una ventila pequeña en la azotea libre.
 roofDetails:[{x:-239.6,z:17.9,w:.7,h:.65,d:.7,color:'#8e9290'},{x:-237.6,z:17.5,w:.7,h:.65,d:.7,color:'#8e9290'},ventila(-239.3,23.4,.5,.5)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H26-01',status:'modelado con foto de calle sobre la planta registrada',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo de un nivel con aplanado claro en placas y remate rojo continuo; dos portones enrollables plateados con marco rojo grueso; puerta angosta y ventanita con reja a cada lado, todas con marco rojo; dos lámparas de muro; dos cajas grises de ductos sobre la azotea al pie de la torre (foto H01 y manchas oscuras en la aérea); remate rojo también en la cara oriente (foto H04).',
  estimated:'Posición y tamaño de vanos y lámparas a ±0.25 m sobre la foto; remate de la cara poniente por simetría; posición de las cajas de ductos a ±0.5 m entre foto y aérea; colores de la foto a media luz; altura 4.2 m de HEIGHT_REVIEWS, visual y no medida.',
  unchanged:'Planta registrada de la ronda 2 (ROUND2_BUILDINGS, sin editar paramento-data.js) y altura 4.2 m; traslape de 29 m² con la base de la torre B1-09 heredado del ajuste de octubre; explanada, reja y pilares de ladrillo fuera de la planta sin modelar.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'26/B1-08: cuerpo bajo de dos portones con marco rojo frente a Blvd. Hidalgo; modelado con la foto H01 sobre la planta y altura de la ronda 2.'}]};

// 2 / C2-02 / C08 · cuadra 1 · MODELADO CON FOTO DE CALLE Y FORMAS ESTIMADAS (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Foto: Street View dic-2023 desde la esquina Sufragio Efectivo–Juan Álvarez
// (c08-se-foto.jpg, cámara 29.0754386,-110.954791, rumbo 320). Se ve el frente a
// Sufragio: muro blanco azulado, cornisa blanca, puerta central de madera con dos faroles
// y cuatro ventanas altas con reja saliente (dos a cada lado). La cara al corredor de
// Juan Álvarez no aparece en ninguna foto: sus cuatro ventanas del 8-oct se conservan
// como estimación. Aérea Esri z19 (calco/referencia.webp) para cubierta y equipos.
import {ventila,calentador} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#dfe7e8',blanco='#eceee8',vidrio='#2e3437';
const ventana=(x,w)=>({x,w,h:2.75,b:.3,rect:true,frontBars:true,frameColor:blanco,frameWidth:.12,fillColor:vidrio});
const farol=x=>({x,b:3.4,h:.45,w:.24,d:.3,color:'#1d2023'});
export const C08_2={
 id:'C2-02',height:5.3,color:muro,roofColor:'#e9e3d7',uncertainty:1,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c08-cierre-20261008/c08-se-foto.jpg','evidence/c08-cierre-20261008/c08-ne-foto.jpg','calco/referencia.webp','ajuste-visual/C08.jpg','evidence/C08/20261110-modelado/ficha.json'],
 // Aristas en el orden original: 1 = corredor de Juan Álvarez (22.14 m, de norte a sur),
 // 2 = Sufragio Efectivo (18.08 m, de la esquina sureste al poniente; a 3.8 m de la
 // banqueta). Fins en ese mismo orden (reverseFins): la planta se invierte al construir.
 facades:[
  // Sufragio (foto SE): ventana, ventana, puerta de madera entre faroles, ventana, ventana.
  {edge:2,plain:true,reverseFins:true,
   bays:[ventana(2.4,1.45),ventana(4.9,1.4),{x:7.9,w:1.7,h:3.2,b:.05,rect:true,door:true,wood:true,noBars:true,fillColor:'#6e4c30',frameColor:'#d8d4c8',frameWidth:.12},ventana(11.9,1.25),ventana(14.8,1.25)],
   fins:[farol(6.75),farol(9.05)],
   bands:[{y:4.82,h:.1,d:.12,color:'#e4e6e0'},{y:5.12,h:.22,d:.24,color:'#f0f0ea'}]},
  // Corredor de Juan Álvarez: sin foto; se conservan las cuatro ventanas del 8-oct (estimadas).
  {edge:1,plain:true,bays:[4.6,10.1,15.6,20].map(x=>({x,w:1.55,h:2.55,b:.25,rect:true,frameColor:'#d8ded7'})),bands:[{y:5.02,h:.17,d:.26,color:'#d9ded3'}]}
 ],
 // Equipos de azotea: manchas oscuras vistas en la aérea (posición observada, medidas típicas).
 roofDetails:[calentador(-21.7,47.87),ventila(-26.68,60.59),ventila(-28.86,56.72,.9,1.1)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H2-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Frente a Sufragio Efectivo (Street View dic-2023): muro blanco azulado de un nivel alto, cornisa blanca, puerta central de madera de dos hojas entre dos faroles y cuatro ventanas altas con reja saliente, dos a cada lado. Cubierta clara con un equipo alargado y dos menores en la aérea.',
  estimated:'Posición y medida de vanos (±0.5 m, proyección de la foto sobre la planta), faroles y cornisa; la cara al corredor de Juan Álvarez (sin foto) conserva cuatro ventanas estimadas; equipos de azotea con medidas típicas.',
  unchanged:'Planta registrada (±3 m), altura 5.3 m estimada en la foto (8-oct), caras norte y poniente sin vanos supuestos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'2/C2-02: nave de un nivel alto con frente blanco azulado a Sufragio: puerta de madera entre faroles y cuatro ventanas con reja saliente (Street View dic-2023); corredor de Juan Álvarez con ventanas estimadas. Medidas visuales, no métricas.'
};

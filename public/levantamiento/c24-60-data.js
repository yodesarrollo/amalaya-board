// 60 / A3-04 / C24 · cuadra 18 · LOCALES SOBRE SERDÁN CON UN CUERPO DE DOS NIVELES (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido sobre Serdán (R-000 y puntos «Serdán N m»),
// reproyectadas en una elevación rectificada del paramento (evidence/C24/20261110-modelado), y la
// aérea Esri z19 (calco/referencia.webp). Sustituye la entrada aproximada del 26-oct.
//
// Visto: local gris con cortina al poniente; «Comida China» en un cuerpo de dos niveles (dos cortinas,
// dos ventanas altas y lona roja); un local rojo y «Doña Mía» con fachada roja y escaparate; un local
// blanco con cortina al oriente.
// Estimado: posición a ±2 m, altura 7.2 m del paquete de octubre para todo el frente (los locales de
// un nivel quedan con el mismo remate), colores de la foto.
const muro='#e8e2d6',rojo='#c8352e';
export const C24_60={block:'C24',evidence:'C24/20261110-modelado',buildings:[{
 id:'A3-04',height:7.2,color:muro,roofColor:'#d7d6c8',uncertainty:1.4,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/Kuwk3mZuIWZ2RDonhuaV9A.jpg','recorrido/Cf-Fao4eemggYJRuetSx3w.jpg','recorrido/xKQNROLj9VMiBGpjotie5A.jpg','recorrido/tpv4y1ErCEndgDHFQBOV6w.jpg','recorrido/hLX5pkq4RdjBOs5Vqpw-Fw.jpg','recorrido/h7Ur5HsLG4Jz2V7_ePx7zQ.jpg','recorrido/dhZr59FbZyCQKcSB4CJb5w.jpg','recorrido/TgahlLYkg_dqqZBDqpEYNQ.jpg','recorrido/Qr8oDbAjuVbJnIJg-alGgQ.jpg','calco/referencia.webp','ajuste-visual/C24.jpg','evidence/C24/20261110-modelado/ficha.json'],
 // Arista 0 = frente a Serdán (x = s − 41.11).
 facades:[{edge:0,plain:true,reverseBands:true,
  bays:[{x:1.0,w:1.3,h:2.7,b:0,rect:true,noBars:true,shutter:true,fillColor:'#8c8f8c'},
   {x:3.9,w:1.9,h:2.8,b:0,rect:true,noBars:true,shutter:true,fillColor:'#9b9d98'},
   {x:6.1,w:1.9,h:2.8,b:0,rect:true,noBars:true,shutter:true,fillColor:'#9b9d98'},
   {x:3.9,w:1.4,h:1.3,b:4.6,rect:true,noBars:true,fillColor:'#3d4648'},
   {x:6.1,w:1.4,h:1.3,b:4.6,rect:true,noBars:true,fillColor:'#3d4648'},
   {x:10.4,w:2.4,h:2.6,b:0,rect:true,noBars:true,fillColor:'#3b4246'},
   {x:14.1,w:3.3,h:2.7,b:0,rect:true,noBars:true,fillColor:'#3b4246'}],
  bands:[{x:5,w:5,y:3.3,h:.7,d:.12,color:'#c0392b'},{x:12.3,w:7,y:3.45,h:1.2,d:.12,color:rojo}]}],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H60-01',status:'modelado con fotos de calle sobre la planta de inventario',measured:false,photoreal:false,generic:false,
  observed:'Local gris con cortina; «Comida China» de dos niveles con dos cortinas, dos ventanas altas y lona roja; local rojo y «Doña Mía» con fachada roja y escaparate; local blanco con cortina.',
  estimated:'Posición de vanos a ±2 m; altura única de 7.2 m (paquete del 26-oct) aunque varios locales son de un nivel; colores de la foto; cubierta medida en la aérea.',
  unchanged:'Planta de inventario (2.0 m detrás de la línea de fachada); vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'60/A3-04: locales de Serdán con un cuerpo de dos niveles («Comida China») y fachada roja de «Doña Mía», con fotos del recorrido.'}]};

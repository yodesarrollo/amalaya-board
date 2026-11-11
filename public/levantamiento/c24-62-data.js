// 62 / A3-06 / C24 · cuadra 18 · SÚPER DEL NORTE EXPRESS SOBRE SERDÁN (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido sobre Serdán (R-000 y puntos «Serdán N m»),
// reproyectadas en una elevación rectificada del paramento (evidence/C24/20261110-modelado), y la
// aérea Esri z19 (calco/referencia.webp). Sustituye la entrada aproximada del 26-oct.
//
// Visto: caja comercial beige de paño alto con acceso acristalado, rótulo rojo «Super del Norte»,
// franja verde «Express», cartelones de producto y un vano lateral.
// Estimado: posición a ±2 m, altura 7.0 m del paquete de octubre, colores de la foto.
const muro='#cdbfa8';
export const C24_62={block:'C24',evidence:'C24/20261110-modelado',buildings:[{
 id:'A3-06',height:7.0,color:muro,roofColor:'#f0ede1',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/Kuwk3mZuIWZ2RDonhuaV9A.jpg','recorrido/Cf-Fao4eemggYJRuetSx3w.jpg','recorrido/xKQNROLj9VMiBGpjotie5A.jpg','recorrido/tpv4y1ErCEndgDHFQBOV6w.jpg','recorrido/hLX5pkq4RdjBOs5Vqpw-Fw.jpg','recorrido/h7Ur5HsLG4Jz2V7_ePx7zQ.jpg','recorrido/dhZr59FbZyCQKcSB4CJb5w.jpg','recorrido/TgahlLYkg_dqqZBDqpEYNQ.jpg','recorrido/Qr8oDbAjuVbJnIJg-alGgQ.jpg','calco/referencia.webp','ajuste-visual/C24.jpg','evidence/C24/20261110-modelado/ficha.json'],
 // Arista 0 = frente a Serdán (x = s − 82.37).
 facades:[{edge:0,plain:true,reverseBands:true,
  bays:[{x:3.4,w:1.4,h:2.4,b:0,rect:true,noBars:true,fillColor:'#353b3d'},
   {x:8.1,w:3.0,h:2.8,b:0,rect:true,noBars:true,fillColor:'#2f3437'}],
  bands:[{x:8.1,w:6,y:4.65,h:.9,d:.15,color:'#c8102e'},{x:8.6,w:4,y:3.85,h:.35,d:.12,color:'#1e8b3c'},
   {x:11.6,w:2,y:3.3,h:3.0,d:.05,color:'#8fae6a'},{x:15.1,w:2,y:3.3,h:3.0,d:.05,color:'#d9d2bd'}]}],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H62-01',status:'modelado con fotos de calle sobre la planta de inventario',measured:false,photoreal:false,generic:false,
  observed:'Caja comercial beige de paño alto con acceso acristalado, rótulo rojo «Super del Norte», franja verde «Express», cartelones y vano lateral.',
  estimated:'Posición de vanos y cartelones a ±2 m; altura 7.0 m del paquete del 26-oct; colores de la foto; cubierta medida en la aérea.',
  unchanged:'Planta de inventario (3.1 m detrás de la línea de fachada); vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'62/A3-06: Súper del Norte Express, caja beige con acceso acristalado y rótulos, con fotos del recorrido.'}]};

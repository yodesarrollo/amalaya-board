// 61 / A3-05 / C24 · cuadra 18 · LOCAL CON TOLDO, PASAJE Y EDIFICIO BLANCO SOBRE SERDÁN (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido sobre Serdán (R-000 y puntos «Serdán N m»),
// reproyectadas en una elevación rectificada del paramento (evidence/C24/20261110-modelado), y la
// aérea Esri z19 (calco/referencia.webp). Sustituye la entrada aproximada del 26-oct.
//
// Visto: local naranja con toldo café; un pasaje angosto hacia el estacionamiento interior; edificio
// blanco con escaparates, rótulo verde y ventanas altas.
// Estimado: posición a ±2 m (el edificio blanco aparece dos veces en la elevación por paralaje);
// altura 7.6 m del paquete de octubre; el pasaje queda como vano oscuro hundido, no como paso real.
const muro='#ebe8e1';
export const C24_61={block:'C24',evidence:'C24/20261110-modelado',buildings:[{
 id:'A3-05',height:7.6,color:muro,roofColor:'#a5a391',uncertainty:1.6,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/Kuwk3mZuIWZ2RDonhuaV9A.jpg','recorrido/Cf-Fao4eemggYJRuetSx3w.jpg','recorrido/xKQNROLj9VMiBGpjotie5A.jpg','recorrido/tpv4y1ErCEndgDHFQBOV6w.jpg','recorrido/hLX5pkq4RdjBOs5Vqpw-Fw.jpg','recorrido/h7Ur5HsLG4Jz2V7_ePx7zQ.jpg','recorrido/dhZr59FbZyCQKcSB4CJb5w.jpg','recorrido/TgahlLYkg_dqqZBDqpEYNQ.jpg','recorrido/Qr8oDbAjuVbJnIJg-alGgQ.jpg','calco/referencia.webp','ajuste-visual/C24.jpg','evidence/C24/20261110-modelado/ficha.json'],
 // Arista 0 = frente a Serdán (x = s − 61.72).
 facades:[{edge:0,plain:true,reverseBands:true,
  bays:[{x:3.8,w:3.4,h:2.6,b:0,rect:true,noBars:true,fillColor:'#3a3c3e'},
   {x:6.55,w:1.6,h:3.0,b:.05,rect:true,noBars:true,recess:.8,fillColor:'#2b2d2e'},
   {x:9.55,w:2.3,h:2.7,b:0,rect:true,noBars:true,fillColor:'#38454a'},
   {x:16.1,w:3.2,h:2.7,b:0,rect:true,noBars:true,fillColor:'#38454a'},
   {x:9.55,w:1.2,h:1.3,b:4.6,rect:true,noBars:true,fillColor:'#3d4648'},
   {x:12.6,w:1.2,h:1.3,b:4.6,rect:true,noBars:true,fillColor:'#3d4648'},
   {x:15.6,w:1.2,h:1.3,b:4.6,rect:true,noBars:true,fillColor:'#3d4648'}],
  bands:[{x:3.8,w:4.6,y:3.25,h:1.1,d:.12,color:'#e0742c'},{x:3.8,w:4.4,y:2.75,h:.22,d:.8,color:'#6b3b22'},{x:12.4,w:4,y:3.15,h:.4,d:.1,color:'#2e8b57'}]}],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H61-01',status:'modelado con fotos de calle sobre la planta de inventario',measured:false,photoreal:false,generic:false,
  observed:'Local naranja con toldo café; pasaje angosto hacia el estacionamiento interior; edificio blanco con escaparates, rótulo verde y ventanas altas.',
  estimated:'Posición de vanos a ±2 m (el edificio blanco sale dos veces en la elevación por paralaje); altura 7.6 m del paquete del 26-oct aunque el edificio blanco parece de tres niveles; pasaje como vano oscuro hundido; cubierta medida en la aérea.',
  unchanged:'Planta de inventario (2.6 m detrás de la línea de fachada); vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'61/A3-05: local con toldo, pasaje y edificio blanco con rótulo verde sobre Serdán, con fotos del recorrido.'}]};

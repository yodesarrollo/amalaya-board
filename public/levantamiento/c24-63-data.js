// 63 / A3-07 / C24 · cuadra 18 · LOCAL BANCARIO EN LA ESQUINA SERDÁN / ABASOLO (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido sobre Serdán (R-000 y puntos «Serdán N m»),
// reproyectadas en una elevación rectificada del paramento (evidence/C24/20261110-modelado), y la
// aérea Esri z19 (calco/referencia.webp). Sustituye la entrada aproximada del 26-oct.
//
// Visto (Serdán, panorámicas R-000 punto 6 y «Serdán 94 m»): paño beige alto con planta baja
// acristalada y franja blanca de rótulo bancario. La cara a Abasolo no tiene foto: fábrica
// «comercio» porque queda a menos de 4 m de la banqueta.
// Estimado: altura 7.0 m por la foto (el inventario decía 6.2 m), posición a ±2 m.
const muro='#d8cdb8';
export const C24_63={block:'C24',evidence:'C24/20261110-modelado',buildings:[{
 id:'A3-07',height:7.0,color:muro,roofColor:'#f5f2e7',uncertainty:1.4,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/Qr8oDbAjuVbJnIJg-alGgQ.jpg','recorrido/TgahlLYkg_dqqZBDqpEYNQ.jpg','calco/referencia.webp','ajuste-visual/C24.jpg','evidence/C24/20261110-modelado/ficha.json'],
 // Aristas de la planta de inventario: 0 Serdán (x = s − 105.17), 1 Abasolo.
 facades:[{edge:0,plain:true,reverseBands:true,
  bays:[{x:3.1,w:5.0,h:2.6,b:0,rect:true,noBars:true,fillColor:'#2c3236'}],
  bands:[{x:3.1,w:5.6,y:2.95,h:.5,d:.12,color:'#f2f2ee'}]},
  {edge:1,tipo:'comercio'}],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle; comercio en Abasolo',fotoCalle:true},
 hypothesis:{id:'H63-01',status:'modelado con foto de calle y fábrica en la cara sin foto',measured:false,photoreal:false,generic:false,
  observed:'Paño beige alto sobre Serdán con planta baja acristalada y franja blanca de rótulo bancario.',
  estimated:'Altura 7.0 m por la foto (inventario 6.2 m); posición del escaparate a ±2 m; cara a Abasolo por tipología «comercio» (sin foto); cubierta medida en la aérea.',
  unchanged:'Planta de inventario (4.7 m detrás de la línea de Serdán); vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'63/A3-07: local bancario en la esquina de Serdán y Abasolo; Serdán con foto, Abasolo por tipología.'}]};

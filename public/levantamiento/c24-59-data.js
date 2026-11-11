// 59 / A3-03 / C24 · cuadra 18 · FRENTE COMERCIAL DE UN NIVEL SOBRE SERDÁN (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido sobre Serdán (R-000 y puntos «Serdán N m»),
// reproyectadas en una elevación rectificada del paramento (evidence/C24/20261110-modelado), y la
// aérea Esri z19 (calco/referencia.webp). Sustituye la entrada aproximada del 26-oct.
//
// Visto: tres locales de un nivel con aplanado crema: dos con arco y remate rosa (cortina naranja y
// puerta) y el del rótulo «Calle Serdán #107» con faldón café y cortina gris. El OXXO queda al
// poniente, en el hueco del inventario (sección de 65/CH-GA-OXXO).
// Estimado: posición de los locales a ±2 m (paralaje de la elevación rectificada), altura 5.2 m del
// paquete de octubre, colores de la foto a media luz. Planta de inventario conservada.
const muro='#e7dfcf',rosa='#d98fa0',cafe='#7a5a3c';
export const C24_59={block:'C24',evidence:'C24/20261110-modelado',buildings:[{
 id:'A3-03',height:5.2,color:muro,roofColor:'#e1ded1',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/Kuwk3mZuIWZ2RDonhuaV9A.jpg','recorrido/Cf-Fao4eemggYJRuetSx3w.jpg','recorrido/xKQNROLj9VMiBGpjotie5A.jpg','recorrido/tpv4y1ErCEndgDHFQBOV6w.jpg','recorrido/hLX5pkq4RdjBOs5Vqpw-Fw.jpg','recorrido/h7Ur5HsLG4Jz2V7_ePx7zQ.jpg','recorrido/dhZr59FbZyCQKcSB4CJb5w.jpg','recorrido/TgahlLYkg_dqqZBDqpEYNQ.jpg','recorrido/Qr8oDbAjuVbJnIJg-alGgQ.jpg','calco/referencia.webp','ajuste-visual/C24.jpg','evidence/C24/20261110-modelado/ficha.json'],
 // Arista 0 = frente a Serdán (de poniente a oriente; x = s − 22.35 sobre la línea de fachada).
 facades:[{edge:0,plain:true,reverseBands:true,
  bays:[{x:4.9,w:4.3,h:2.9,b:0,rect:true,noBars:true,shutter:true,fillColor:'#d9874e',frameColor:rosa,frameWidth:.12},
   {x:9.45,w:1.3,h:2.6,b:0,rect:true,door:true,frameColor:rosa,frameWidth:.12},
   {x:13.8,w:4.0,h:2.9,b:0,rect:true,noBars:true,shutter:true,fillColor:'#9a9a96'}],
  bands:[{x:6,w:9,y:4.55,h:.35,d:.15,color:rosa},{x:13.8,w:4.6,y:3.3,h:.6,d:.2,color:cafe}]}],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H59-01',status:'modelado con fotos de calle sobre la planta de inventario',measured:false,photoreal:false,generic:false,
  observed:'Tres locales de un nivel sobre Serdán: dos con arco y remate rosa (cortina naranja y puerta) y uno con faldón café y cortina gris («Calle Serdán #107»).',
  estimated:'Posición de vanos a ±2 m por la paralaje de la elevación rectificada; altura 5.2 m del paquete del 26-oct; colores de la foto; color de cubierta medido en la aérea sin la vegetación del patio.',
  unchanged:'Planta de inventario (2.7 m detrás de la línea de fachada); patio con árboles al poniente dentro de la planta; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'59/A3-03: tres locales de un nivel con remate rosa y faldón café sobre Serdán, con fotos del recorrido.'}]};

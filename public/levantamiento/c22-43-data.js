// 43 / C3-01 / C22 · cuadra 11 · ESTRUCTURA ABIERTA DE CUBIERTAS PLEGADAS, CON FOTO DE CALLE (11-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panoramas del recorrido R-001 sobre Obregón (P08 en la esquina con
// Garmendia, P09 y P10 frente al edificio; Street View, dic-2023 según la revisión de octubre) y
// aérea Esri z19 (calco/referencia.webp, ajuste-visual/C22.jpg).
//
// Hoy este edificio sale del frente «estructura-sur» del paramento de octubre (FRONT_BUILDINGS en
// paramento-data.js, que no se edita). El paquete toma ese grupo como dueño, lo retira y lo vuelve a
// construir aquí con la MISMA planta y la MISMA altura (5.4 m): sus 118 colisiones quedan idénticas
// (pruebas-c1-13-enjambre) y no hay muros duplicados. No lleva marca de fábrica a propósito: es una
// estructura abierta con vanos sin cierre, y la prueba de la fábrica exige un modelo detrás de cada
// vano; por lo mismo no lleva equipos sobre la cubierta (pruebas-lamina fija su altura exacta).
//
// Visto en las fotos: espacio abierto de mesas bajo cubiertas plegadas sobre columnas inclinadas
// pintadas de blanco (una con mural); borde de la cubierta con plafón gris y remate rojo ladrillo;
// murete blanco con barandal negro en Obregón y en Garmendia; hacia el oriente, un quiosco acristalado
// de marcos grises (x 92.3–96.2) y, bajo la misma cubierta, un cuerpo cerrado de lámina galvanizada
// con rejilla de ventilación y puerta de servicio (desde x 96.2 hasta OB-21); al fondo, un muro de
// ladrillo con vanos. En la aérea, seis pliegues en V sobre la cubierta clara (mediana #e4dccc).
// Estimado: posición de los vanos a ±0.5 m sobre la foto; la cubierta plegada se representa plana a
// 5.4 m (los pliegues y las columnas inclinadas no se reproducen); el barandal no se modela (sólo el
// murete); la lámina se pinta como banda sobre el muro; el frente a Sufragio Efectivo y el sur de
// Garmendia no se ven en ninguna foto: barda con un acceso.
// Sin cambio: la planta del paramento queda 1.6–3.2 m detrás del borde de la cubierta que muestra la
// aérea; moverla cambiaría las colisiones auditadas, así que se conserva y se anota como límite. La
// huella provisional de OB-21 (x 100.6–114.3) sigue ocupando el tramo de lámina x 100.6–107.6.
const blanco='#e2e0d8',ladrillo='#a65a4a',plafon='#5f6466',vidrio='#3b4a50',marcoGris='#5b6264',lamina='#aeb4b5';
// Vanos abiertos del espacio de mesas: murete de 0.6 m y borde de cubierta de 1.2 m.
const abierto=(x,w=3.8)=>({x,w,h:3.6,b:.6,rect:true,open:true,noBars:true});
const panel=x=>({x,w:1.6,h:2.2,b:.3,rect:true,noBars:true,fillColor:vidrio,frameColor:marcoGris,frameWidth:.08});
const borde=[{y:4.35,h:.3,d:.06,color:plafon},{y:4.95,h:.9,d:.16,color:ladrillo}];
export const C22_43={block:'C22',evidence:'C22/20261111-modelado',buildings:[{
 id:'C3-01',height:5.4,color:blanco,roofColor:'#e4dccc',uncertainty:1.6,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/lKsrvsfkAzaSnxEQUwrxfA.jpg','recorrido/mxEvNEtgLgOSxKsRFwCiHg.jpg','recorrido/lYkbkN5HLT-6YQS4vIsd2g.jpg','evidence/paramento-20261007/revision.json','calco/referencia.webp','ajuste-visual/C22.jpg','evidence/C3-01/20261006-01-cierre.json','evidence/C22/20261111-modelado/ficha.json'],
 // Aristas de la planta registrada (paramento, sin points propios): 0 Obregón (de oriente a
 // poniente, x 99.95 → 75.33), 1 y 2 Garmendia, 3 y 4 Sufragio Efectivo, 5 hacia C3-02, 6 y 7 contra OB-21.
 facades:[
  // Lámina con rejilla (x 99.95–96.2), quiosco acristalado con el hueco oscuro bajo la cubierta
  // encima (x 96.0–92.3) y cuatro vanos abiertos hasta la esquina con Garmendia.
  {edge:0,plain:true,bands:[...borde,{x:1.875,w:3.75,y:2.1,h:4.2,d:.03,color:lamina}],
   bays:[{x:1.9,w:1.1,h:.7,b:2,rect:true,noBars:true,fillColor:'#8a9091',frameColor:'#9aa0a1',frameWidth:.05},
    panel(4.85),panel(6.65),{x:5.85,w:3.6,h:1.45,b:2.75,rect:true,open:true,noBars:true},
    abierto(9.981),abierto(14.144),abierto(18.306),abierto(22.469)]},
  {edge:1,plain:true,bands:borde,bays:[abierto(2.49,3.9)]},
  {edge:2,plain:true,bands:borde,bays:[abierto(2.5,3.9),abierto(6.75,3.9)]},
  {edge:3,tipo:'muro',colorRemate:ladrillo},
  {edge:4,tipo:'muro',colorRemate:ladrillo}],
 hypothesis:{id:'H43-01',status:'reconstruido con foto de calle sobre la planta y altura del paramento de octubre',measured:false,photoreal:false,generic:false,
  observed:'Espacio abierto de mesas bajo cubiertas plegadas sobre columnas inclinadas blancas; borde de cubierta con plafón gris y remate rojo ladrillo; murete blanco con barandal negro en Obregón y Garmendia; quiosco acristalado de marcos grises; cuerpo de lámina galvanizada con rejilla y puerta de servicio bajo la misma cubierta; muro de ladrillo con vanos al fondo (fotos P08, P09 y P10). En la aérea, seis pliegues en V sobre la cubierta clara (mediana #e4dccc).',
  estimated:'Posición y tamaño de los vanos a ±0.5 m; cubierta plegada representada plana a 5.4 m; columnas inclinadas, pliegues y barandal sin modelar; lámina como banda de color; frente a Sufragio Efectivo y tramo sur de Garmendia sin foto: barda con un acceso; colores de la foto a media luz.',
  unchanged:'Planta registrada del paramento de octubre (frente estructura-sur, paramento-data.js sin editar) y altura de 5.4 m, con sus 118 colisiones; la planta queda 1.6–3.2 m detrás del borde de la cubierta que muestra la aérea; la esquina ocupada por la huella provisional de OB-21 queda recortada como antes.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'43/C3-01: estructura abierta de cubiertas plegadas con quiosco acristalado y cuerpo de lámina en Obregón; foto de calle P08–P10 sobre la planta y altura del paramento.'}]};

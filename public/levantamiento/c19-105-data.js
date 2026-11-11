// 105 / C2-11 / C19 · cuadra 29 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: tramo oriental de la misma franja sobre Sufragio Efectivo, de cubierta
// oscura (mediana #403929), junto a la entrada del carril de estacionamiento. La planta de
// inventario (±3 m) caía sobre ese carril, con autos estacionados en la aérea: se traza el tramo
// visto (±1 m) y el carril queda abierto. Frente estimado como barda con un portón.
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
const muro='#cdbfa4';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],parapet=true)=>({part,points,height:4.0,color:muro,roofColor,parapet,parapetColor:'#ddd5c2',facades,roofDetails});
export const C19_105={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'C2-11',height:4.0,color:muro,roofColor:'#403929',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/C2-11/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de scripts/frentes-calle-lib.mjs (banqueta de C19) y se prueban en pruebas-fabrica.
 sections:[
  seccion('105-frente',[[19,70.06],[26,68.01],[26,73.47],[19,75.51]],'#403929',[{edge:0,tipo:'muro'}])  // techo medido #403929
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H105-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Tramo oriental de la franja de Sufragio Efectivo con cubierta oscura, junto a la entrada del carril de estacionamiento con autos.',
  estimated:'Altura 4.0 m por tipología, contorno a ±1 m, frente como barda con un acceso (portón), color de muro.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; el carril de estacionamiento queda abierto; registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'105/C2-11: frente de Sufragio Efectivo junto al estacionamiento; aérea + fachada tipológica (sin foto de calle).'}]};

// 104 / C2-10 / C19 · cuadra 29 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: franja de un nivel sobre Sufragio Efectivo, entre la esquina y el carril
// de estacionamiento, con muros claros y dos divisiones; este tramo tiene la cubierta clara
// moteada (mediana #9a967a). Detrás queda el jardín arbolado, abierto. La planta de inventario
// (±3 m) se extendía 11 m sobre ese jardín: se traza la franja vista (±1 m). La aérea no
// distingue si la cubierta es losa o patio techado; se modela cubierta continua.
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
const muro='#d2c6ad';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],parapet=true)=>({part,points,height:4.0,color:muro,roofColor,parapet,parapetColor:'#ddd5c2',facades,roofDetails});
export const C19_104={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'C2-10',height:4.0,color:muro,roofColor:'#9a967a',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/C2-10/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de scripts/frentes-calle-lib.mjs (banqueta de C19) y se prueban en pruebas-fabrica.
 sections:[
  seccion('104-frente',[[11.95,72.12],[19,70.06],[19,75.51],[11.95,77.56]],'#9a967a',[{edge:0,tipo:'casa',puertas:['centro']}])  // techo medido #9a967a
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H104-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Franja de un nivel sobre Sufragio Efectivo con muros claros y divisiones interiores; cubierta clara moteada; jardín arbolado detrás, abierto.',
  estimated:'Altura 4.0 m por tipología, contorno a ±1 m, cubierta continua (la aérea no distingue losa de patio techado), vanos por tipología casa de un nivel, color de muro.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; el jardín posterior queda abierto; registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'104/C2-10: frente de Sufragio Efectivo; aérea + fachada tipológica (sin foto de calle).'}]};

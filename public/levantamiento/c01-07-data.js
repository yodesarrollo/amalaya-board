// 07 / B1-05 / C01 · cuadra 3 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C01.jpg). No hay foto de calle de C01 en el repositorio.
//
// Visto en la aérea: cuerpo poniente del conjunto bancario de Serdán–Yáñez, azotea blanca plana
// (mediana #fdfbf7) con ocho condensadores de aire junto a sus bordes sur y oriente. Al norte,
// entre la azotea y la banqueta de Serdán, una franja oscura de unos 6 m con arbolado (queda
// abierta); al poniente, una banda oscura sobre el estacionamiento. La planta de inventario (±3 m)
// se corría 3–4 m al poniente sobre esa banda: se traza la azotea vista como una sección (±1 m) y
// la planta queda como registro.
// Estimado: altura 4.0 m por tipología (el inventario no dice «cuerpo bajo»), frente comercial
// de un nivel hacia Serdán y puerta hacia el estacionamiento poniente, color de muro.
// En esta aérea las bandas oscuras al poniente y al norte de los cuerpos y de la barda son
// sombra o arbolado: no se usan como medida y las alturas son tipológicas.
const muro='#dcd6c8';
const aire=(x,z)=>({x,z,w:.9,h:.8,d:.7,color:'#9c9b93'});  // condensador de aire acondicionado visto en la aérea (medidas típicas)
const seccion=(part,points,roofColor,facades=[],roofDetails=[],o={})=>({part,points,height:o.height??4.0,color:o.color??muro,roofColor,parapet:o.parapet??true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C01_07={block:'C01',evidence:'C01/20261110-modelado',buildings:[{
 id:'B1-05',height:4.0,color:muro,roofColor:'#e6e2d6',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C01.jpg','calco/referencia.webp','evidence/B1-05/20261006-01-cierre.json','evidence/C01/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  seccion('07-cuerpo',[[-137.3,-67.3],[-118.35,-69.9],[-116.5,-51.1],[-134.7,-48.7]],'#e6e2d6',[{edge:0,tipo:'comercio'},{edge:3,tipo:'casa',puertas:['centro']}],[aire(-120.4,-57.6),aire(-118.6,-57.8),aire(-119,-51.8),aire(-123,-51.7),aire(-124.4,-51.6),aire(-125.6,-51.2),aire(-130.8,-50.5),aire(-132,-50.2)])  // techo medido #fdfbf7
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'comercio',fotoCalle:false,secciones:1},
 hypothesis:{id:'H07-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo poniente del conjunto bancario de Serdán–Yáñez: azotea blanca plana con pretil y ocho condensadores de aire junto a los bordes sur y oriente; franja oscura con arbolado entre la azotea y la banqueta de Serdán; estacionamiento al poniente y al sur.',
  estimated:'Altura 4.0 m por tipología (±0.7 m), contorno a ±1 m, frente comercial de un nivel (cortinas, tipología comercio) hacia Serdán y casa de un nivel con puerta hacia el estacionamiento, color de muro y remates.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; registro individual de B1-05; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'7/B1-05: cuerpo poniente del conjunto bancario; aérea + fachada tipológica (sin foto de calle).'}]};

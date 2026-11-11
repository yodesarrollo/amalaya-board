// 103 / C2-09 / C19 · cuadra 29 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: cuerpo de esquina Sufragio Efectivo–Juan Álvarez con azotea blanca
// (mediana #f8f2ec) que llega a ambas banquetas y una franja angosta que sigue al sur sobre
// Juan Álvarez. La planta de inventario (±3 m, trazada sobre otra imagen) quedaba 2.5 m corta
// hacia el oriente: se traza una sección sobre la aérea (±1 m) y la planta queda como registro.
// Estimado: vanos por tipología casa de un nivel (fábrica de fachadas) en las dos caras a la
// calle, color de muro y altura; medidas visuales, no métricas.
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
const muro='#d9cbb0';
const seccion=(part,points,roofColor,facades=[],roofDetails=[],parapet=true)=>({part,points,height:4.0,color:muro,roofColor,parapet,parapetColor:'#ddd5c2',facades,roofDetails});
export const C19_103={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'C2-09',height:4.0,color:muro,roofColor:'#e6e2d6',uncertainty:.7,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/C2-09/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections); las de
 // calle salen de scripts/frentes-calle-lib.mjs (banqueta de C19) y se prueban en pruebas-fabrica.
 sections:[
  seccion('103-esquina',[[0.15,75.11],[11.8,72.16],[11.9,82.4],[6.5,82.7],[6.5,85.3],[0.8,85.3]],'#e6e2d6',[{edge:0,tipo:'casa',puertas:['centro']},{edge:5,tipo:'casa',sinPuerta:true}])  // techo medido #f8f2ec
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H103-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Esquina Sufragio Efectivo–Juan Álvarez: azotea blanca plana con pretil que llega a ambas banquetas y franja angosta que sigue al sur sobre Juan Álvarez; patio oscuro al sureste.',
  estimated:'Altura 4.0 m por tipología, contorno a ±1 m sobre la aérea, vanos por tipología casa de un nivel (puerta sobre Sufragio Efectivo), color de muro.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; registro individual; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'103/C2-09: esquina Sufragio–Juan Álvarez; aérea + fachada tipológica (sin foto de calle).'}]};

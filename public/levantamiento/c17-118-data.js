// 118 / D3-18 / C17 · cuadra 32 · MODELADO POR SECCIÓN CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026, 18:36): «más que genérico, una versión aceptable a la
// realidad según las fotos»; el genérico queda para lo que no tiene ninguna foto.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C17.jpg). No hay foto de calle de C17 en el repositorio.
//
// Visto en la aérea: cuerpo alargado norte–sur de azotea blanca (mediana #fcf7ec) en la punta
// norte de la manzana del cerro, con la cara poniente sobre Profesor Enrique Quijada. La planta
// de inventario (±3 m) cubría al oriente una franja de terreno rocoso (oscura, mediana #a69d86)
// que llega a 2.6 m de ancho en el extremo sur: el cuerpo se traza como una sección a ±0.5 m y la
// franja queda abierta. La planta de inventario se conserva como registro. Sin patios, alberca ni
// equipos de azotea visibles (la mancha más oscura del techo tiene luminancia 210 de 245).
// Estimado: altura 4.0 m por tipología (el inventario no lo registra como cuerpo bajo), fachada
// «casa de un nivel» en la cara a la calle y en la norte (a menos de 4 m de la banqueta), color
// de muro; medidas visuales, no métricas. En esta aérea el sol viene del este: la banda oscura
// al poniente es calle y sombra, no una medida de altura.
const muro='#d6cbb3',blanco='#e6e2d6',pretil='#ddd5c2';
export const C17_118={block:'C17',evidence:'C17/20261110-modelado',buildings:[{
 id:'D3-18',height:4.0,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,parapetColor:pretil,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C17.jpg','calco/referencia.webp','evidence/D3-18/20261006-01-cierre.json','evidence/C17/20261110-modelado/ficha.json'],
 // Aristas en el orden de la sección tal como está escrita (normalizeSections): 0 norte,
 // 1 oriente (terreno del cerro), 2 sur (interior de la manzana), 3 poniente (Profesor Enrique
 // Quijada). La 3 da a la calle según frentes-calle-lib.mjs con cualquier línea de fachada (tiras
 // de banqueta o límite de manzana); la 0 queda a 3.1 m en promedio de la banqueta.
 sections:[{part:'118-cuerpo',points:[[97.9,188.9],[103.5,188.4],[103.4,199.9],[99.7,201.0]],height:4.0,
  color:muro,roofColor:blanco,parapet:true,parapetColor:pretil,
  facades:[{edge:3,tipo:'casa',puertas:['centro']},{edge:0,tipo:'casa',sinPuerta:true}],roofDetails:[]}],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H118-01',status:'modelado por sección con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo alargado norte–sur de azotea blanca en la punta norte de C17, cara poniente sobre Profesor Enrique Quijada tras una banqueta angosta; al oriente, terreno rocoso descubierto que la planta de inventario cubría; sin patios, alberca ni equipos de azotea visibles.',
  estimated:'Altura 4.0 m por tipología (±0.7 m), contorno de la sección a ±0.5 m, vanos por tipología casa de un nivel en las caras poniente (calle, puerta central) y norte (a menos de 4 m de la banqueta), color de muro y remates.',
  unchanged:'Planta de inventario (±3 m) conservada como registro; registro individual de D3-18; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'118/D3-18: cuerpo de azotea blanca sobre Profesor Enrique Quijada; aérea + fachada tipológica (sin foto de calle).'}]};

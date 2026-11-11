// 99 / D2-07 / C09 · cuadra 28 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C09.jpg). No hay foto de calle de C09 en el repositorio.
//
// Visto en la aérea: cuerpo central con patio sobre Mina; azotea blanca (mediana #f7f2e7).
// Estimado: fachada por tipología (fábrica de fachadas) en las caras que dan a la calle,
// color de muro y altura (4.0 m: mediana de los frentes de un nivel del centro con Street View); medidas visuales, no métricas.
export const C09_99={block:'C09',evidence:'C09/20261110-modelado',buildings:[{
 id:'D2-07',height:4.0,color:'#d8cdb5',roofColor:'#e6e2d6',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C09.jpg','calco/referencia.webp','evidence/D2-07/20261006-01-cierre.json','evidence/C09/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta; las de calle salen de frentes-calle-lib.mjs
 // (banqueta de C09) y las que quedan a menos de 4 m de la banqueta también se ven.
 facades:[{edge:4,tipo:'casa',puertas:['centro']}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H99-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo central con patio y frente a Mina; azotea blanca.',
  estimated:'Altura 4.0 m por tipología, vanos por tipología casa de un nivel, color de muro.',
  unchanged:'Planta de inventario (±3 m) con su patio y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'99/D2-07: aérea + fachada tipológica (sin foto de calle).'}]};

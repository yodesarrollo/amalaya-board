// 109 / D2-13 / C19 · cuadra 29 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: cuerpo de azotea clara gris (mediana #c5c6b8) sobre Juan Álvarez, entre la
// L de 108 y un patio oscuro al sur. La planta ajustada de inventario (±3 m) coincide con la aérea
// dentro de su tolerancia y se conserva.
// Estimado: fachada por tipología (fábrica de fachadas) en las caras a la calle, color de muro y
// altura (4.0 m: mediana de los frentes de un nivel del centro con Street View).
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
export const C19_109={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'D2-13',height:4.0,color:'#d3c7ae',roofColor:'#c5c6b8',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/D2-13/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta ajustada; las de calle salen de
 // scripts/frentes-calle-lib.mjs (banqueta de C19) y se comprueban en pruebas-fabrica.
 facades:[{edge:3,tipo:'casa',puertas:['centro']},{edge:4,tipo:'casa',sinPuerta:true}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H109-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo de un nivel con azotea clara gris sobre Juan Álvarez, entre la L de 108 y un patio oscuro al sur.',
  estimated:'Altura 4.0 m por tipología, vanos por tipología casa de un nivel en el frente de Juan Álvarez (puerta en el tramo norte), color de muro.',
  unchanged:'Planta ajustada de inventario (±3 m) y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'109/D2-13: frente de Juan Álvarez; aérea + fachada tipológica (sin foto de calle).'}]};  // techo medido #c5c6b8

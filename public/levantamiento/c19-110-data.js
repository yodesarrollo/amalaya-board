// 110 / D2-14 / C19 · cuadra 29 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C19.jpg). No hay foto de calle de C19 en el repositorio.
//
// Visto en la aérea: cuerpo meridional sobre Juan Álvarez con lámina gris azulada y un recinto
// oscuro al frente (mediana conjunta #7e8074); al sur, terreno abierto hacia el estacionamiento.
// Planta ajustada de inventario (±3 m) conservada.
// Estimado: fachada por tipología en las caras a la calle y en la cara sur, visible desde el
// estacionamiento; color de muro y altura (4.0 m).
// En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y no se
// usan como sombra; las alturas son tipológicas (4.0 m, sin «cuerpo bajo» en el inventario).
export const C19_110={block:'C19',evidence:'C19/20261110-modelado',buildings:[{
 id:'D2-14',height:4.0,color:'#cfc3aa',roofColor:'#7e8074',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C19.jpg','calco/referencia.webp','evidence/D2-14/20261006-01-cierre.json','evidence/C19/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta ajustada; las de calle salen de
 // scripts/frentes-calle-lib.mjs (banqueta de C19) y se comprueban en pruebas-fabrica.
 facades:[{edge:3,tipo:'casa',sinPuerta:true},{edge:4,tipo:'casa',puertas:['centro']},{edge:0,tipo:'casa',puertas:['centro']}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H110-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cuerpo de un nivel sobre Juan Álvarez con lámina gris azulada y un recinto oscuro al frente; terreno abierto al sur hacia el estacionamiento.',
  estimated:'Altura 4.0 m por tipología, vanos por tipología casa de un nivel en Juan Álvarez y en la cara sur visible desde el estacionamiento, color de muro.',
  unchanged:'Planta ajustada de inventario (±3 m) y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'110/D2-14: frente meridional de Juan Álvarez; aérea + fachada tipológica (sin foto de calle).'}]};  // techo medido #7e8074

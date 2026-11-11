// 93 / D2-19 / C14 · cuadra 27 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C14.jpg). No hay foto de calle de C14 en el repositorio.
//
// Visto en la aérea: esquina Felipe Salido–Juan Álvarez, azotea gris azulada (mediana #bdc1b5) con pretil; frente largo a Juan Álvarez.
// Estimado: fachada por tipología «casa de un nivel» (fábrica de fachadas) sobre las
// aristas que dan a la calle; color de muro estimado; medidas visuales, no métricas.
// Altura: sombra proyectada sobre Felipe Salido, calibrada con la del 89 (6.2 m) en la
// misma imagen (sombra de 3.75 m en x=-7); incertidumbre ±0.8 m.
export const C14_93={block:'C14',evidence:'C14/20261110-modelado',buildings:[{
 id:'D2-19',height:3.8,color:'#c9c2b0',roofColor:'#b9beb2',uncertainty:.8,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C14.jpg','calco/referencia.webp','evidence/D2-19/20261006-01-cierre.json','evidence/C14/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta ajustada; las de calle salen de
 // scripts/frentes-calle-lib.mjs (banqueta de C14) y se comprueban en pruebas-fabrica.
 facades:[{edge:0,tipo:'casa',sinPuerta:true},{edge:1,tipo:'casa',puertas:[2]}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H93-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Esquina Felipe Salido–Juan Álvarez: azotea gris azulada con pretil y frente largo sobre Juan Álvarez; sombra de ~3.8 m.',
  estimated:'Altura 3.8 m (sombra calibrada con el 89), vanos por tipología casa de un nivel en ambos frentes (puerta sobre Juan Álvarez), color de muro y remates.',
  unchanged:'Planta ajustada de inventario (±3 m) y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'93/D2-19: esquina Felipe Salido–Juan Álvarez; aérea + fachada tipológica (sin foto de calle).'}]};

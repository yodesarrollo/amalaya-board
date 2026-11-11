// 92 / D2-18 / C14 · cuadra 27 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C14.jpg). No hay foto de calle de C14 en el repositorio.
//
// Visto en la aérea: frente sobre Felipe Salido con azotea clara (mediana #dbd7c6) y un cuerpo blanco más brillante al fondo.
// Estimado: fachada por tipología «casa de un nivel» (fábrica de fachadas) sobre las
// aristas que dan a la calle; color de muro estimado; medidas visuales, no métricas.
// Altura: tipológica, 4.0 m = mediana de los frentes de un nivel del centro estimados con
// Street View (HEIGHT_REVIEWS, 3.3–5.3 m); ±0.7 m. Corrección del 10-nov: la banda oscura
// sobre Felipe Salido es asfalto, no sombra (en esta aérea el sol viene del este y las
// sombras caen al poniente); no se usa como medida de altura.
export const C14_92={block:'C14',evidence:'C14/20261110-modelado',buildings:[{
 id:'D2-18',height:4.0,color:'#d9cdb2',roofColor:'#d6d1c0',uncertainty:.7,parapet:true,parapetColor:'#ddd5c2',
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['ajuste-visual/C14.jpg','calco/referencia.webp','evidence/D2-18/20261006-01-cierre.json','evidence/C14/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta ajustada; las de calle salen de
 // scripts/frentes-calle-lib.mjs (banqueta de C14) y se comprueban en pruebas-fabrica.
 facades:[{edge:0,tipo:'casa',puertas:['inicio']}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H92-01',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Frente de un nivel sobre Felipe Salido, azotea clara con cuerpo blanco al fondo.',
  estimated:'Altura 4.0 m por tipología (mediana de frentes de un nivel con Street View en el centro), dos vanos por tipología casa de un nivel, color de muro y remates.',
  unchanged:'Planta ajustada de inventario (±3 m) y registro individual.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'92/D2-18: frente oriental intermedio de Felipe Salido; aérea + fachada tipológica (sin foto de calle).'}]};

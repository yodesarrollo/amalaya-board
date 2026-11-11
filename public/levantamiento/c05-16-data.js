// 16 / C1-03 / C05 · cuadra 5 · PATIO TRASERO DEL JARDÍN CERVECERO, CUBIERTA LIGERA ABIERTA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa y se declara estimado.
//
// Fotos de calle (Google Street View, capturas guardadas como evidence/C05/20261110-modelado/foto-<id>.jpg):
//   N1-oKG8-184: 2023-12, panorama oKG8On2xhMVJgSINqq7SfQ, cámara local (-189.2,32.6), rumbo 184: C1-01 norte (Pachos Burros) y patio con mesas y malla.
//   N2-oKG8-150: 2023-12, panorama oKG8On2xhMVJgSINqq7SfQ, cámara local (-189.2,32.6), rumbo 150: patio con mesas, malla y portón; C1-02 poniente oscuro de dos niveles con anuncio en azotea.
// Aérea Esri z19 (calco/referencia.webp) para cubiertas; posiciones de vanos: proyección de la
// foto sobre la planta (±0.5–1 m); alturas por proporción en la foto (±0.5 m).
// La unión de la ronda 2 (JOIN_REVIEWS) dejó al fondo del lote un cuerpo cerrado de 6.2 m. Desde
// Obregón (N1, N2) no asoma nada de esa altura detrás del patio de mesas (a lo sumo ~3 m) y la aérea
// muestra mesas también en esa zona, así que no hay techo opaco: se modela una cubierta ligera
// abierta sobre postes (estimada, 2.8 m) sobre el contorno de la unión, con el frente norte 0.3 m
// al norte para que el ancla de la etiqueta quede dentro. Orden [sur-poniente, sur-oriente,
// norte-oriente, norte-poniente] con área negativa (no se invierte): postes intermedios en los lados
// largos. pruebas-paramento.mjs 39 (patio del frente libre) se conserva.
export const C05_16={
 id:'C1-03',height:2.8,color:'#b5a58b',roofColor:'#8b7f6c',uncertainty:1.5,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,
 points:[[-183.043,79.76],[-172.354,76.639],[-173.9,63],[-181.9,64.3]],
 sources:['evidence/C05/20261110-modelado/foto-N1-oKG8-184.jpg','evidence/C05/20261110-modelado/foto-N2-oKG8-150.jpg','calco/referencia.webp','ajuste-visual/C05.jpg','evidence/C05/20261110-modelado/ficha.json'],
 facades:[],
 sections:[{part:'cubierta-ligera',points:[[-183.043,79.76],[-172.354,76.639],[-173.9,63],[-181.9,64.3]],height:2.8,color:'#b5a58b',roofColor:'#8b7f6c',openCanopy:true,facades:[]}],
 fabrica:{fecha:'2026-11-10',tipologia:'cubierta ligera abierta (estimada)',fotoCalle:true},
 hypothesis:{id:'H16-01',status:'modelado con foto parcial y forma estimada',measured:false,photoreal:false,generic:false,
  observed:'Desde Obregón (dic-2023) el lote es un patio con mesas de madera, malla y portón; detrás del patio no asoma ningún volumen de 6 m (a lo sumo un muro o estructura de ~3 m). En la aérea las mismas manchas de mesas siguen en la zona trasera: no hay techo opaco.',
  estimated:'Cubierta ligera abierta sobre postes, altura 2.8 m y material (la aérea no deja ver si es pérgola o malla sombra); posición de postes.',
  unchanged:'Contorno del cuerpo trasero de la unión de la ronda 2 (±3 m), frente norte 0.3 m al norte; el patio del frente sigue abierto (pruebas-paramento 39).',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'16/C1-03: cubierta ligera abierta sobre las mesas del patio trasero (antes cuerpo cerrado de 6.2 m). Altura y material estimados.'
};

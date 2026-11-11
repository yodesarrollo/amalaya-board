// 3 / C2-03 / C08 · cuadra 1 · MODELADO CON FOTO Y FORMAS ESTIMADAS (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado; donde no hay
// foto se completa y se declara estimado.
//
// Cuerpo interior de servicio detrás del estacionamiento; ninguna cara da a la calle.
// Fotos: Street View dic-2023 desde Yáñez (c08-porton-foto.jpg, rumbo 85) y desde la
// esquina Obregón–Yáñez (c08-acceso-foto.jpg). Ambas muestran, frente a la cara poniente,
// un cobertizo de lámina oscura sobre postes con bases pintadas; el muro claro asoma por
// encima. Aérea Esri z19 (calco/referencia.webp) para el color de la cubierta.
const muro='#d4d5cb';
// Planta registrada (corrección del punto 1, ±3 m), sin cambios.
const planta=[[-59.955057,44.110146],[-46.137389,42.549617],[-45.876679,38.388208],[-34.405407,37.087768],[-33.623275,47.751381],[-35.969671,48.271557],[-35.44825,53.9935],[-58.912214,56.074207]];
// Cobertizo poniente: 3 m de fondo (estimado), 6 cm separado del muro y 0.4 m más corto
// en cada extremo que la arista 7. Orden [muro sur, frente sur, frente norte, muro norte]
// (área negativa: no se invierte al construir) para que los postes intermedios de la
// cubierta abierta queden a media longitud del frente y del muro.
const cobertizo=[[-59.98,44.514],[-62.969,44.774],[-61.995,55.941],[-59.007,55.681]];
export const C08_3={
 id:'C2-03',height:4.2,color:muro,roofColor:'#dcddd3',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,
 sources:['evidence/c08-cierre-20261008/c08-porton-foto.jpg','evidence/c08-cierre-20261008/c08-acceso-foto.jpg','calco/referencia.webp','ajuste-visual/C08.jpg','evidence/C08/20261110-modelado/ficha.json'],
 facades:[],
 sections:[
  {part:'cuerpo',points:planta,height:4.2,color:muro,roofColor:'#dcddd3',facades:[]},
  {part:'cobertizo-poniente',points:cobertizo,height:3.2,color:'#9d9b92',roofColor:'#4b5053',openCanopy:true,facades:[]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H3-01',status:'modelado con foto y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Desde Yáñez y desde la esquina Obregón–Yáñez (Street View dic-2023): cuerpo claro de un nivel detrás del estacionamiento con un cobertizo de lámina oscura sobre postes a lo largo de su cara poniente. Cubierta clara en la aérea.',
  estimated:'Fondo (3 m), altura (3.2 m) y separación de postes del cobertizo; muros sin vanos porque la foto sólo los ve de lejos y en sombra.',
  unchanged:'Planta registrada en el punto 1 (±3 m), altura 4.2 m estimada en la foto (8-oct) y estacionamiento abierto.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'3/C2-03: cuerpo interior claro de un nivel con cobertizo de lámina oscura sobre postes en su cara poniente (Street View dic-2023 desde Yáñez y Obregón–Yáñez). Sin vanos supuestos; medidas visuales, no métricas.'
};

// 114 / D2-23 / C15 · cuadra 30 · MODELADO CON AÉREA: CUERPO CON PATIO (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C15.jpg). No hay foto de calle de C15 en el repositorio.
//
// La planta de inventario de D2-23 (±3 m) cubría toda la esquina Felipe Salido–Garmendia.
// La aérea muestra ahí un patio delantero abierto (con dos hileras oscuras) y, al sur,
// un cuerpo blanco que cierra un patio oscuro de unos 7 × 3 m: ala norte techada (banda
// blanca, mediana #edead7, con su borde norte bajo la copa de un árbol), muro blanco sobre
// Garmendia y remate al sur. Se modela como una sección con el patio abierto (hueco sin
// colisión, piso del color medido) trazada a ±1 m sobre la aérea; el borde norte oculto
// por el árbol se estima 1.2 m al norte de la banda visible, donde queda también el ancla
// del registro. El patio delantero queda abierto y la planta de inventario se conserva.
// Altura: tipológica, 4.0 m (mediana de frentes de un nivel del centro con Street View;
// ±0.7 m); la aérea no da una medida de altura. Fachadas: barda con un acceso sobre
// Garmendia y casa de un nivel en la cara norte, visible desde Felipe Salido a través
// del patio delantero. Color de muro estimado.
const muro='#ddd6c4',blanco='#e6e2d6';
const patio=[[36.5,186.6],[43.4,186.6],[43.4,189.6],[36.5,189.6]];
export const C15_114={block:'C15',evidence:'C15/20261110-modelado',buildings:[{
 id:'D2-23',height:4.0,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C15.jpg','calco/referencia.webp','evidence/D2-23/20261006-01-cierre.json','evidence/C15/20261110-modelado/ficha.json'],
 // Aristas en el orden de la sección tal como está escrita (normalizeSections); la de
 // Garmendia sale de frentes-calle-lib.mjs contra la banqueta de C15.
 sections:[{part:'114-patio',points:[[36.2,183.4],[45.28,183.4],[44.25,190.6],[36.2,190.6]],holes:[patio],
  height:4.0,color:muro,roofColor:blanco,parapet:true,parapetColor:'#ddd5c2',
  facades:[{edge:0,tipo:'casa',puertas:['centro']},{edge:1,tipo:'muro'}],roofDetails:[]}],
 // Piso del patio visto en la aérea (vegetación o sombra; mediana #4f533e).
 yardSurface:{points:patio,color:'#4f533e'},
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:1},
 hypothesis:{id:'H114-01',status:'modelado con aérea, patio abierto y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Esquina Felipe Salido–Garmendia: patio delantero abierto con dos hileras oscuras; al sur, cuerpo blanco que cierra un patio oscuro (vegetación o sombra): ala norte techada con un árbol sobre su borde norte, muro blanco sobre Garmendia y remate sur; colores medidos en la aérea.',
  estimated:'Altura de 4.0 m por tipología, contorno y patio a ±1 m, borde norte del ala bajo la copa del árbol (1.2 m al norte de la banda visible), uso del ala norte como cuerpo habitable, barda con un acceso sobre Garmendia, vanos por tipología casa de un nivel en la cara norte y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D2-23; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'114/D2-23: cuerpo con patio sobre Garmendia y patio delantero abierto; aérea + fachada tipológica (sin foto de calle).'}]};

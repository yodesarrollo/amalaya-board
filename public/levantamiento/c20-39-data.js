// 39 / C2-08 / C20 · cuadra 9 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado; el genérico queda
// para lo que no tiene ninguna. No hay panorama sobre Sufragio Efectivo: sólo aérea Esri z19
// (calco/referencia.webp) y ajuste-visual/C20.jpg.
//
// Visto en la aérea: la fronda del patio de 38 cubre casi toda la planta (mediana verde
// #627556); sólo asoma azotea clara al sur. La cara sur queda a 3.1 m de la banqueta de
// Sufragio Efectivo, dentro de los 4 m del método: lleva fachada de fábrica.
export const C20_39={block:'C20',evidence:'C20/20261110-modelado',buildings:[{
 id:'C2-08',height:4.0,color:'#d8d4c7',roofColor:'#d9d5c8',uncertainty:1.5,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['calco/referencia.webp','ajuste-visual/C20.jpg','cuadras/C20-inventario.jpg','evidence/C20/20261110-modelado/ficha.json'],
 // Arista 2 = cara sur hacia Sufragio Efectivo (10.75 m, a 3.1 m de la banqueta).
 facades:[{edge:2,tipo:'casa',puertas:['centro']}],
 roofDetails:[],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H20-39',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Aérea: planta casi cubierta por la fronda del patio vecino; azotea clara visible sólo al sur; cara sur a 3.1 m de la banqueta de Sufragio Efectivo.',
  estimated:'Altura tipológica de 4.0 m; vanos de la fábrica (casa: puerta central y ventanas con reja); color de cubierta típico porque la fronda la tapa; sin equipos de azotea porque no se distinguen bajo los árboles.',
  unchanged:'Planta registrada (forma nativa de la lámina, ±3 m); caras interiores sin vanos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'39/C2-08: cuerpo de un nivel al fondo del patio, con la cara sur hacia Sufragio Efectivo; fachada tipológica y cubierta típica (la fronda la tapa en la aérea).'
}]};

// 36 / C2-05 / C20 · cuadra 9 · MODELADO CON AÉREA Y FACHADA TIPOLÓGICA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado; el genérico queda
// para lo que no tiene ninguna. Ningún panorama del recorrido alcanza este tramo de Juan
// Álvarez (R-001 va por Obregón y la esquina con 35 tapa la vista): sólo aérea Esri z19
// (calco/referencia.webp) y ajuste-visual/C20.jpg.
//
// Visto en la aérea: azotea blanca (mediana #fbf8f0) con dos manchas oscuras de tinaco. La
// franja oscura al poniente de la planta es calle y sombra (sol del este), no techo.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
export const C20_36={block:'C20',evidence:'C20/20261110-modelado',buildings:[{
 id:'C2-05',height:4.0,color:'#d8d4c7',roofColor:'#ece9df',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['calco/referencia.webp','ajuste-visual/C20.jpg','cuadras/C20-inventario.jpg','evidence/C20/20261110-modelado/ficha.json'],
 // Arista 3 = Juan Álvarez (10.41 m, a 0.12 m de la banqueta). Las caras norte y sur quedan a
 // más de 4 m de la banqueta (4.8 y 4.2 m): sin fachada de fábrica.
 facades:[{edge:3,tipo:'casa',puertas:['centro']}],
 roofDetails:[tinaco(1.8,51.3),tinaco(1.3,57.1)],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{id:'H20-36',status:'modelado con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Aérea: azotea blanca con dos tinacos; frente a Juan Álvarez sobre la banqueta.',
  estimated:'Altura tipológica de 4.0 m (sin foto de calle; el inventario no lo marca como cuerpo bajo); vanos de la fábrica (casa: puerta central y ventanas con reja); color de muro típico; tinacos con medida típica.',
  unchanged:'Planta registrada (forma nativa de la lámina, ±3 m); caras interiores sin vanos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'36/C2-05: casa de un nivel sobre Juan Álvarez con azotea blanca y dos tinacos (aérea); fachada tipológica, sin foto de calle.'
}]};

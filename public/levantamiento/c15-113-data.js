// 113 / D2-22 / C15 · cuadra 30 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C15.jpg). No hay foto de calle de C15 en el repositorio.
//
// La planta de inventario de D2-22 (±3 m) cubría la franja ajardinada del poniente y
// dejaba fuera el extremo oriental de la azotea. La aérea muestra, al centro del frente
// de Felipe Salido, dos cuerpos de azotea blanca separados por un pretil oblicuo: uno
// sobre la calle y otro detrás. Cada cuerpo es una sección (como 94/D2-20) trazada a
// ±1 m sobre la aérea; la franja ajardinada queda abierta y la planta de inventario se
// conserva como registro.
// Alturas: tipológicas, 4.0 m (mediana de frentes de un nivel del centro con Street View;
// ±0.7 m). En esta aérea el sol viene del este: la banda oscura al norte es asfalto y
// arbolado, no sombra de altura. Fachada: tipología «casa de un nivel» sobre Felipe
// Salido; las caras interiores quedan lisas. Color de muro estimado.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d4cab3',blanco='#e6e2d6';
const seccion=(part,points,roofColor,facades=[],roofDetails=[])=>({part,points,height:4.0,color:muro,roofColor,parapet:true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C15_113={block:'C15',evidence:'C15/20261110-modelado',buildings:[{
 id:'D2-22',height:4.0,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C15.jpg','calco/referencia.webp','evidence/D2-22/20261006-01-cierre.json','evidence/C15/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  // Cuerpo sobre Felipe Salido (mediana #f8f6eb) con tres tinacos vistos.
  seccion('113-norte',[[23.8,177.1],[36.1,177.1],[36.1,183.7],[25.5,182.4],[23.8,182.4]],blanco,
   [{edge:0,tipo:'casa',puertas:['centro']}],
   [tinaco(25.5,180.0),tinaco(34.8,179.5),tinaco(34.5,182.4)]),
  // Cuerpo posterior (mediana #f5f1e7), del pretil oblicuo al patio del sur.
  seccion('113-sur',[[25.6,182.41],[35.8,183.66],[35.8,188.8],[25.6,188.8]],blanco)
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:2},
 hypothesis:{id:'H113-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Centro del frente sur de Felipe Salido: dos cuerpos de azotea blanca separados por un pretil oblicuo, el norte sobre la calle con tres tinacos y el sur detrás; franja ajardinada al poniente; colores de techo medidos en la aérea.',
  estimated:'Alturas de 4.0 m por tipología, contornos a ±1 m, vanos por tipología casa de un nivel sobre Felipe Salido y color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D2-22; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'113/D2-22: dos cuerpos sobre Felipe Salido; aérea + fachada tipológica (sin foto de calle).'}]};

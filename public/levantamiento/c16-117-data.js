// 117 / D3-17 / C16 · cuadra 31 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C16.jpg). No hay foto de calle de C16 en el repositorio.
//
// La planta de inventario de D3-17 (±3 m, un contorno de diez vértices) cubría árboles al
// poniente (mediana #606850) y una copa oscura al sureste (#242f26). La aérea muestra tres
// cuerpos: azotea blanca con tres tinacos en la esquina Felipe Salido–Enrique Quijada, un
// cuerpo beige con dos tinacos al sur y una losa gris al suroeste. Cada cuerpo es una sección
// propia (etapa 07, sólidos y vacíos); árboles y patios quedan abiertos. La planta de
// inventario se conserva como registro. Trazo a ±1 m sobre la aérea (cuadrícula de 1 m).
// Alturas: tipológicas, 4.0 m en todas las secciones (el inventario no registra cuerpo bajo;
// ±0.7 m). En esta aérea el sol viene del este: las bandas oscuras no se usan como sombra.
// Fachadas: tipología «casa de un nivel» en las caras a Enrique Quijada y en la cara norte, a
// menos de 4 m de la banqueta de Felipe Salido. Color de muro estimado (sin foto).
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d6cbb2';
const seccion=(part,points,height,roofColor,facades=[],roofDetails=[])=>({part,points,height,color:muro,roofColor,parapet:true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C16_117={block:'C16',evidence:'C16/20261110-modelado',buildings:[{
 id:'D3-17',height:4.0,color:muro,roofColor:'#e6e2d6',uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C16.jpg','calco/referencia.webp','evidence/D3-17/20261006-01-cierre.json','evidence/C16/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  // Azotea blanca (mediana #eceade) en L: cuerpo de esquina y franja hacia el poniente.
  seccion('117-azotea-norte',[[84.15,176.9],[88.95,176.9],[90.1,183.7],[81.2,183.7],[81.2,181.5],[84.15,181.5]],4.0,'#e6e2d6',
   [{edge:0,tipo:'casa',puertas:['centro']},{edge:1,tipo:'casa',sinPuerta:true}],
   [tinaco(85.8,178.2),tinaco(85.4,181.2),tinaco(88.95,181.0)]),
  // Cuerpo beige (mediana #ccc6b2) con dos tinacos; frente a Enrique Quijada.
  seccion('117-cuerpo-medio',[[80.0,183.7],[88.8,183.7],[88.2,188.3],[86.7,191.3],[83.4,191.5],[82.3,188.8],[80.0,187.2]],4.0,'#ccc6b2',
   [{edge:1,tipo:'casa',puertas:['centro']},{edge:2,tipo:'casa',sinPuerta:true}],
   [tinaco(87.2,184.5),tinaco(85.6,185.9)]),
  // Losa gris (mediana #c1c9bf) al suroeste, entre la copa de los árboles y la del sureste.
  seccion('117-losa-gris',[[75.3,192.3],[82.3,192.3],[81.1,195.6],[80.7,197.5],[75.3,197.5]],4.0,'#c1c9bf')
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:3},
 hypothesis:{id:'H117-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Tres cuerpos: azotea blanca en L en la esquina Felipe Salido–Enrique Quijada con tres tinacos, cuerpo beige al sur con dos tinacos y losa gris al suroeste; árboles al poniente y copa oscura al sureste que la planta de inventario cubría; colores de techo medidos en la aérea.',
  estimated:'Alturas de 4.0 m por tipología en las tres secciones, contornos a ±1 m, vanos por tipología casa de un nivel en Enrique Quijada y en la cara norte, color de muro; la losa gris se lee como cubierta, como en el inventario.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D3-17; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'117/D3-17: tres cuerpos de un nivel entre árboles; aérea + fachada tipológica (sin foto de calle).'}]};

// 11 / B1-02 / C02 · cuadra 4 · MODELADO POR SECCIÓN CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C02.jpg). No hay foto de calle de B1-02 en el repositorio.
//
// La planta de inventario (±3 m) cubría al sur árboles (mediana #24382b). La aérea muestra
// al norte una cubierta de lámina en diente de sierra (mediana #cdc9b6) y, pegado a ella, un
// cuerpo gris: quedan como sección propia y el resto de la mitad sur de la planta, abierto. La planta de
// inventario se conserva como registro. Trazo a ±1 m sobre la aérea.
// Altura: tipológica, 4.0 m (antes 5.0 m estimada sin foto). Fachada: barda con un acceso en
// la cara a Rosales, a 3.4 m de la banqueta; color de muro estimado.
const seccion=(part,points,height,roofColor,facades=[],roofDetails=[])=>({part,points,height,color:'#aaa9a2',roofColor,parapet:true,parapetColor:'#c8c9be',facades,roofDetails});
export const C02_11={block:'C02',evidence:'C02/20261110-modelado',buildings:[{
 id:'B1-02',height:4.0,color:'#aaa9a2',roofColor:'#cdc9b6',uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C02.jpg','calco/referencia.webp','cuadras/C02-inventario.jpg','evidence/B1-02/20261006-01-cierre.json','evidence/C02/20261110-modelado/ficha.json'],
 // Aristas en el orden de la sección tal como está escrita (normalizeSections).
 sections:[
  // Líneas de la lámina vistas en la aérea (como en el paquete de octubre, recentradas).
  seccion('11-lamina',[[-206.25,-16.91],[-187.47,-17.95],[-182.0,-12.23],[-182.7,-10.7],[-189.6,-10.3],[-190.0,-8.0],[-196.2,-8.0],[-196.4,-10.1],[-204.6,-10.0]],4.0,'#cdc9b6',
   [{edge:8,tipo:'muro'}],
   [-201,-199,-197,-195,-193,-191,-189].map(x=>({x,z:-13.8,w:.18,d:5.8,h:.1,color:'#9d9e95'})))
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'muro',fotoCalle:false,secciones:1},
 hypothesis:{id:'H11-01',status:'modelado por sección con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Cubierta de lámina en diente de sierra sobre Rosales con sus líneas visibles y un cuerpo gris pegado al sur; árboles en la mitad sur de la planta de inventario; colores medidos en la aérea.',
  estimated:'Altura 4.0 m por tipología, contorno de la lámina a ±1 m, barda con un acceso en la cara a Rosales, color de muro.',
  unchanged:'Planta de inventario conservada como registro; registro individual; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'11/B1-02: lámina en diente de sierra; mitad sur abierta (árboles); aérea + fachada tipológica (sin foto de calle).'}]};

// 94 / D2-20 / C14 · cuadra 27 · MODELADO POR SECCIONES CON AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela una versión aceptable a la
// realidad según lo que la foto muestra; el genérico queda para lo que no tiene ninguna.
// Foto disponible: sólo aérea (Esri World Imagery z19, calco/referencia.webp, y
// ajuste-visual/C14.jpg). No hay foto de calle de C14 en el repositorio.
//
// La planta de inventario de D2-20 (±3 m, un solo contorno con dos huecos) cubría el
// jardín arbolado central. La aérea muestra un conjunto de cuerpos de un nivel en torno
// a ese jardín: cada cuerpo es aquí una sección propia (etapa 07, sólidos y vacíos) y el
// jardín y los patios quedan abiertos. La planta de inventario se conserva como registro.
// Trazo a ±1 m sobre la aérea (cuadrícula de 1 m); techos con color mediano observado.
// Alturas: tipológicas, 4.0 m en todas las secciones (mediana de frentes de un nivel del
// centro con Street View, 3.3–5.3 m; ±0.7 m). Corrección del 10-nov: en esta aérea el sol
// viene del este; las bandas oscuras al norte de los cuerpos no son sombras de altura.
// Fachadas: tipología «casa de un nivel» en las caras visibles desde Mina, Bavispe y
// Juan Álvarez; las caras al jardín quedan lisas. Color de muro estimado (sin foto).
import {tinaco,ventila,calentador} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d6ccb4',blanco='#e6e2d6';
const seccion=(part,points,height,roofColor,facades=[],roofDetails=[])=>({part,points,height,color:muro,roofColor,parapet:true,parapetColor:'#ddd5c2',facades,roofDetails});
export const C14_94={block:'C14',evidence:'C14/20261110-modelado',buildings:[{
 id:'D2-20',height:4.0,color:muro,roofColor:blanco,uncertainty:.7,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['ajuste-visual/C14.jpg','calco/referencia.webp','evidence/D2-20/20261006-01-cierre.json','evidence/C14/20261110-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections).
 sections:[
  seccion('94-techo-rojo',[[-56.3,191.8],[-49.5,191.8],[-49.5,196.6],[-56.3,196.6]],4.0,'#b98a76',
   [{edge:3,tipo:'casa',sinPuerta:true}]),
  seccion('94-noroeste',[[-49.5,192.5],[-33.5,192.5],[-33.5,197.8],[-47.5,197.8],[-47.5,213.2],[-53.5,213.2],[-53.5,211],[-55.5,211],[-55.5,206],[-53.5,206],[-53.5,197.8],[-49.5,197.8]],4.0,blanco,
   [{edge:7,tipo:'casa',puertas:['centro']},{edge:9,tipo:'casa',sinPuerta:true}],
   [tinaco(-51.3,204.5),tinaco(-48.7,206.8),tinaco(-51.5,207.1)]),
  seccion('94-suroeste',[[-55,214.5],[-49.5,214.5],[-49.5,225.5],[-55,225.5]],4.0,'#d9d5c8',
   [{edge:2,tipo:'casa',sinPuerta:true},{edge:3,tipo:'casa',puertas:['centro']}]),
  seccion('94-nave-norte',[[-48.6,215.8],[-29,219.5],[-29,222.8],[-48.6,219.3]],4.0,blanco),
  seccion('94-nave-sur',[[-48.6,219.3],[-29,222.8],[-29,230.4],[-48.6,225.55]],4.0,blanco,
   [{edge:2,tipo:'casa',puertas:[1,4]}],
   [tinaco(-38.6,226.7)]),
  seccion('94-gris',[[-35.7,214.3],[-30.4,214.3],[-30.4,219.2],[-35.7,218.2]],4.0,'#bdbfaf'),
  seccion('94-sureste',[[-23.6,213.0],[-17.6,216.5],[-12.8,219.6],[-14.7,223.3],[-16.0,229.0],[-14.0,234.9],[-29.0,231.1],[-29.0,223.6],[-27.6,223.3],[-25.2,220.7]],4.0,blanco,
   [{edge:5,tipo:'casa',puertas:[2]}],
   [ventila(-24.1,224.2),ventila(-22.4,224.2),ventila(-20.9,224.2),ventila(-19.4,224.2),tinaco(-27.6,228.7),tinaco(-20.0,231.8)]),
  seccion('94-esquina-sureste',[[-13.2,229.3],[-5.0,229.3],[-5.0,236.3],[-13.2,235.4]],4.0,'#ddd8c6',
   [{edge:1,tipo:'casa',sinPuerta:true},{edge:2,tipo:'casa',puertas:['centro']}]),
  seccion('94-este',[[-15,217.0],[-2.3,218.4],[-2.3,223.3],[-12.6,219.7]],4.0,blanco,
   [{edge:1,tipo:'casa',sinPuerta:true}]),
  seccion('94-barra-este',[[-22.1,202.0],[-9.0,202.0],[-9.0,199.3],[-2.3,199.3],[-2.3,208.5],[-15.8,208.4],[-18.4,206.4]],4.0,blanco,
   [{edge:3,tipo:'casa',puertas:['centro']}],
   [tinaco(-11.2,203.9),tinaco(-14.5,205.1),tinaco(-8.1,206.0),tinaco(-3.8,203.1),calentador(-5.5,201.3)])
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false,secciones:10},
 hypothesis:{id:'H94-01',status:'modelado por secciones con aérea y fachada tipológica',measured:false,photoreal:false,generic:false,
  observed:'Conjunto de diez cuerpos de un nivel en torno a un jardín arbolado: techo rojo en Mina, ala noroeste en L, naves paralelas a Bavispe, cuerpo gris, bloque sureste, esquina sureste y dos cuerpos hacia Juan Álvarez; tinacos, ventilas y un calentador solar visibles; colores de techo medidos en la aérea.',
  estimated:'Alturas de 4.0 m por tipología en todas las secciones, contornos a ±1 m, vanos por tipología casa de un nivel, color de muro y remates.',
  unchanged:'Planta de inventario conservada como registro; registro individual de D2-20; vecinos sin cambio.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'94/D2-20: conjunto de diez cuerpos alrededor del jardín; aérea + fachada tipológica (sin foto de calle).'}]};

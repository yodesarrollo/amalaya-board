// 1 / C2-01 / C08 · cuadra 1 · MODELADO CON FOTO DE CALLE Y FORMAS ESTIMADAS (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Fotos: Street View dic-2023 desde la esquina Obregón–Juan Álvarez (c08-ne-foto.jpg,
// cámara 29.0759358,-110.9548665, rumbo 225) y panorama R-001 P04 de Obregón. Se ven las
// dos caras a la calle: muro claro, pilastras y cornisa rojizas, zoclo rojizo y vanos
// altos con marco rojizo y reja. Aérea Esri z19 (calco/referencia.webp) para cubierta y
// equipos. Posiciones de vanos: proyección de la foto sobre la planta registrada, ±0.5 m.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#dad7ce',rojizo='#8c5b4f',vidrio='#2a2d31';
const bandas=[{y:.47,h:.84,d:.06,color:rojizo},{y:4.43,h:.3,d:.26,color:rojizo}];
const pilastra=(x,w=.8)=>({x,b:0,h:4.42,w,d:.14,color:rojizo});
const vano=(x,w,h,b,extra={})=>({x,w,h,b,rect:true,frameColor:rojizo,frameWidth:.2,fillColor:vidrio,...extra});
export const C08_1={
 id:'C2-01',height:4.6,color:muro,roofColor:'#ebe7de',uncertainty:.8,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c08-cierre-20261008/c08-ne-foto.jpg','recorrido/h45BeWMtTog-TgjPTSYn6g.jpg','calco/referencia.webp','ajuste-visual/C08.jpg','evidence/C08/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta registrada: 0 = Obregón (15.70 m, de
 // poniente a la esquina), 1 = Juan Álvarez (11.73 m, de la esquina al sur). Las fins
 // se dan en ese mismo orden (reverseFins) porque la planta se invierte al construir.
 facades:[
  // Obregón: tres vanos altos con reja (foto NE y P04), pilastra en el encuentro con
  // OB-02 y pilastra de esquina.
  {edge:0,plain:true,reverseFins:true,bands:bandas,fins:[pilastra(.4),pilastra(15.28,.84)],
   bays:[4.1,8.3,12.5].map(x=>vano(x,1.25,2.6,.12))},
  // Juan Álvarez: puerta con reja al pie de la rampa, segunda puerta con reja y ventana
  // sobre el zoclo (foto NE).
  {edge:1,plain:true,reverseFins:true,bands:bandas,fins:[pilastra(.42,.84)],
   bays:[vano(2.4,1.4,2.55,.28,{door:true}),vano(7.1,1.3,2.6,.1,{door:true}),vano(10.2,1.15,1.55,1.05)]}
 ],
 // Equipos de azotea: manchas oscuras vistas en la aérea (posición observada, medidas típicas).
 roofDetails:[tinaco(-34.37,31.54),ventila(-27.71,28.74),ventila(-24.76,28.76),ventila(-26.19,30.46,.6,.9),ventila(-33.06,34.27)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H1-01',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Esquina Obregón–Juan Álvarez (Street View dic-2023 y P04): un nivel, muro claro, pilastras rojizas en la esquina y en el encuentro con OB-02, cornisa y zoclo rojizos; tres vanos altos con marco rojizo y reja en Obregón; en Juan Álvarez puerta con reja junto a la rampa, segunda puerta con reja y ventana sobre el zoclo. Cubierta clara con un tinaco y cuatro equipos menores en la aérea.',
  estimated:'Posición y medida de vanos (±0.5 m, proyección de la foto sobre la planta), espesor de pilastras y bandas, color exacto; equipos de azotea con medidas típicas.',
  unchanged:'Planta registrada (±3 m), altura 4.6 m de HEIGHT_REVIEWS (Obregón P04), rampa y barandal azul del punto 2, caras interiores sin vanos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'1/C2-01: esquina de un nivel con muro claro, pilastras, cornisa y zoclo rojizos; tres vanos altos con reja en Obregón y dos puertas y una ventana con reja en Juan Álvarez (Street View dic-2023, P04). Medidas visuales, no métricas; caras interiores sin vanos supuestos.'
};

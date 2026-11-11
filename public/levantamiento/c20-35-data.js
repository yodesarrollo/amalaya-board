// 35 / C2-04 / C20 · cuadra 9 · MODELADO CON FOTO DE CALLE Y FORMAS ESTIMADAS (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Fotos: panoramas del recorrido R-001 sobre Obregón, P05 (133OIriRrcYkbV0Y2VCPng, a 6 m del
// frente) y P04/P06 de contraste. Se ve la cara a Obregón completa: edificio clásico de un
// nivel alto, muro gris claro con pilastras, entablamento y cornisa blancos, pretil; dos
// ventanas altas con reja, marco blanco y frontón, y un portón de arco con hojas verdes y
// abanico de vidrio junto al encuentro con 37 (C2-06). En P05 la nivelación de roll.json
// inclina 13.6° la vista al sur: las verticales salen rectas SIN esa corrección y así se
// midió. Altura por razón de ángulos (pretil 2.9 veces la altura de cámara; cámara 2.8 m,
// calibrada con un peatón de 1.7 m y la distancia al frente): pretil ±0.8 m.
// La cara a Juan Álvarez no se ve en ningún panorama: se estima con el mismo orden.
// Aérea Esri z19 (calco/referencia.webp) para cubierta y equipos.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const muro='#d3d0c2',blanco='#ebe8df',zoclo='#bdb8a8',verde='#4f6656',vidrio='#2f3436',hierro='#1d2124';
// Entablamento y pretil observados (alturas sobre la banqueta, P05 sin roll).
const bandas=[{y:.32,h:.64,d:.05,color:zoclo},{y:5.45,h:.2,d:.12,color:blanco},{y:6.5,h:.24,d:.3,color:blanco},
 {y:6.82,h:.2,d:.42,color:blanco},{y:7.7,h:.16,d:.24,color:blanco}];
const pilastra=(x,w=.7)=>({x,b:0,h:5.55,w,d:.16,color:blanco});
// Frontón escalonado sobre el marco (el constructor no corta triángulos en la fachada).
const fronton=(x,w=2.7)=>[{x,b:3.42,h:.18,w,d:.2,color:blanco},{x,b:3.6,h:.18,w:w*.66,d:.18,color:blanco},{x,b:3.78,h:.18,w:w*.33,d:.16,color:blanco}];
const ventana=x=>({x,w:1.9,h:2.4,b:.45,rect:true,frameColor:blanco,frameWidth:.28,fillColor:vidrio,lintel:true,frontBars:true,barColor:hierro});
export const C20_35={block:'C20',evidence:'C20/20261110-modelado',buildings:[{
 id:'C2-04',height:7.8,color:muro,roofColor:'#e7e7dc',uncertainty:.8,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/133OIriRrcYkbV0Y2VCPng.jpg','recorrido/h45BeWMtTog-TgjPTSYn6g.jpg','recorrido/rgjklAAPPcOxEB4RX95K1w.jpg','calco/referencia.webp','ajuste-visual/C20.jpg','evidence/C20/20261110-modelado/ficha.json'],
 // Aristas en el orden original de la planta registrada (fittedPlan con JOIN_REVIEWS): 2 =
 // Obregón (12.14 m, del encuentro con 37 a la esquina), 3/4/5/6/7 = Juan Álvarez. La planta
 // no se invierte al construir; reverseFins/reverseBands quedan por consistencia.
 facades:[
  // Obregón (P05): portón de arco verde, pilastra, dos ventanas con frontón y pilastra de
  // esquina. El portón se vio ~1.4 m más al oriente, sobre el vértice de inventario con 37;
  // se conserva el vértice y el portón se corre dentro de esta arista.
  {edge:2,plain:true,reverseFins:true,reverseBands:true,bands:bandas,
   fins:[pilastra(.35,.6),pilastra(3.55),pilastra(11.75),...fronton(5.6),...fronton(9.0)],
   bays:[{x:1.75,w:2.2,h:4.5,b:0,door:true,fillColor:verde,archFrameColor:blanco,barColor:hierro},ventana(5.6),ventana(9.0)]},
  // Juan Álvarez (sin foto): mismo orden clásico, una ventana por tramo largo; tramos cortos ciegos.
  {edge:3,plain:true,ciega:true,reverseFins:true,reverseBands:true,bays:[],bands:bandas,fins:[pilastra(.4)]},
  {edge:4,plain:true,reverseFins:true,reverseBands:true,bands:bandas,fins:fronton(2.92),bays:[ventana(2.92)]},
  {edge:5,plain:true,reverseFins:true,reverseBands:true,bands:bandas,fins:fronton(2.92),bays:[ventana(2.92)]},
  {edge:6,plain:true,ciega:true,bays:[],bands:bandas},
  {edge:7,plain:true,ciega:true,bays:[],bands:bandas}
 ],
 // Equipos de azotea: manchas oscuras con contraste local en la aérea (posición observada,
 // medidas típicas). La franja oscura de 2 m al poniente es sombra sobre Juan Álvarez.
 roofDetails:[tinaco(.3,39.1),tinaco(1.3,30.6),ventila(2.0,32.7,.6,.6),ventila(1.3,26.4,.8,.6),ventila(-5.6,31.4),ventila(-4.7,39.4,.6,.6),ventila(-2.9,41.0,.6,.6)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en panorama (Obregón); Juan Álvarez estimada',fotoCalle:true},
 hypothesis:{id:'H20-35',status:'modelado con foto de calle y formas estimadas',measured:false,photoreal:false,generic:false,
  observed:'Obregón (panorama R-001 P05, 6 m): edificio clásico de un nivel alto, muro gris claro, pilastras, entablamento, cornisa y pretil blancos; dos ventanas altas con reja, marco blanco y frontón; portón de arco con hojas verdes y abanico de vidrio junto al encuentro con 37; esquina con pilastra hacia Juan Álvarez. Pretil a 7.8 m (razón de ángulos, cámara de 2.8 m). Cubierta clara con dos tinacos y equipos menores en la aérea.',
  estimated:'Posición y medida de vanos (±0.5 m; el portón se corrió 1.4 m al poniente para caber en la arista registrada), frontones escalonados en vez de triangulares, altura ±0.8 m, colores corregidos de sombra; cara a Juan Álvarez sin foto (una ventana por tramo largo); equipos con medidas típicas.',
  unchanged:'Planta registrada (fittedPlan con JOIN_REVIEWS, ±3 m) y vértices de inventario; caras interiores sin vanos. Sustituye al paquete del corredor de Obregón del 26-oct (5.3 m), que queda como registro.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'35/C2-04: esquina clásica de un nivel alto sobre Obregón y Juan Álvarez; portón de arco verde, dos ventanas con frontón y reja, entablamento y pretil blancos (P05). Medidas visuales, no métricas; cara a Juan Álvarez estimada.'
}]};

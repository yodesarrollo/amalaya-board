// 40 / B3-01 / C21 · cuadra 10 · FRENTES ROJO, BLANCO Y AMARILLO SOBRE CHIHUAHUA CON FOTO DE CALLE (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas 360° del recorrido R-002 qU0X (frente al portón), kwpq
// (frente a la esquina verde) y wgpw (esquina oriente), niveladas con roll.json; aérea Esri z19
// (calco/referencia.webp y ajuste-visual/C21.jpg).
//
// Antes, B3-01 vivía en el paquete C21 de cuadra-detail-data.js (octubre): dos cajas, roja y
// blanca, partidas en x=92, con el frente 1–1.5 m detrás de la banqueta y sin el hueco entre la
// esquina verde y el rojo. Aquí se retraza por secciones sobre la línea de lote + 0.2 m.
//
// Visto en foto, de poniente a oriente: (1) frente rojo de un nivel desde la pilastra blanca de
// la esquina verde (x≈80.6) hasta x≈91.8, con cornisa gris saliente a ~4.1–4.5 m, ventana con
// reja y postigos grises, puerta con marco gris y una ventana con reja junto al blanco; arriba,
// pretil rojo y barandal de fierro con macetas (terraza). (2) Frente blanco hasta x≈105 con
// pretil a ~5.0 m: ventanal enrejado de ~3.1 m casi de piso a ~3.0 m en su extremo poniente,
// zaguán de arco con abanico de madera y una lámpara a cada lado, y portón de madera oscura de
// ~3.9 × 3.0 m con abanico. (3) Edificio amarillo de esquina con puerta de arco de marco blanco
// ancho, cornisa y pretil blanco perforado con óculos; sigue al oriente fuera del lote INEGI.
// Posiciones: bordes triangulados entre kwpq y qU0X (el paño real queda ~0.35 m al norte del
// que se dibuja) y vistas casi de frente desde qU0X; ±0.6 m.
// Aérea (corrida 1.3 m al norte por relieve; medir-aerea.py): enladrillado en los primeros
// ~4 m del rojo (#caa08e), azotea gris al fondo (#b9b9af), blanco al frente del blanco y en la
// esquina, fondo gris-verde (#bbc3bc) con una mancha verde-azulada de ~5 × 3.5 m tras el portón
// (tragaluz o patio techado; no se modela), un tinaco negro y una ventila.
// No se modelan: barandal y macetas de la terraza roja, bloque de pretil más alto sobre el
// zaguán, malla y poste de luz sobre el amarillo, ni el tramo amarillo de x 110.3–116 (con un
// ventanal de arco) que la aérea y wgpw muestran al oriente del límite INEGI de la cuadra.
import {tinaco,ventila} from './fabrica-fachadas.js?v=3b7f2a768403';
const rojo='#b0604f',gris='#958c86',blanco='#e8e8df',amarillo='#c39343',marcoBlanco='#efede6',madera='#4a3a30',azotea='#e6e2d6';
const lampara=x=>({x,b:2.45,h:.42,w:.42,d:.22,color:'#5a4535'});
export const C21_40={block:'C21',evidence:'C21/20261110-modelado',buildings:[{
 id:'B3-01',points:[[84.044,-37.19],[84.044,-21.327],[91.083,-20.547],[101.251,-21.587],[101.251,-22.628],[112.17399,-24.12317],[110.27508,-38.82501]],
 height:4.75,color:blanco,roofColor:azotea,uncertainty:.8,surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],roofDetails:[],
 sources:['recorrido/qU0XiVpeIHZyTixjEBUfgg.jpg','recorrido/kwpqUP9tZmmjDfiFDIJbsg.jpg','recorrido/wgpwXS6VA0MdLRF6oSqDBA.jpg','calco/referencia.webp','ajuste-visual/C21.jpg','evidence/C21/20261110-modelado/ficha.json'],
 // Arista 0 de cada frente = Chihuahua, escrita de poniente a oriente (x de los vanos desde el poniente).
 sections:[
  {part:'rojo',points:[[80.62,-38.629],[91.8,-39.151],[91.991,-35.055],[81.15,-34.56]],height:4.6,color:rojo,roofColor:'#caa08e',parapet:true,parapetColor:rojo,roofDetails:[],
   facades:[{edge:0,plain:true,bands:[{y:4.3,h:.4,d:.35,color:gris}],bays:[
    {x:2.58,w:1.0,h:1.9,b:.5,rect:true,frameColor:'#8f8d88',frameWidth:.22},
    {x:6.14,w:1.25,h:2.4,b:.08,rect:true,door:true,fillColor:'#2c2a29',frameColor:'#8f8d88',frameWidth:.14},
    {x:9.44,w:1.1,h:1.95,b:.45,rect:true,frameColor:'#8f8d88',frameWidth:.12}]}]},
  {part:'rojo-fondo',points:[[84.04,-34.692],[91.991,-35.055],[92.0,-20.641],[91.083,-20.547],[84.044,-21.327]],height:4.2,color:'#d9d2c4',roofColor:'#b9b9af',roofDetails:[],facades:[]},
  {part:'blanco',points:[[91.8,-39.151],[105.0,-39.767],[105.191,-35.671],[91.991,-35.055]],height:4.75,color:blanco,roofColor:azotea,parapet:true,parapetColor:blanco,
   roofDetails:[ventila(98.2,-37.5,.6,.6)],
   facades:[{edge:0,plain:true,reverseFins:true,fins:[lampara(5.05),lampara(7.98)],bays:[
    {x:1.95,w:3.1,h:2.75,b:.15,rect:true,fillColor:'#2f3438',frameColor:'#3a3836',frameWidth:.08},
    {x:6.51,w:2.1,h:3.1,b:.05,door:true,fillColor:'#3f3b40',frameColor:madera},
    {x:10.29,w:3.85,h:2.8,b:.03,rect:true,door:true,noBars:true,fillColor:'#3a3330',frameColor:madera,frameWidth:.15}]}]},
  {part:'blanco-fondo',points:[[91.991,-35.055],[105.191,-35.671],[105.771,-23.247],[101.251,-22.628],[101.251,-21.587],[92.0,-20.641]],height:4.2,color:'#e2ded3',roofColor:'#bbc3bc',
   roofDetails:[tinaco(102.3,-27.2)],facades:[]},
  {part:'amarillo',points:[[105.0,-39.767],[110.23,-40.011],[112.17,-24.123],[105.771,-23.247],[105.191,-35.671]],height:4.75,color:amarillo,roofColor:azotea,parapet:true,parapetColor:marcoBlanco,roofDetails:[],
   facades:[{edge:0,plain:true,bands:[{y:4.15,h:.16,d:.22,color:marcoBlanco},{y:4.47,h:.56,d:.05,color:marcoBlanco}],bays:[
    {x:1.70,w:1.2,h:2.9,b:.05,door:true,fillColor:'#2b2b2c',frameColor:marcoBlanco,frameWidth:.35}]}]}
 ],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true,secciones:5},
 hypothesis:{id:'H40-01',status:'retrazado por secciones con fotos de calle del recorrido R-002 y la aérea',measured:false,photoreal:false,generic:false,
  observed:'Sobre Chihuahua: frente rojo de un nivel (x 80.6–91.8) con cornisa gris saliente a ~4.1–4.5 m, ventana con reja y postigos grises, puerta con marco gris y ventana con reja junto al blanco, y en la azotea pretil rojo con barandal de fierro y macetas; frente blanco (x 91.8–105) con pretil a ~5.0 m, ventanal enrejado de ~3.1 m en su extremo poniente, zaguán de arco con abanico de madera y lámparas a los lados, y portón de madera oscura de ~3.9 m con abanico; edificio amarillo de esquina con puerta de arco de marco blanco ancho, cornisa y pretil blanco perforado con óculos, que sigue al oriente más allá del límite INEGI (panorámicas qU0X, kwpq y wgpw). Aérea: enladrillado en los primeros ~4 m del frente rojo, azotea gris al fondo, azoteas blancas al frente del blanco y en la esquina, fondo gris-verde con una mancha verde-azulada tras el portón, un tinaco negro y una ventila.',
  estimated:'Posición de vanos a ±0.6 m (frente visto muy de lado; el paño real queda ~0.35 m al norte del dibujado según la triangulación de seis bordes entre kwpq y qU0X); alturas de foto a ±0.3 m con ojo de cámara a 2.5 m; fondo de 4.1 m de los cuerpos al frente por la franja de enladrillado; cuerpos de fondo a 4.2 m sin foto; división rojo/blanco del fondo en x≈92; colores de foto a media luz; techos medidos en la aérea corrida 1.3 m al norte por relieve (blancos con el tono convencional #e6e2d6).',
  unchanged:'Línea de fondo del paquete de octubre y planta de octubre como registro; EB-SW con su módulo propio; barandal y macetas de la terraza roja, bloque de pretil sobre el zaguán, malla y poste sobre el amarillo, mancha verde-azulada y el tramo amarillo fuera del lote INEGI (x 110.3–116) sin modelar.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'40/B3-01: frentes rojo, blanco y amarillo sobre Chihuahua retrazados por secciones con fotos del recorrido R-002 y la aérea; el amarillo sigue al oriente fuera del lote INEGI.'}]};

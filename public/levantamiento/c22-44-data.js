// 44 / C3-02 / C22 · cuadra 11 · CUATRO FRENTES SOBRE OBREGÓN MODELADOS CON FOTO DE CALLE (11-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panoramas del recorrido R-001 sobre Obregón (P10, P11 y P12; Street View,
// dic-2023 según la revisión de octubre) y aérea Esri z19 (calco/referencia.webp, ajuste-visual/C22.jpg).
//
// Antes era la caja de inventario de 3.9 m (HEIGHT_REVIEWS de paramento-data.js, que no se edita)
// trazada sobre otra imagen satelital (±3 m), con el borde sur metido en el estacionamiento de
// Sufragio Efectivo. La foto muestra cuatro frentes de un nivel y la aérea una azotea blanca que
// termina en una línea oscura, con autos estacionados entre ella y la banqueta. Cuatro secciones a ±1 m:
//  · oeste (x 114.5–125.5): aplanado crema con cornisa café y zoclo de piedra; ventana con reja y
//    puerta azul de tablones; 3.9 m. Llega hasta la huella provisional de OB-21 (x 114.3) para cerrar
//    el frente: el tramo x 114.5–116.2 queda liso (en la foto es el final de OB-21, cuya huella de
//    octubre está corrida ~7 m al poniente y no se toca).
//  · alta (x 125.5–128.55): mismo aplanado con pretil y cornisa más altos; la ventana con reja del
//    escalón de la cornisa; 4.5 m.
//  · amarilla (x 128.55–140.2): casa amarilla con alero blanco corrido, ventana grande con reja,
//    puerta de reja y ventanal con reja, zoclo de piedra; 3.6 m.
//  · local (x 140.2–144.2): local bajo de block pintado con faja de piedra gris arriba y puerta
//    metálica; 3.0 m. Su azotea recibe la sombra de la casa blanca vecina (franja oscura en la aérea).
// Medición: columnas de píxel de vistas rectilíneas de los panoramas, intersectadas con el paño de
// cada sección (P11 coincide con la aérea; P12 se corrige +0.9 m con el lindero de la casa blanca).
// Estimado: vanos a ±0.5 m; alturas visuales ±0.5 m; caras a Sufragio Efectivo sin foto: casa de un
// nivel por tipología; colores de la foto a media luz; equipos de azotea en las manchas oscuras de la
// aérea con medidas típicas. La planta de inventario queda como registro. Letreros no se reproducen.
import {tinaco,calentador} from './fabrica-fachadas.js?v=3b7f2a768403';
const crema='#d8ccb5',cafe='#7b5c45',piedra='#7f786d',amarillo='#e6c45c',alero='#eeece4',block='#e0ddd5',marco='#e8e2d2',vidrio='#2d3336',hierro='#262626';
const ventana=(x,w,h=1.55,b=.95,frameColor=marco)=>({x,w,h,b,rect:true,frontBars:true,barColor:hierro,frameColor,frameWidth:.08,fillColor:vidrio});
const puerta=(x,w,fillColor,o={})=>({x,w,h:o.h??2.3,b:.06,rect:true,noBars:true,fillColor,frameColor:o.marco??marco,frameWidth:.08});
const seccion=(part,points,height,color,facades,roofDetails=[])=>({part,points,height,color,roofColor:'#e6e2d6',parapet:false,facades,roofDetails});
export const C22_44={block:'C22',evidence:'C22/20261111-modelado',buildings:[{
 id:'C3-02',height:4.5,color:crema,roofColor:'#e6e2d6',uncertainty:.8,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['recorrido/lYkbkN5HLT-6YQS4vIsd2g.jpg','recorrido/MtTpU1NWETczZgzdClblwg.jpg','recorrido/5FAUCdPN0bi6PQuYj_IQOA.jpg','calco/referencia.webp','ajuste-visual/C22.jpg','cuadras/C22-inventario.jpg','evidence/C3-02/20261006-01-cierre.json','evidence/C22/20261111-modelado/ficha.json'],
 // Aristas en el orden escrito de cada sección (normalizeSections): la 0 es Obregón; la cara sur
 // (hacia Sufragio Efectivo) es la 2 (y la 3 en la amarilla).
 sections:[
  seccion('c302-oeste',[[114.5,15.735],[125.5,15.107],[125.5,26.338],[115.65,29.066],[114.5,23.45]],3.9,crema,[
   {edge:0,plain:true,bands:[{x:6.36,w:9.315,y:.45,h:.9,d:.05,color:piedra},{x:6.36,w:9.315,y:3.7,h:.3,d:.2,color:cafe}],
    bays:[ventana(2.554,1.25),puerta(7.562,1.15,'#3a5fb8')]},
   {edge:2,tipo:'casa'}],
   [tinaco(121,16.2),tinaco(124.6,16)]),  // techo medido #f4f1e4 (blanco, tope #e6e2d6)
  seccion('c302-alta',[[125.5,15.107],[128.55,14.933],[128.55,25.493],[125.5,26.338]],4.5,crema,[
   {edge:0,plain:true,bands:[{y:.45,h:.9,d:.05,color:piedra},{y:4.25,h:.4,d:.25,color:cafe}],bays:[ventana(.75,.95,1.6,.95)]},
   {edge:2,tipo:'casa'}]),  // techo medido #f5efe0
  seccion('c302-amarilla',[[128.55,14.933],[140.2,14.018],[140.2,24.6],[132.5,24.4],[128.55,25.493]],3.6,amarillo,[
   {edge:0,plain:true,bands:[{y:.4,h:.8,d:.05,color:piedra},{y:2.72,h:.16,d:.5,color:alero}],
    bays:[ventana(2.157,2.5,1.55,.85,alero),puerta(4.363,1.05,hierro,{h:2.2,marco:alero}),ventana(7.573,3.4,1.55,.85,alero)]},
   {edge:2,tipo:'casa'},{edge:3,tipo:'casa',sinPuerta:true}],
   [tinaco(135,15.9),calentador(130.9,19.9),calentador(137.8,21.3)]),  // techo medido #fbf8f0
  seccion('c302-local',[[140.2,14.018],[144.2,14.13],[144.2,24.4],[140.2,24.6]],3,block,[
   {edge:0,plain:true,bands:[{y:2.6,h:.6,d:.08,color:'#77726a'}],bays:[puerta(1.851,1.05,'#8f9696',{h:2.15,marco:'#9a958c'})]},
   {edge:2,tipo:'casa'}],
   [tinaco(141.3,18.6)])  // techo medido #fcf9ef
 ],
 fabrica:{fecha:'2026-11-11',tipologia:'observada en foto de calle (Obregón); casa en las caras a Sufragio',fotoCalle:true,secciones:4},
 hypothesis:{id:'H44-01',status:'modelado con foto de calle en cuatro secciones trazadas sobre la aérea',measured:false,photoreal:false,generic:false,
  observed:'Cuatro frentes de un nivel sobre Obregón (P10, P11, P12): aplanado crema con cornisa café, zoclo de piedra, ventana con reja y puerta azul de tablones; tramo crema con pretil y cornisa más altos y ventana con reja bajo el escalón de la cornisa; casa amarilla con alero blanco corrido, ventana grande, puerta de reja y ventanal con reja; local bajo de block pintado con faja de piedra gris y puerta metálica. En la aérea, azotea blanca (medianas #f4f1e4 a #fcf9ef) con tinacos y calentadores, que termina al sur en una línea oscura con autos estacionados antes de la banqueta de Sufragio Efectivo.',
  estimated:'Contornos a ±1 m sobre la aérea; posición y tamaño de los vanos a ±0.5 m (pose de los panoramas aproximada; P12 corregido +0.9 m con la aérea); alturas visuales 3.9, 4.5, 3.6 y 3.0 m (±0.5 m); caras a Sufragio Efectivo por tipología casa de un nivel (sin foto); colores de la foto a media luz; tinacos y calentadores en las manchas oscuras de la aérea con medidas típicas; tramo liso x 114.5–116.2 para cerrar el frente junto a la huella provisional de OB-21.',
  unchanged:'Planta de inventario de C3-02 (±3 m) y altura de HEIGHT_REVIEWS conservadas como registro (paramento-data.js sin editar); OB-21 con su constructor propio y huella provisional; C3-01 y C3-03 en sus propios módulos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'44/C3-02: cuatro frentes de un nivel sobre Obregón (crema con puerta azul, crema alto, casa amarilla y local de block); foto de calle + aérea.'}]};

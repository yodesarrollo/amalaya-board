// 45 / C3-03 / C22 · cuadra 11 · CASA BLANCA, FRENTE TURQUESA Y TORREÓN REDONDO DEL CRUCE (11-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panoramas del recorrido R-001 sobre Obregón (P12, P13 y P14 en el cruce
// con Abasolo; Street View, dic-2023 según la revisión de octubre) y aérea Esri z19
// (calco/referencia.webp, ajuste-visual/C22.jpg).
//
// Antes era la caja turquesa de inventario de 4.0 m (HEIGHT_REVIEWS de paramento-data.js, que no se
// edita), recortada contra la calle por el ajuste visual y con la esquina oriente en punta. La foto
// muestra tres cuerpos de un nivel y un torreón redondo en el extremo oriente, frente a la plaza del
// cruce; la aérea, la azotea blanca, la curva del pretil del torreón y autos estacionados entre la
// azotea y la banqueta de Sufragio Efectivo. Secciones a ±1 m:
//  · blanca (x 144.3–149.86) en dos alturas: al poniente 3.95 m con la ventana en arco de marco
//    amarillo y reja; al oriente 4.45 m con la puerta de marco de cantera. Zoclo azul y adornos
//    azules (no se reproducen). La franja oscura de la aérea al poniente de x 144.5 es su sombra sobre
//    el local vecino, más bajo, y fija el lindero junto con el inventario y el quiebre de la banqueta.
//  · turquesa alta (x 149.86–157.07): alero corrido, zoclo verde con relieve y cortina metálica
//    café; 4.4 m. El letrero pintado de la sastrería no se reproduce.
//  · turquesa baja (x 157.07–165.6): mismo muro y alero, puerta de madera y porche con mural azul
//    junto al torreón; 4.0 m.
//  · torreón (x 165.6–171.5): frente norte recto y extremo redondo (medio octágono) con arcos ciegos
//    de moldura crema y mural azul, zoclo verde, losa de terraza con canto crema y pretil curvo de
//    piedra; 5.6 m hasta el remate del pretil (la terraza se modela sólida: desde la calle sólo se ve
//    el pretil). Queda 0.8 m detrás del frente turquesa, como el quiebre de la banqueta.
// Medición: columnas de píxel de vistas rectilíneas de los panoramas, intersectadas con el paño de
// cada sección (P13 coincide con la aérea; P12 se corrige +0.9 m con el lindero de la casa blanca).
// Estimado: vanos a ±0.5 m; alturas visuales ±0.5 m; caras a Sufragio Efectivo sin foto: casa de un
// nivel por tipología; cara sur del torreón ciega; colores de la foto a media luz; equipos en las
// manchas oscuras de la aérea con medidas típicas. La planta de inventario queda como registro.
// Murales y letreros se representan sólo como paños de color.
import {tinaco,calentador} from './fabrica-fachadas.js?v=3b7f2a768403';
const blanco='#efeee9',azul='#2c5fcf',cantera='#bcae96',turquesa='#86c9c6',verde='#4f9a5a',aleroT='#a7d8d4',crema='#e4dcc2',piedra='#86796a',vidrio='#2d3336',hierro='#262626';
const seccion=(part,points,height,color,facades,roofDetails=[],roofColor='#e6e2d6')=>({part,points,height,color,roofColor,parapet:false,facades,roofDetails});
const zocloAzul={y:.5,h:1,d:.03,color:azul},zocloVerde={y:.47,h:.9,d:.04,color:verde};
// Arcos ciegos del torreón: moldura crema y mural azul (paño de color, sin figura).
const arco=(x,w=1.1)=>({x,w,h:2.3,b:1,blind:true,fillColor:'#3a78bf',archFrameColor:crema});
const torreBandas=[zocloVerde,{y:4.42,h:.26,d:.35,color:crema},{y:5.02,h:.95,d:.06,color:piedra},{y:5.545,h:.1,d:.12,color:'#ddd6c2'}];
export const C22_45={block:'C22',evidence:'C22/20261111-modelado',buildings:[{
 id:'C3-03',height:5.6,color:turquesa,roofColor:'#e6e2d6',uncertainty:.8,parapet:false,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['recorrido/5FAUCdPN0bi6PQuYj_IQOA.jpg','recorrido/c_zMMTJvaks8XyIRT6mJCQ.jpg','recorrido/ywXPe_aoOm7HUa9l5NTdfg.jpg','calco/referencia.webp','ajuste-visual/C22.jpg','cuadras/C22-inventario.jpg','evidence/C3-03/20261006-01-cierre.json','evidence/C22/20261111-modelado/ficha.json'],
 // Aristas en el orden escrito de cada sección (normalizeSections). Obregón: 1 en la blanca poniente
 // y 0 en las demás; Sufragio Efectivo: 3 en la blanca poniente y 2 en las demás; torreón: 0 (norte),
 // 1–4 (medio octágono), 5 (sur, ciega) y 6 contra la turquesa baja.
 sections:[
  seccion('c303-blanca-oeste',[[144.3,14.1],[144.45,13.302],[146.63,13.044],[146.63,21.606],[144.3,21.906]],3.95,blanco,[
   {edge:1,plain:true,bands:[zocloAzul,{y:3.85,h:.2,d:.1,color:'#a5a49c'}],
    bays:[{x:1.31,w:1.15,h:2.35,b:.85,frontBars:true,barColor:hierro,fillColor:vidrio,archFrameColor:'#e9be2a'}]},
   {edge:3,tipo:'casa',sinPuerta:true}]),  // techo medido #f3f0e8
  seccion('c303-blanca',[[146.63,13.044],[149.86,12.852],[149.86,21.19],[146.63,21.606]],4.45,blanco,[
   {edge:0,plain:true,bands:[zocloAzul,{y:4.35,h:.2,d:.1,color:'#a5a49c'}],
    bays:[{x:1.342,w:1.1,h:2.3,b:.06,rect:true,noBars:true,fillColor:hierro,frameColor:cantera,frameWidth:.22}]},
   {edge:2,tipo:'casa'}],
   [tinaco(149.2,14.7)]),
  seccion('c303-turquesa-alta',[[149.86,12.852],[157.07,12.44],[157.07,20.128],[149.86,21.19]],4.4,turquesa,[
   {edge:0,plain:true,bands:[zocloVerde,{y:3.45,h:.3,d:.5,color:aleroT},{y:4.33,h:.14,d:.1,color:'#9fcfcb'}],
    bays:[{x:2.374,w:2.3,h:3,b:.06,rect:true,noBars:true,shutter:true,fillColor:'#4a3a31',frameColor:aleroT,frameWidth:.08}]},
   {edge:2,tipo:'casa'}],
   [calentador(152.4,16.5)]),  // techo medido #f7f3e8
  seccion('c303-turquesa-baja',[[157.07,12.44],[165.6,11.952],[165.6,17.957],[157.07,20.128]],4,turquesa,[
   {edge:0,plain:true,bands:[zocloVerde,{y:3,h:.26,d:.5,color:aleroT},{y:3.93,h:.14,d:.1,color:'#9fcfcb'}],
    bays:[{x:4.688,w:1,h:2.25,b:.06,rect:true,noBars:true,wood:true,fillColor:'#5c4430',frameColor:aleroT,frameWidth:.08},
     {x:6.901,w:2.6,h:2.1,b:.85,rect:true,noBars:true,fillColor:'#3d6f9e'}]},
   {edge:2,tipo:'casa'}],
   [tinaco(158.2,15.6),tinaco(162.6,14.3)]),  // techo medido #f8f6ed
  seccion('c303-torreon',[[165.6,12.72],[169.1,12.72],[170.79,13.42],[171.49,15.11],[170.79,16.8],[169.1,17.5],[165.6,17.5]],5.6,turquesa,[
   {edge:0,plain:true,bands:torreBandas,bays:[arco(.82,1.05),arco(2.4,1.15)]},
   ...[1,2,3,4].map(edge=>({edge,plain:true,bands:torreBandas,bays:[arco(.915)]})),
   {edge:5,plain:true,ciega:true,bands:torreBandas,bays:[]}],
   [],'#d5d1b9')  // terraza medida #d5d1b9; la curva oscura de la aérea es la sombra del pretil
 ],
 fabrica:{fecha:'2026-11-11',tipologia:'observada en foto de calle (Obregón y cruce); casa en las caras a Sufragio',fotoCalle:true,secciones:5},
 hypothesis:{id:'H45-01',status:'modelado con foto de calle en cinco secciones trazadas sobre la aérea',measured:false,photoreal:false,generic:false,
  observed:'Casa blanca en dos alturas con zoclo azul, ventana en arco con marco amarillo y reja, y puerta con marco de cantera; frente turquesa con alero corrido, zoclo verde con relieve, cortina metálica café, puerta de madera y porche con mural azul; torreón redondo en el cruce con Abasolo con arcos ciegos de moldura crema, mural azul, losa de terraza con canto crema y pretil curvo de piedra (P12, P13, P14). En la aérea, azotea blanca (medianas #f3f0e8 a #f8f6ed) con tinacos y un calentador, la curva del pretil del torreón y autos estacionados entre la azotea y la banqueta de Sufragio Efectivo; la franja oscura junto a x 144.5 es la sombra de la casa blanca sobre el local vecino.',
  estimated:'Contornos a ±1 m sobre la aérea; posición y tamaño de los vanos a ±0.5 m (P12 corregido +0.9 m con la aérea); alturas visuales 3.95, 4.45, 4.4, 4.0 y 5.6 m (±0.5 m); torreón como medio octágono con la terraza modelada sólida hasta el remate del pretil; cara sur del torreón ciega y caras a Sufragio Efectivo por tipología casa de un nivel (sin foto); colores de la foto a media luz; murales y letreros como paños de color; tinacos y calentador en las manchas oscuras de la aérea con medidas típicas.',
  unchanged:'Planta de inventario de C3-03 (±3 m) y su recorte del ajuste visual conservados como registro; altura de HEIGHT_REVIEWS como registro (paramento-data.js sin editar); la plaza del cruce queda abierta; C3-02 en su propio módulo.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'45/C3-03: casa blanca de zoclo azul, frente turquesa con alero y torreón redondo con pretil de piedra en el cruce con Abasolo; foto de calle + aérea.'}]};

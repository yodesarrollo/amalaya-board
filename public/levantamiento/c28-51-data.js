// 51 / B3-05 / C28 · cuadra 13 · MODELADO CON FOTO DE CALLE Y AÉREA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con al menos una foto se modela el edificio con lo
// observado donde se vio y su tipología por continuidad en el resto; «más que genérico, una
// versión aceptable a la realidad según las fotos».
// Fotos: panorama del recorrido R-001 punto 14 (ywXPe_aoOm7HUa9l5NTdfg, Obregón al poniente
// de Abasolo) y R-002 punto 1 (TMvGKzSUcJSVhkTRRxjHIA, Abasolo al norte), más la aérea Esri
// (calco/referencia.webp, ajuste-visual/C28.jpg). Los nombres de calle salen del registro
// («Obregón–Abasolo») y de la calzada AB-E de Abasolo: Abasolo al poniente, Obregón al sur.
//
// La planta de inventario (±3 m) era una caja de 6.2 m corrida unos 2–3 m al noreste. La foto
// de R-001 14 muestra en la esquina un edificio de un nivel gris pizarra con frente a Abasolo:
// portal de piedra con puerta azul clara cerca de la esquina, dos ventanas altas de marco
// blanco con reja, una placa verde, lámparas y remate claro; sobre la azotea, una terraza con
// macetas, cadenas de focos y un cuarto gris (en la aérea, el techo blanco de 3.9 × 2.7 m al
// norte). En la esquina el gris dobla sólo ~1 m sobre Obregón y sigue un cuerpo beige más bajo
// con cornisa y puertas; en la aérea ese cuerpo es la franja gris-beige junto a la banqueta,
// delante de la terraza de piso terracota (#c39579) y de las azoteas blancas (#faf4e9, #f8f3e8).
// Una franja oscura en x≈211 separa el conjunto del vecino del oriente, que no está en el
// inventario. Alturas medidas en la foto con la cámara a 2.5 m: remate del cuerpo gris a ≈4.3 m
// (9.0° sobre el horizonte a 11.2 m) y del cuerpo beige a ≈3.6 m (4.5° a 14.1 m); ±0.4 m. El
// cuerpo blanco del norte y oriente no se ve desde la calle: 4.0 m por tipología.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const gris='#5b6663',beige='#d3c7b2',muro='#d8cdb3',blanco='#e6e2d6',remate='#c9c9c3',piedra='#948a7b';
// Vanos observados en el frente de Abasolo (x desde la esquina suroeste); la última ventana,
// donde el muro con mural de la acera de enfrente tapa la foto, va por continuidad.
const ventana=x=>({x,w:1.3,h:1.85,b:1.1,rect:true,frontBars:true,barColor:'#2b2b2b',frameColor:'#dcdbd5',frameWidth:.14,fillColor:'#2d3336'});
const puerta={x:2.4,w:1.05,h:2.45,b:.06,rect:true,noBars:true,fillColor:'#86b4dd',frameColor:piedra,frameWidth:.08};
const maceta=(x,z)=>({x,z,w:.9,h:.8,d:.9,color:'#3e4a36'});
export const C28_51={block:'C28',evidence:'C28/20261110-modelado',buildings:[{
 id:'B3-05',height:4.3,color:gris,roofColor:blanco,uncertainty:.5,parapet:true,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['recorrido/ywXPe_aoOm7HUa9l5NTdfg.jpg','recorrido/TMvGKzSUcJSVhkTRRxjHIA.jpg','ajuste-visual/C28.jpg','calco/referencia.webp','cuadras/C28-inventario.jpg','evidence/B3-05/20261006-01-cierre.json','evidence/C28/20261110-modelado/ficha.json'],
 // Aristas en el orden escrito (normalizeSections): 51-esquina arista 0 = Abasolo (observada);
 // 51-obregon arista 2 = Obregón (tipología casa en beige, por la foto rasante); las demás,
 // interiores. La vuelta gris de ~1 m sobre Obregón (arista 11) es menor que el mínimo de frente.
 sections:[
  {part:'51-esquina',points:[[188.42,2],[186.79,-23.5],[190.2,-23.5],[190.2,-20.3],[194.1,-20.3],[194.1,-23.5],[197.7,-23.5],[197.7,-15],[204.2,-15],[204.2,-1.3],[189.55,-1.3],[189.55,1.92]],
   height:4.3,color:gris,roofColor:blanco,parapet:true,parapetColor:remate,
   // reverseBands: si normalizeSections invierte el anillo, el portal de piedra se espeja con los vanos.
   facades:[{edge:0,plain:true,reverseBands:true,bays:[puerta,ventana(7.7),ventana(15),ventana(22.3)],
    bands:[{y:4.18,h:.22,d:.18,color:remate},{x:2.4,w:2.1,y:1.285,h:2.45,d:.06,color:piedra},{x:2.4,w:2.1,y:2.88,h:.74,d:.06,color:piedra}]}],
   roofDetails:[{x:199.2,z:-8.7,w:9.8,h:.06,d:5.6,color:'#c39579'},
    maceta(193,-12),maceta(194.2,-14),maceta(196,-3.9),maceta(197.9,-4),maceta(199.5,-4),maceta(201.4,-4.2)]},
  // Cuarto gris de la azotea (foto R-001 14; techo blanco de 3.9 × 3.2 m en la aérea): ≈2.2 m
  // sobre la cubierta, como sección propia porque rebasa la escala de un equipo.
  {part:'51-cuarto',points:[[190.2,-23.5],[194.1,-23.5],[194.1,-20.3],[190.2,-20.3]],height:6.5,color:'#6b706c',roofColor:blanco,parapet:true,parapetColor:remate,facades:[],roofDetails:[]},
  {part:'51-obregon',points:[[189.55,-1.3],[210.3,-1.3],[210.3,.58],[189.55,1.92]],height:3.6,color:beige,roofColor:'#ccc4b1',parapet:true,parapetColor:'#d9cfbd',
   facades:[{edge:2,tipo:'casa',puertas:['inicio','centro'],marco:'#efe9dc'}],roofDetails:[]},
  {part:'51-blanco',points:[[197.7,-23.5],[210.3,-24.3],[210.3,-1.3],[204.2,-1.3],[204.2,-15],[197.7,-15]],height:4.0,color:muro,roofColor:blanco,parapet:true,parapetColor:'#ddd5c2',
   // Arista 2: queda a menos de 2.6 m de la banqueta pero detrás del cuerpo beige; muro ciego.
   facades:[{edge:2,ciega:true,plain:true,bays:[]}],roofDetails:[tinaco(203.2,-20.3),tinaco(205.6,-21.2),tinaco(208.5,-23)]}],
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:true,secciones:4},
 hypothesis:{id:'H51-01',status:'modelado con foto de calle (frente de Abasolo) y aérea en tres cuerpos y un cuarto de azotea',measured:false,photoreal:false,generic:false,
  observed:'Panorama R-001 14: edificio de esquina de un nivel gris pizarra sobre Abasolo con portal de piedra y puerta azul clara cerca de la esquina, dos ventanas altas de marco blanco con reja, placa, lámparas y remate claro; terraza en la azotea con macetas y cuarto gris; el gris dobla ~1 m sobre Obregón y sigue un cuerpo beige más bajo con cornisa y puertas. Aérea: terraza de piso terracota, azoteas blancas con tres tinacos, franja gris-beige del cuerpo de Obregón y árboles sobre la banqueta de Abasolo. Alturas por ángulo en la foto: ≈4.3 m el gris y ≈3.6 m el beige.',
  estimated:'Posiciones de vanos a ±1 m (vista rasante), tercera ventana del frente de Abasolo por continuidad (la tapa el muro con mural de enfrente), fachada de Obregón por tipología casa en beige, cuerpo blanco del norte y oriente con 4.0 m por tipología, límite oriente en la franja oscura de x≈211, colores de muro corregidos de una foto a la sombra, cuarto de azotea y macetas con medidas típicas.',
  unchanged:'Planta de inventario conservada como registro; registro individual de B3-05; el resto de la cuadra C28 (fuera del inventario de 139) sin volumen.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'51/B3-05: esquina Obregón–Abasolo; cuerpo gris de un nivel con frente observado a Abasolo y terraza en la azotea, cuerpo beige más bajo sobre Obregón y cuerpo blanco al norte y oriente; foto de calle R-001 + aérea.'}]};

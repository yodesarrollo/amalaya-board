// 41 / EB-NW / C21 · cuadra 10 · ESQUINA VERDE DE GARMENDIA Y CHIHUAHUA (10-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Esta esquina ya se modeló con foto en octubre (paquete C21 de
// cuadra-detail-data.js, panorámicas cjTH y kwpq del recorrido R-002): muro verde, marcos claros
// con reja, remate claro y tres ventanas por cara. Nunca se empeora un modelo hecho con foto: aquí
// pasa a su módulo con la misma planta, altura, colores y fachadas.
//
// Se agrega lo que da la aérea (corrida 1.3 m al norte por relieve; medir-aerea.py): azotea blanca
// (claros #f9f5ec, tono convencional #e6e2d6) con un tinaco negro redondo y cuatro piezas oscuras
// (tinacos o calentadores; dos alargadas al frente y una al fondo), a ±0.5 m.
// No se retraza: el dueño de esta planta no es una «Planta física» (no entra a la fábrica) y su
// firma de colisiones está congelada en scripts/firmas-colisiones-base.json. Límites que quedan
// documentados: el frente está ~1 m detrás de la banqueta de Chihuahua, el borde oriente no llega
// a la pilastra blanca que lo une con el frente rojo de B3-01 (x≈80.6) y la caja techa un patio con
// árboles que la aérea muestra entre x 76.5 y 82.
import {tinaco} from './fabrica-fachadas.js?v=3b7f2a768403';
const verde='#789465',marco='#ece9dd',remate={y:4.23,h:.18,d:.20,color:'#eeeae0'},oscuro='#3a3c3d';
const pieza=(x,z,w,d)=>({x,z,w,h:.9,d,color:oscuro});
export const C21_41={block:'C21',evidence:'C21/20261110-modelado',buildings:[{
 id:'EB-NW',ownerPrefix:'ESQUINA NOROESTE',points:[[65.48577,-36.82626],[80.48021,-37.82364],[82.88317,-22.9738],[67.88873,-21.97642]],height:4.4,color:verde,uncertainty:2.0,
 roofColor:'#e6e2d6',
 sources:['recorrido/cjTHuFQqgbHlqPDeYtUDaQ.jpg','recorrido/kwpqUP9tZmmjDfiFDIJbsg.jpg','calco/referencia.webp','ajuste-visual/C21.jpg','evidence/C21/20261110-modelado/ficha.json'],
 facades:[{edge:0,plain:true,bays:[3,8,12].map(x=>({x,w:1.35,h:2.15,b:.55,rect:true,frameColor:marco})),bands:[remate]},
  {edge:3,plain:true,bays:[3.5,8.5,12.5].map(x=>({x,w:1.2,h:2.1,b:.55,rect:true,frameColor:marco})),bands:[remate]}],
 roofDetails:[pieza(72.6,-34.6,.8,1.6),pieza(75.0,-34.6,.8,1.6),tinaco(73.0,-28.7),pieza(69.8,-27.8,.8,.8),pieza(73.6,-25.0,.8,1.6)],
 hypothesis:{id:'H41-01',status:'modelo de octubre con foto conservado; techo y equipos de la aérea',measured:false,photoreal:false,generic:false,
  observed:'Fotos de octubre (cjTH y kwpq): esquina verde de un nivel con marcos claros, rejas y remate claro, y pilastra blanca en su extremo oriente junto al frente rojo de B3-01. Aérea: azotea blanca con un tinaco negro redondo y cuatro piezas oscuras.',
  estimated:'Anchuras de vanos y altura 4.4 m del ajuste de octubre (visuales, no medidas); posición de los equipos a ±0.5 m y su tipo (tinaco o calentador) sin confirmar; tono de azotea convencional para techos muy blancos.',
  unchanged:'Planta, altura, colores, fachadas y dueño de octubre (ESQUINA NOROESTE), con su firma de colisiones; frente ~1 m detrás de la banqueta, hueco hasta la pilastra blanca y patio techado por la caja, documentados y sin corregir.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'41/EB-NW: esquina verde de un nivel en Garmendia y Chihuahua (modelo con foto de octubre) con azotea blanca y equipos vistos en la aérea.'}]};

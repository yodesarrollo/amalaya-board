// 50 / EB-SE / C23 · cuadra 12 · FRENTE DE LA BODEGA SOBRE OBREGÓN AJUSTADO CON FOTO DE CALLE (11-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido R-001 P12 (5FAUCdPN0bi6PQuYj_IQOA), P13
// (c_zMMTJvaks8XyIRT6mJCQ) y P14 (ywXPe_aoOm7HUa9l5NTdfg), rectificadas sobre el plano de Obregón.
//
// Antes, EB-SE salía del frente 'almacen-esquina' de paramento-data.js (que no se edita): 9.5 m,
// fachada lisa y una sola puerta de 4.3 m cerca de la esquina. El paquete toma ese frente como dueño
// (prefijo ESQUINA SURESTE · ABASOLO / OBREGÓN) y lo reconstruye con la MISMA planta y la MISMA
// altura: la firma de colisiones de EB-SE está congelada (pruebas-c1-13-enjambre) y EB-SE no puede
// llevar `fabrica`, porque pruebas-fabrica sólo reconoce dueños «Planta física · ID». Por eso aquí
// sólo cambian los vanos de la cara a Obregón y el registro; lo observado que no se aplica queda en
// `hypothesis` (altura del muro y esquina poniente).
//
// Visto en la foto: muro blanco con mural (figuras con rebozos y grecas; letrero pintado «… DE
// ROPA» arriba), portón de cochera de lámina en tres partes (dos hojas y una puerta abierta al
// centro, letreros «NO ESTACIONARSE / COCHERA EN USO»), dos rejillas de ventilación arriba en el
// tramo poniente y medidor. Estimado: posiciones a ±1 m (poses de cámara aproximadas), alto del
// portón 4.8 m. No modelado: el mural y los letreros (no se reproducen como textura) y la rejilla
// alta (a 8.5 m, en el borde del volumen de 9.5 m).
const lamina='#a7aba8',interior='#2b2a28';
export const C23_50={block:'C23',evidence:'C23/20261111-modelado',buildings:[{
 id:'EB-SE',ownerPrefix:'ESQUINA SURESTE · ABASOLO / OBREGÓN',height:9.5,color:'#dddcd0',uncertainty:1.5,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['recorrido/5FAUCdPN0bi6PQuYj_IQOA.jpg','recorrido/c_zMMTJvaks8XyIRT6mJCQ.jpg','recorrido/ywXPe_aoOm7HUa9l5NTdfg.jpg','calco/referencia.webp','ajuste-visual/C23.jpg','evidence/EB-SE/20261006-01-cierre.json','evidence/C23/20261111-modelado/ficha.json'],
 // Planta registrada del frente de octubre (sin `points`: se toma la de su dueño). Arista 0 = Obregón
 // de poniente a oriente (29.4 m), 1 ochave, 2 Abasolo, 3 norte, 4 poniente.
 facades:[{edge:0,plain:true,bays:[
  {x:16.75,w:2.9,h:4.8,b:0,rect:true,noBars:true,fillColor:lamina},     // hoja poniente del portón
  {x:19.2,w:1.8,h:4.8,b:0,rect:true,noBars:true,fillColor:interior},    // puerta abierta: interior de la bodega
  {x:21.75,w:3.1,h:4.8,b:0,rect:true,noBars:true,fillColor:lamina},     // hoja oriente
  {x:7.95,w:1.2,h:.9,b:4.9,rect:true,noBars:true,fillColor:'#6f716d'}   // rejilla de ventilación baja
 ]}],
 hypothesis:{id:'H50-01',status:'frente de octubre con vanos ajustados a la foto de calle; volumen congelado',measured:false,photoreal:false,generic:false,
  observed:'Muro blanco con mural de figuras y grecas y letrero pintado de bodega de ropa; portón de cochera de lámina en tres partes (hojas de ~3 m y puerta abierta al centro) de unos 8 m por 4.8 m; dos rejillas de ventilación en el tramo poniente (a ~5 m y ~8.5 m) y medidor; mural también en la esquina y en la cara a Abasolo. Remate del muro de Obregón a unos 12.5–14 m (más alto al centro, por el letrero) medido por los ángulos de base y remate desde P13 y P14; el cuerpo alto empieza hacia x 155–157 y la arcada de B3-03 llega hasta él, con un mural azul en su cara poniente.',
  estimated:'Posición del portón y de la rejilla a ±1 m sobre la arista de Obregón; alto del portón 4.8 m; colores del frente a media luz.',
  unchanged:'Planta y altura de 9.5 m del frente almacen-esquina de octubre (paramento-data.js sin editar): la firma de colisiones de EB-SE está congelada y EB-SE no puede llevar fabrica (pruebas-fabrica pide un dueño «Planta física»), así que la altura observada y la esquina poniente quedan registradas sin aplicar; caras a Abasolo, norte y poniente lisas (la de Abasolo sólo se ve en escorzo).',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'50/EB-SE: bodega con mural en la esquina Obregón–Abasolo; portón de cochera en tres partes y rejilla según P13/P14, sobre el volumen de octubre.'}]};

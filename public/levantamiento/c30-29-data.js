// 29 / A2-06 / C30 · cuadra 8 · MODELADO CON FOTO DE CALLE SOBRE LA PLANTA REGISTRADA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Fotos: Street View dic-2023 desde Garmendia (evidence/c30-cierre-20261008/c30-garmendia-norte-20261008.jpg, rumbo 270):
// muro pardo continuo con juntas y, junto a la esquina, el letrero de la farmacia; panorama del
// recorrido R-000 punto 1 en la esquina Serdán–Garmendia (recorrido/2MNg6Xk9_yV3lqEALqRg4Q.jpg, vistas
// a 200°, 235° y 265°): en Serdán, escaparates de vidrio con marco verde entre pilares blancos bajo un
// faldón café claro con brazos de luminarias, que da vuelta unos metros a Garmendia. No se reproducen
// letreros. Planta, altura 6.2 m y muro de Garmendia del paquete C30 del 8-oct. Aérea Esri z19 para la
// cubierta (mediana #fcfaf4) y el equipo.
const aire=(x,z)=>({x,z,w:.9,h:.8,d:.7,color:'#9c9b93'});  // condensador visto en la aérea (medidas típicas)
const faldon='#c9a47f',pilar='#ecebe5',marco='#5f9a6e',vidrio='#3b4744';
export const C30_29={
 id:'A2-06',height:6.2,color:'#807468',roofColor:'#e6e2d6',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c30-cierre-20261008/c30-garmendia-norte-20261008.jpg','evidence/c30-cierre-20261008/c30-serdan-centro-20261008.jpg','recorrido/2MNg6Xk9_yV3lqEALqRg4Q.jpg','calco/referencia.webp','ajuste-visual/C30.jpg','evidence/C30/20261110-modelado/ficha.json'],
 // Aristas en el orden de la planta registrada: 0 = Serdán (14.46 m, de poniente a la esquina),
 // 1 = Garmendia (27.29 m, de la esquina al sur; muro ciego en la foto). La planta se invierte al
 // construir: fins y bandas con x se dan en ese mismo orden (reverseFins, reverseBands). La y de
 // una banda es su centro: el faldón va de 3.6 a 6.0 m.
 facades:[
  {edge:0,plain:true,reverseFins:true,bands:[{y:4.8,h:2.4,d:.22,color:faldon}],
   fins:[.45,7.6,14].map(x=>({x,b:0,h:3.6,w:.9,d:.25,color:pilar})),
   bays:[{x:4,w:5.6,h:2.9,b:.15,rect:true,noBars:true,fillColor:vidrio,frameColor:marco},{x:10.8,w:5.2,h:2.9,b:.15,rect:true,noBars:true,fillColor:vidrio,frameColor:marco}]},
  {edge:1,plain:true,ciega:true,reverseBands:true,bays:[],bands:[{y:2.4,h:.035,d:.04,color:'#514b43'},{y:4.75,h:.035,d:.04,color:'#514b43'},{x:3,w:6,y:4.8,h:2.4,d:.22,color:faldon}]}
 ],
 roofDetails:[aire(36.5,-78.8)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H29-01',status:'modelado con foto de calle sobre la planta registrada',measured:false,photoreal:false,generic:false,
  observed:'Farmacia en la esquina Serdán–Garmendia (Street View dic-2023 y panorama del recorrido R-000 en la esquina): en Serdán, escaparates de vidrio con marco verde entre pilares blancos y faldón café claro con brazos de luminarias, que da vuelta a Garmendia; en Garmendia, muro pardo continuo con juntas. En la aérea, cubierta blanca plana (mediana #fcfaf4) con un equipo.',
  estimated:'Ancho de escaparates y pilares, alto del faldón (±0.5 m) y su tramo en Garmendia; medidas del equipo de azotea.',
  unchanged:'Planta registrada (±3 m), altura 6.2 m y muro de Garmendia del paquete C30 del 8-oct; caras interiores sin vanos.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'29/A2-06: farmacia de esquina con escaparates entre pilares blancos y faldón en Serdán y muro pardo en Garmendia (Street View dic-2023, panorama R-000); cubierta blanca con un equipo. No se reproducen letreros.'
};

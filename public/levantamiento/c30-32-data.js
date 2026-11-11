// 32 / CH-YG-BBVA / C30 · cuadra 8 · MODELADO CON FOTO DE CALLE SOBRE SU HUELLA OSM (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Fotos: Street View dic-2023 desde la esquina Serdán–Yáñez (evidence/c30-cierre-20261008/c30-yanez-banco-20261008.jpg, rumbo
// 100) y desde Serdán (evidence/c30-cierre-20261008/c30-serdan-biblioteca-20261008.jpg): volumen blanco con acceso retranqueado
// y tres peldaños en Serdán, banda azul sobre el acceso y paños verticales en Yáñez; no se reproducen
// marcas ni anuncios. Huella OSM 499759374, altura 6.2 m, fachadas y peldaños del paquete C30 del 8-oct.
// Se construye sobre su huella OSM y no sobre una planta del paramento, así que no lleva la marca
// `fabrica` (pruebas-fabrica exige planta del paramento); sus fachadas son de foto. Aérea Esri z19:
// cubierta terracota (mediana #ad8774 en la parte sin tragaluces) con tragaluces y equipos.
const aire=(x,z)=>({x,z,w:.9,h:.8,d:.7,color:'#9c9b93'});  // condensador visto en la aérea (medidas típicas)
const equipo=(x,z,w=1.6,d=1.4)=>({x,z,w,h:1.2,d,color:'#6f716c'});  // equipo grande visto en la aérea (altura estimada)
export const C30_32={
 id:'CH-YG-BBVA',ownerPrefix:'Huella OSM 499759374',points:[[-34.04916,-90.00264],[-75.495239,-82.424751],[-68.341316,-43.492401],[-26.895241,-51.070286]],height:6.2,color:'#e2e4df',roofColor:'#ad8774',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c30-cierre-20261008/c30-yanez-banco-20261008.jpg','evidence/c30-cierre-20261008/c30-serdan-biblioteca-20261008.jpg','calco/referencia.webp','ajuste-visual/C30.jpg','evidence/C30/20261110-modelado/ficha.json'],
 // Aristas de la huella: 0 = Serdán (42.1 m), 1 = Yáñez (39.6 m). El acceso del paquete usa la arista 0.
 facades:[{edge:0,plain:true,bays:[{x:22,w:4.4,h:2.8,b:.05,rect:true,noBars:true,fillColor:'#536777'}],bands:[{x:22,w:13,y:4.5,h:.7,d:.18,color:'#315678'}]},
  {edge:1,plain:true,fins:[4,9,14,19,24,29,34].map(x=>({x,b:.2,h:3.4,w:.26,d:.2,color:'#d1d4cc'}))}],
 // Equipos: las manchas oscuras mayores de 0.8 m² fuera de las hileras de tragaluces.
 roofDetails:[equipo(-36.1,-87.5),aire(-68.5,-82.3),aire(-72.7,-81.5),aire(-60.4,-80.7),aire(-61.9,-80.3),aire(-52.6,-72.1),aire(-51.1,-69.9),aire(-61.5,-56.4),equipo(-56.4,-50.3),equipo(-51.6,-49.2)],
 hypothesis:{id:'H32-01',status:'modelado con foto de calle sobre su huella OSM',measured:false,photoreal:false,generic:false,
  observed:'Banco en la esquina Serdán–Yáñez (Street View dic-2023): volumen blanco con acceso retranqueado y tres peldaños en Serdán, banda azul sobre el acceso y paños verticales en Yáñez; estacionamiento al oriente. En la aérea, cubierta terracota con hileras de tragaluces y equipos.',
  estimated:'Altura 6.2 m (cota visual ±1.2 m), posición de paños y banda, color exacto de la cubierta y medidas de los diez equipos de azotea.',
  unchanged:'Huella OSM 499759374 (dueño propio, sin marca de fábrica), fachadas de foto y peldaños de acceso del paquete C30 del 8-oct.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'32/CH-YG-BBVA: banco blanco con acceso retranqueado en Serdán y paños verticales en Yáñez (Street View dic-2023); cubierta terracota con diez equipos vistos en la aérea. No se reproducen marcas ni anuncios.'
};

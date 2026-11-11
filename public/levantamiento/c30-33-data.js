// 33 / CH-YG-BIB / C30 · cuadra 8 · MODELADO CON FOTO DE REFERENCIA SOBRE SU HUELLA OSM (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Fotos: Street View dic-2023 desde Serdán (evidence/c30-cierre-20261008/c30-serdan-biblioteca-20261008.jpg) muestra la
// biblioteca en obra (estructura de concreto y acero); la referencia de 2025 (El Colegio de Sonora,
// El Imparcial) muestra la fachada terminada con vidrio, panel rojizo y elementos oscuros, interpretada
// en el paquete C30 del 8-oct (huella OSM 1533334038, altura provisional 9.6 m). Se construye sobre su
// huella OSM y no sobre una planta del paramento: sin marca `fabrica`. La aérea Esri z19 es anterior a la
// terminación: la mitad oriente de la planta se ve blanca (#fbf9f0) y la poniente oscura (obra o sombra);
// el color de la cubierta terminada es estimado y no se ponen equipos.
export const C30_33={
 id:'CH-YG-BIB',ownerPrefix:'Huella OSM 1533334038',points:[[9.12708,-99.045067],[-3.68388,-96.704018],[3.33396,-59.313869],[17.53488,-65.105461]],height:9.6,color:'#bbbdb5',roofColor:'#e6e2d6',uncertainty:1.5,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c30-cierre-20261008/c30-serdan-biblioteca-20261008.jpg','https://www.colson.edu.mx/nota.aspx?nx=7106','https://www.elimparcial.com/son/hermosillo/2025/05/27/biblioteca-gerardo-cornejo-culmina-mayo-con-actividades-culturales-y-literarias/','calco/referencia.webp','ajuste-visual/C30.jpg','evidence/C30/20261110-modelado/ficha.json'],
 // Arista 0 = Serdán (13.0 m) de la huella OSM.
 facades:[{edge:0,plain:true,bays:[{x:2.8,w:3.6,h:2.9,b:.1,rect:true,noBars:true,fillColor:'#344044'},{x:8.3,w:4.4,h:2.9,b:.1,rect:true,noBars:true,fillColor:'#354446'},...[3.45,6.55].flatMap(b=>[3.0,9.0].map(x=>({x,w:4.5,h:2.25,b,rect:true,noBars:true,fillColor:'#455758'})))],bands:[{y:3.23,h:.24,d:.22,color:'#aaa8a0'},{y:6.35,h:.24,d:.22,color:'#aaa8a0'},{x:7.8,w:5.8,y:3.35,h:.64,d:.15,color:'#96563f'},{y:9.36,h:.2,d:.28,color:'#bcbab0'}],fins:[.6,1.25,1.9,2.55,3.2,3.85,4.5,5.15,5.8,6.45,7.1,7.75,8.4,9.05,9.7,10.35,11].map(x=>({x,b:6.6,h:2.05,w:.07,d:.12,color:'#343d3b'}))}],
 hypothesis:{id:'H33-01',status:'modelado con foto de referencia sobre su huella OSM',measured:false,photoreal:false,generic:false,
  observed:'Biblioteca en Serdán: en Street View dic-2023 en obra; en la referencia de 2025, fachada cerrada con vidrio, panel rojizo y elementos oscuros. La aérea, anterior a la terminación, muestra blanca la mitad oriente de la planta y oscura la poniente.',
  estimated:'Altura 9.6 m provisional (tres niveles, ±1.5 m), proporción de vidrios, panel y aletas, color de la cubierta terminada; sin equipos porque la aérea es de la obra.',
  unchanged:'Huella OSM 1533334038 (dueño propio, sin marca de fábrica) y fachada de Serdán del paquete C30 del 8-oct.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'33/CH-YG-BIB: biblioteca terminada interpretada de la referencia de 2025 (vidrio, panel rojizo y aletas oscuras) sobre su huella OSM; la aérea es de la obra. Sin dimensiones medidas.'
};

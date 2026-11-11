// 31 / B2-02 / C30 · cuadra 8 · MODELADO CON FOTO DE CALLE SOBRE LA PLANTA REGISTRADA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Foto: Street View dic-2023 desde Garmendia (evidence/c30-cierre-20261008/c30-garmendia-sur-20261008.jpg, rumbo 270):
// frente azul bajo con dos ventanas de reja decorativa naranja y puerta, mural (no se reproduce) y,
// al sur, reja con portón. Fachada, altura 3.6 m y planta de ocho vértices del paquete C30 del 8-oct.
// Aérea Esri z19: cubierta mixta, clara (#ebeadb) y oscura (vegetación o sombra), con un equipo grande
// y uno menor; el patio lateral no se rellena.
const aire=(x,z)=>({x,z,w:.9,h:.8,d:.7,color:'#9c9b93'});  // condensador visto en la aérea (medidas típicas)
const equipo=(x,z,w=1.6,d=1.4)=>({x,z,w,h:1.2,d,color:'#6f716c'});  // equipo grande visto en la aérea (altura estimada)
export const C30_31={
 id:'B2-02',height:3.6,color:'#62a8bf',roofColor:'#dddccf',uncertainty:.8,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c30-cierre-20261008/c30-garmendia-sur-20261008.jpg','calco/referencia.webp','ajuste-visual/C30.jpg','evidence/C30/20261110-modelado/ficha.json'],
 // Arista 3 = Garmendia (4.86 m) en el orden de la planta registrada.
 facades:[{edge:3,plain:true,bays:[{x:.8,w:1,h:1.2,b:.8,rect:true,frameColor:'#c9b65c'},{x:2.45,w:.9,h:2.2,b:0,rect:true,door:true,frameColor:'#c9b65c'},{x:4.05,w:1,h:1.2,b:.8,rect:true,frameColor:'#c9b65c'}],bands:[{y:3.3,h:.12,d:.14,color:'#8d8081'}]}],
 roofDetails:[equipo(27.2,-43.5),aire(32.1,-46.9)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H31-01',status:'modelado con foto de calle sobre la planta registrada',measured:false,photoreal:false,generic:false,
  observed:'Frente azul bajo en Garmendia (Street View dic-2023): dos ventanas con reja decorativa naranja y puerta, mural y reja con portón al sur. En la aérea, cubierta mixta clara y oscura con un equipo grande y uno menor.',
  estimated:'Posición y medida de vanos (paquete C30, ±0.5 m), color de la cubierta (tono claro escalado) y medidas de los equipos; las partes oscuras de la planta (vegetación o sombra) no se separan.',
  unchanged:'Planta registrada de ocho vértices (±3 m), altura 3.6 m y fachada de Garmendia del paquete C30 del 8-oct; patio lateral sin rellenar.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'31/B2-02: frente azul bajo con dos ventanas y puerta (Street View dic-2023; el mural no se reproduce); cubierta mixta con dos equipos. Medidas visuales, no métricas.'
};

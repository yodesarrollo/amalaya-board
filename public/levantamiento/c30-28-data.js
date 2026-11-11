// 28 / A2-05 / C30 · cuadra 8 · MODELADO CON FOTO DE CALLE SOBRE LA PLANTA REGISTRADA (10-nov-2026).
// Criterio del propietario (10-nov-2026): con foto se modela lo observado (vanos, rasgos,
// colores, altura); donde no hay foto se completa con la fábrica y se declara estimado.
//
// Foto: Street View dic-2023 desde Serdán (evidence/c30-cierre-20261008/c30-serdan-centro-20261008.jpg, cámara
// 29.07709,-110.9545626, rumbo 180): frente de dos niveles con planta baja de vanos amplios tras
// malla, faldón corrido y remate con letrero (no se reproduce el texto). La fachada, la altura de
// 7.2 m y la planta son las del paquete C30 del 8-oct. Aérea Esri z19 para la cubierta (mediana
// #fdfbf5) y el equipo de azotea.
const aire=(x,z)=>({x,z,w:.9,h:.8,d:.7,color:'#9c9b93'});  // condensador visto en la aérea (medidas típicas)
export const C30_28={
 id:'A2-05',height:7.2,color:'#ddd9cc',roofColor:'#e6e2d6',uncertainty:1.2,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,
 sources:['evidence/c30-cierre-20261008/c30-serdan-centro-20261008.jpg','calco/referencia.webp','ajuste-visual/C30.jpg','evidence/C30/20261110-modelado/ficha.json'],
 // Arista 0 = Serdán (12.39 m) en el orden de la planta registrada.
 facades:[{edge:0,plain:true,bays:[{x:6.1,w:9.6,h:2.8,b:.1,rect:true,noBars:true,fillColor:'#58615b'}],bands:[{y:3.25,h:.32,d:.3,color:'#c8c5b8'},{y:6.9,h:.18,d:.2,color:'#cfcec2'}]}],
 roofDetails:[aire(20.9,-85.7)],
 fabrica:{fecha:'2026-11-10',tipologia:'observada en foto de calle',fotoCalle:true},
 hypothesis:{id:'H28-01',status:'modelado con foto de calle sobre la planta registrada',measured:false,photoreal:false,generic:false,
  observed:'Frente de dos niveles sobre Serdán (Street View dic-2023): planta baja con vanos amplios tras malla, faldón corrido y remate con letrero, muro claro. En la aérea, cubierta blanca plana (mediana #fdfbf5) con un equipo cerca del centro.',
  estimated:'Ancho y alto del vano y cotas de faldón y remate (paquete C30, cota visual; altura 7.2 m ±1.2 m); medidas del equipo de azotea.',
  unchanged:'Planta registrada (±3 m), altura y fachada de Serdán del paquete C30 del 8-oct; caras laterales y posterior sin vanos (colindancias).',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'28/A2-05: frente de dos niveles en Serdán con vano amplio, faldón y remate (Street View dic-2023); cubierta blanca con un equipo. Medidas visuales, no métricas.'
};

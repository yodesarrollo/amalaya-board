// 85 / D1-10 · PRACTICO-2 · MODELO / HIPÓTESIS H85-S-01.
// No points/sections/gableRise: the factory must reuse the exact fittedPlan
// (seven adjusted vertices plus the existing four-vertex courtyard).
// All dimensions below are design parameters in model units, NOT measurements.
const frontLength=30.089678941369886;
const bands=()=>[
 {y:.24,h:.48,d:.04,color:'#aaa89d'},
 {y:6.03,h:.18,d:.04,color:'#b5b3a7'}
];
export const C10_85={
 block:'C10',evidence:'D1-10/PRACTICO-2-H85-S-01',buildings:[{
  id:'D1-10',height:6.2,color:'#c1b7a5',roofColor:'#c1b7a5',uncertainty:3,
  surfaceMaterial:{metalness:0,roughness:.96},keepDetails:true,facadeOverlayOnly:true,
  sources:['ajuste-visual/C10.jpg','ajuste-visual-data.js'],
  facades:[
   // Original fittedPlan edge 5: long south frontage toward Felipe Salido.
   // Three blind, closed panels with raised sill: no proposed doorway/access.
   {edge:5,plain:true,bays:[.25,.5,.75].map(t=>({
    x:frontLength*t,w:4.4,h:2.6,b:.70,rect:true,blind:true,
    noBars:true,open:false,recess:0,fillColor:'#a3a195'
   })),bands:bands()},
   // Original short edge 6 (0.8735 model units): no bays or encroaching frame.
   {edge:6,plain:true,bays:[],bands:bands()}
  ],
  hypothesis:{
   id:'H85-S-01',status:'pending',measured:false,photoreal:false,
   scope:'Frente sur hacia Felipe Salido: arista5 larga y continuidad sobria en arista6 corta; patio y masa existentes sin cambios.',
   basis:'HIPÓTESIS conservadora autorizada por PRACTICO-2, sin fotografía atribuible del frente. Aérea C10 y ajuste visual sólo sustentan masa/implantación/vacío; fecha de aérea desconocida.',
   proposed:['Tres paños rectangulares ciegos cerrados, elevados sobre el suelo, en cuartos de la arista5','Zócalo tonal continuo de poco relieve en aristas5/6','Banda superior fina contenida en la altura estimada, sin ornamento'],
   inherited:'Altura estimada6.2; tono mineral base y cubierta#c1b7a5 heredados del mundo; no textura fotográfica.',
   access:'Todos los paños open:false; no puerta ni paso nuevo, sin modificación de accesibilidad. No acredita identidad comercial, uso, propiedad ni permiso de entrada.',
   confirm:'Confirmar ritmo de paños, acabado y remate; decisiones DEJAR ASÍ / CORREGIR / APORTO FOTO, pendiente por defecto.'
  },
  note:'MODELO / HIPÓTESIS H85-S-01, pendiente. Tres paños ciegos cerrados con antepecho sobre arista5 hacia Felipe Salido; zócalo tonal y remate plano en aristas5/6. Composición, proporciones y tonos de detalle propuestos, NO observados ni medidos. Se conserva fittedPlan ajustado con7 vértices y patio de4, sin techo/base sobre el vacío;6.2m sigue estimación. Acabado y cubierta neutros heredados; PBR mineral explícito. Sin publicidad, negocio, nombre de inmueble, interior ni acceso inventados. No constituye fachada fiel, fotorealismo, aprobación del propietario ni publicación.'
 }]
};

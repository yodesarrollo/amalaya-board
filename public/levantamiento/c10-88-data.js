// 88 / D2-02 / C10 · PRACTICO-2 · GENÉRICO ACEPTADO H88-S-01.
// Decisión del propietario (10-nov-2026): sin foto específica se levanta un
// genérico rotulado y se da por bueno; la foto del lugar queda para después.
// Arista ORIGINAL 2 de la huella efectiva: frente sur hacia Felipe Salido.
const frontLength=20.875;
export const C10_88={
 block:'C10',evidence:'D2-02/PRACTICO-2-H88-S-01',buildings:[{
  id:'D2-02',height:6.2,color:'#c1b7a5',roofColor:'#c1b7a5',uncertainty:3,
  surfaceMaterial:{metalness:0,roughness:.96},keepDetails:true,facadeOverlayOnly:true,
  sources:['world.js','sheet-plan-data.js','ajuste-visual-data.js'],
  facades:[{
   // Arista ORIGINAL 2: frente sur hacia Felipe Salido; no invertir índices.
   edge:2,plain:true,
   // Tres paños CIEGOS genéricos, mismo lenguaje que 86 en la misma calle.
   bays:[.2,.5,.8].map(t=>({
    x:frontLength*t,w:3.2,h:2.6,b:.70,rect:true,blind:true,
    noBars:true,open:false,recess:0,fillColor:'#a9a79c'
   })),
   // Retiradas 0.15 en cada extremo: sin puente hacia86 ni hacia la esquina.
   bands:[
    {x:frontLength/2,w:frontLength-.30,y:.24,h:.48,d:.04,color:'#aaa89d'},
    {x:frontLength/2,w:frontLength-.30,y:6.03,h:.18,d:.04,color:'#b5b3a7'}
   ]
  }],
  hypothesis:{
   id:'H88-S-01',status:'accepted',measured:false,photoreal:false,generic:true,
   decision:{
    by:'Alejandro Puebla (propietario)',date:'2026-11-10',
    text:'Si no hay foto específica del lugar, levantar un genérico y dar por buena la edificación; la foto queda para después. Objetivo: un mundo virtual terminado, no necesariamente perfecto.'
   },
   scope:'Sólo arista2 original, frente sur hacia Felipe Salido. Planta efectiva de cinco vértices, masa nativa, cubierta, altura y encuentros con86 conservados.',
   basis:'Genérico PRACTICO-2 sin fotografía de calle atribuible (ficha D2-02 del 30-oct). La implantación sale de la planta interpretada; los paños, el zócalo y el remate son un tratamiento genérico, no observado.',
   proposed:[
    'Tres paños tonales ciegos y cerrados, elevados sobre el suelo; ritmo genérico',
    'Zócalo tonal somero retirado de ambos extremos para no unir vecinos',
    'Remate horizontal fino dentro de la altura existente'
   ],
   inherited:'Altura6.2 PROVISIONAL no medida; masa y tono base/cubierta#c1b7a5 del MODELO vigente. La identidad «cuerpo blanco» de la ficha no se aplica sin foto.',
   access:'Sin puertas, huecos, pasos ni interiores: open:false y recess:0. No acredita uso, propiedad, domicilio ni acceso.',
   confirm:'Aceptado como genérico. Cuando exista foto del frente sur y de la esquina, se podrá corregir sin bloquear el mundo.'
  },
  note:'GENÉRICO ACEPTADO H88-S-01 (decisión del propietario, 10-nov-2026). Tres paños neutros cerrados, zócalo y remate someros en arista2 sur hacia Felipe Salido; sin nueva masa. Tratamiento genérico, NO observado ni medido; foto del lugar pendiente para después. Altura6.2 PROVISIONAL y base#c1b7a5 heredadas del MODELO. Conserva huella, cubierta, vecinos y colisiones. No es fachada fiel ni fotorealismo.'
 }]
};

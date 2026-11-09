// 87 / D2-01 / C10 · PRACTICO-2 · MODELO / HIPÓTESIS H87-M-01.
// Frente F-M: arista4 de la huella EFECTIVA corregida junto a la calle.
// No usar arista3 de la planta aérea bruta ni restaurar la invasión vial.
const frontLength=27.133578617683856;
export const C10_87={
 block:'C10',evidence:'D2-01/PRACTICO-2-H87-M-01',buildings:[{
  id:'D2-01',height:6.2,color:'#c1b7a5',roofColor:'#c1b7a5',uncertainty:3,
  surfaceMaterial:{metalness:0,roughness:.96},keepDetails:true,facadeOverlayOnly:true,
  sources:['world.js','sheet-plan-data.js','ajuste-visual-data.js'],
  facades:[{
   edge:4,plain:true,
   // Tres paños CIEGOS tonales de composición propuesta, no vanos observados.
   bays:[5.0,13.5,22.0].map(x=>({
    x,w:4.4,h:3.0,b:1.1,rect:true,blind:true,
    noBars:true,open:false,recess:0,fillColor:'#aaa99f'
   })),
   bands:[{x:frontLength/2,w:frontLength-.60,y:6.02,h:.16,d:.03,color:'#b5b3a8'}]
  }],
  hypothesis:{
   id:'H87-M-01',status:'pending',measured:false,photoreal:false,
   scope:'F-M: sólo lado largo oriental del MODELO, arista4 de fittedPlan ya corregida para no invadir calle. El resto de frentes, entrante, cubierta y altura nativos se conservan sin detalles nuevos. La orientación local no acredita un frente real fotografiado.',
   basis:'Aéreas existentes y planta interpretada sustentan implantación aproximada; no muestran acabado ni vanos atribuibles. Búsqueda pública acotada del5-nov sin foto de calle suficientemente atribuible. PRACTICO-2 autoriza propuesta reversible explícita, no una fachada observada.',
   proposed:[
    'Tres paños tonales anchos, ciegos, elevados y cerrados; ritmo de una nave larga propuesto, no observado',
    'Remate fino dentro de la altura existente, retirado de las dos esquinas; proporciones y tono estimados',
    'Otros frentes y entrante sin tratamiento nuevo: no extrapolar esta propuesta a ellos'
   ],
   inherited:'Masa, cubierta plana, tono base#c1b7a5 y altura6.2 del MODELO vigente, no acabado ni cotas de campo. Huella efectiva con seis vértices y ajuste vial previo intactos. No modelar cerchas interiores ni deducir gran claro estructural del nombre histórico.',
   access:'Sin puertas, huecos nuevos, paso ni interiores. open:false y recess:0; paños no acreditan ventanas, uso, comercio, propiedad, domicilio ni permiso de acceso.',
   confirm:'Confirmar composición, acabado y remate del frente F-M; los demás frentes no están fotografiados. DEJAR ASÍ / CORREGIR / APORTO FOTO; pendiente por defecto.'
  },
  note:'MODELO / HIPÓTESIS H87-M-01, pendiente. Tres paños tonales cerrados y remate en F-M, lado largo oriental del MODELO (arista4 efectiva). Composición y tonos propuestos, NO observados ni medidos. Cubierta, entrante y corrección vial existentes conservados; no restaurar contorno aéreo bruto. Otros frentes neutros. Altura6.2 PROVISIONAL y base#c1b7a5 heredadas del modelo, no cotas ni color real certificados. Sin estructura interior, comercio, publicidad o acceso inventados. No es fachada fiel, fotorealismo, decisión del propietario, revisión independiente ni publicación.'
 }]
};

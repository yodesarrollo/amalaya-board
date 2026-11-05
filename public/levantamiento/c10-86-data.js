// 86 / D1-11 / C10 · PRACTICO-2 · MODELO / HIPÓTESIS H86-S-01.
// Parámetros de diseño NO medidos. Cuatro cajas; conservar masa nativa.
const frontLength=9.56003483257253;
export const C10_86={
 block:'C10',evidence:'D1-11/PRACTICO-2-H86-S-01',buildings:[{
  id:'D1-11',height:6.2,color:'#c1b7a5',roofColor:'#c1b7a5',uncertainty:3,
  surfaceMaterial:{metalness:0,roughness:.96},keepDetails:true,facadeOverlayOnly:true,
  sources:['world.js','ajuste-visual-data.js'],
  facades:[{
   // Arista ORIGINAL 2: frente sur hacia Felipe Salido; no invertir índices.
   edge:2,plain:true,
   bays:[.32,.68].map(t=>({
    x:frontLength*t,w:2.15,h:2.6,b:.70,rect:true,blind:true,
    noBars:true,open:false,recess:0,fillColor:'#a9a79c'
   })),
   // Retiradas 0.15 en cada extremo del modelo: sin puente hacia85/88.
   bands:[
    {x:frontLength/2,w:frontLength-.30,y:.24,h:.48,d:.04,color:'#aaa89d'},
    {x:frontLength/2,w:frontLength-.30,y:6.03,h:.18,d:.04,color:'#b5b3a7'}
   ]
  }],
  hypothesis:{
   id:'H86-S-01',status:'pending',measured:false,photoreal:false,
   scope:'Sólo arista2 original, frente sur hacia Felipe Salido. Planta, masa nativa, altura y encuentros85/86/88 conservados.',
   basis:'HIPÓTESIS conservadora autorizada por PRACTICO-2. Preparación local preparacion/preparacion.json, byId[86], aporta orientación y anclas del MODELO, no fotografía atribuible del frente. world.js y ajuste-visual-data.js son fuentes del modelo; no pruebas de acabado real.',
   proposed:[
    'Dos paños tonales rectangulares ciegos, cerrados y elevados sobre el suelo, sin marcos ni ornamentos; ritmo y proporciones propuestos, no observados',
    'Zócalo tonal somero retirado de ambos extremos para no unir vecinos',
    'Remate horizontal fino dentro de la altura preexistente, también separado de las juntas'
   ],
   inherited:'Altura6.2 PROVISIONAL no medida; masa y tono base/cubierta#c1b7a5 observados en el MODELO vigente, no acreditados en el inmueble. No inferir rojo de un nombre histórico.',
   access:'Paños neutros, no puertas: open:false y recess:0. No huecos, pasos ni interiores nuevos; no acredita acceso real, uso, identidad, propiedad ni permiso de entrada.',
   confirm:'Confirmar color, ritmo de paños y remate con frente completo y ambas juntas. Opciones DEJAR ASÍ / CORREGIR / APORTO FOTO; pendiente por defecto.'
  },
  note:'MODELO / HIPÓTESIS H86-S-01, pendiente. Dos paños neutros cerrados, zócalo y remate someros en arista2 sur hacia Felipe Salido; cuatro cajas reversibles, sin nueva masa. Composición y tonos de detalle propuestos, NO observados ni medidos. Base#c1b7a5 heredada del MODELO, no color real certificado ni rojo deducido del nombre. Altura6.2 PROVISIONAL; conservar los cuatro vértices nativos, encuentros con85/88, patio85, todos los vecinos y colisiones. Sin nombres de inmuebles, publicidad, interior ni acceso inventados. No constituye fachada fiel, fotorealismo, aceptación del propietario, dictamen independiente ni publicación.'
 }]
};

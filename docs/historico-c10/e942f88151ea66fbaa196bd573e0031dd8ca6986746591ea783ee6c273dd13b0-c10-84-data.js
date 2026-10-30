// D1-09 · visual approximation; the source footprint is preserved.
const p=[[-102.483,108.307],[-89.969,110.388],[-88.666,113.768],[-90.23,134.051],[-98.573,136.131],[-99.355,138.732],[-112.39,136.912],[-113.694,132.231],[-105.351,131.711]];
const t=(131.711-p[2][1])/(p[3][1]-p[2][1]);
const q=[p[2][0]+(p[3][0]-p[2][0])*t,131.711];
export const C10_84={block:'C10',evidence:'D1-09/20261030-equipo',buildings:[{
 id:'D1-09',height:6.2,color:'#d4d2c7',roofColor:'#e3e4dc',uncertainty:3,keepDetails:true,facades:[],
 // Neutral mineral surface: do not inherit a metallic viewer template.
 surfaceMaterial:{metalness:0,roughness:.96},
 sources:['ajuste-visual/C10.jpg','evidence/D1-09/20261006-01-cierre.json'],
 sections:[
  {part:'84-nave',points:[p[0],p[1],p[2],q,p[8]],height:6.2,color:'#d4d2c7',roofColor:'#e3e4dc',facades:[]},
  {part:'84-anexo-sur',points:[p[8],q,p[3],p[4],p[5],p[6],p[7]],height:3.5,color:'#c8c6ba',roofColor:'#c5c5ba',facades:[]}
 ],
 note:'Nave y anexo sur aproximados a partir de huella histórica y aérea de fecha desconocida; límite interior y alturas 6.2/3.5 m estimados sin medición. Patio exterior preservado. Fachadas y cubierta oculta no identificadas: sin vanos añadidos. No certifica predio ni estado actual.'
}]};

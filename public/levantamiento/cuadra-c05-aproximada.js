// C05: visual massing from the local aerial reference. Heights are approximate.
// Facades face away from the available image and remain intentionally plain.
const a=[-191.386,86.261],b=[-171.051,82.62],c=[-168.965,95.362],d=[-162.186,94.062],e=[-158.536,113.305],f=[-185.911,119.806];
const north=[-181.2185,84.4405],south=[-172.2235,116.5555];
export const C05_APROXIMADA={block:'C05',evidence:'C05-inventario-y-ajuste-visual',buildings:[
 {id:'C1-04',points:[[-172.093,59.477],[-154.104,56.356],[-151.236,81.58],[-168.704,84.701]],height:5.3,color:'#d3d0c5',uncertainty:3,sources:['C05-inventario.jpg','C05.jpg'],facades:[],note:'Cubierta oriental rectangular, más clara que el patio contiguo; altura interpretada, no medida.'},
 {id:'C1-05',points:[[-197.643,63.637],[-188.258,62.597],[-184.608,81.06],[-192.95,83.92]],height:4.2,color:'#beb9ab',uncertainty:3,sources:['C05-inventario.jpg','C05.jpg'],facades:[],note:'Cuerpo occidental estrecho, aislado de la cubierta oriental en la vista aérea; altura aproximada.'},
 {id:'C1-06',points:[a,b,c,d,e,f],height:6.0,color:'#c9c8c0',uncertainty:3,sources:['C05-inventario.jpg','C05.jpg'],facades:[],sections:[
  {part:'cubierta-sur-poniente',points:[a,north,south,f],height:6.0,color:'#d5d3ca',facades:[]},
  {part:'cubierta-sur-oriente',points:[north,b,c,d,e,south],height:5.4,color:'#b7b8b2',facades:[]}
 ],note:'Gran cubierta del sur interpretada en dos paños; separación y alturas estimadas a partir de imagen aérea, sin mediciones.'},
 {id:'C1-07',points:[[-168.183,85.221],[-151.497,83.66],[-147.847,110.705],[-157.493,113.565],[-161.143,93.282],[-168.183,94.582]],height:5.0,color:'#aaa9a1',uncertainty:3,sources:['C05-inventario.jpg','C05.jpg'],facades:[],note:'Nave oriental adyacente a la cubierta sur; contorno ya existente, altura visual aproximada.'}
]};

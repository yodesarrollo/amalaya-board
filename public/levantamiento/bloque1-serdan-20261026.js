// Reconstrucciones visuales sobre huellas existentes. Las fotografías son
// panoramas públicos ya incluidos en el proyecto; las alturas y vanos no son
// mediciones ni deslindes. La identidad comercial es una referencia del frente.
export const BLOQUE1_SERDAN = [{block:'C25',evidence:'recorrido-Serdan-R000-y-Garmendia-R003',buildings:[
 {id:'SER-HSBC',ownerPrefix:'Huella OSM 499759728',height:8.0,color:'#e4e0d5',uncertainty:2.5,
  points:[[47.74348,-149.5189],[80.13052,-157.518395],[85.9042,-132.243985],[56.08324,-127.43985],[51.27184,-130.646305]],
  sources:['recorrido/Kuwk3mZuIWZ2RDonhuaV9A.jpg','recorrido/jq7F20HIPyBLBgfSjH6baQ.jpg'],
  facades:[{edge:2,plain:true,bays:[{x:4.5,w:5,h:3.3,b:0,rect:true,noBars:true,fillColor:'#57615c'},{x:12,w:6.5,h:3.3,b:0,rect:true,noBars:true,fillColor:'#68716c'},{x:20,w:6.5,h:3.3,b:0,rect:true,noBars:true,fillColor:'#68716c'},{x:27,w:4.5,h:3.3,b:0,rect:true,noBars:true,fillColor:'#57615c'}],bands:[{y:4.0,h:.34,d:.36,color:'#d1c9b7'},{y:7.68,h:.25,d:.35,color:'#f0ede4'}]}],
  note:'Frente blanco de Fantasías Miguel en panoramas de Serdán y Garmendia; correspondencia de la huella aproximada. La antigua etiqueta HSBC se conserva como ID técnico.'},
 {id:'A3-01',height:8.2,color:'#eeece5',uncertainty:2.5,
  sources:['recorrido/hLX5pkq4RdjBOs5Vqpw-Fw.jpg','recorrido/dhZr59FbZyCQKcSB4CJb5w.jpg'],
  facades:[{edge:3,plain:true,bays:[7,16,25,34,43,51].map(x=>({x,w:7,h:3.1,b:.15,rect:true,noBars:true,fillColor:'#4d5f5e'})),bands:[{y:4.35,h:.28,d:.3,color:'#ded7cc'},{y:7.9,h:.32,d:.33,color:'#f5f2e9'}],canopy:{y:3.65,depth:1.0,color:'#a6504d'}}],
  note:'Gran frente blanco con escaparates y marquesina rojiza observado en Woolworth. Huella y medidas aproximadas.'}
]},{block:'C31',evidence:'recorrido-Garmendia-R003',buildings:[
 {id:'SER-BLEY',height:8.1,color:'#d5d0bf',uncertainty:2.5,
  sources:['recorrido/jq7F20HIPyBLBgfSjH6baQ.jpg','recorrido/2MNg6Xk9_yV3lqEALqRg4Q.jpg'],
  facades:[{edge:3,plain:true,bays:[4.0,10.0,16.0].flatMap(x=>[{x,w:1.55,h:2.55,b:.22,rect:true,frameColor:'#c2ae83'},{x,w:1.55,h:1.8,b:5.0,rect:true,frameColor:'#c2ae83'}]),bands:[{y:3.9,h:.24,d:.22,color:'#bfa780'},{y:7.8,h:.2,d:.3,color:'#d8c6a4'}]},
   {edge:4,plain:true,bays:[4.0,10.0,16.0].flatMap(x=>[{x,w:1.55,h:2.55,b:.22,rect:true,frameColor:'#c2ae83'},{x,w:1.55,h:1.8,b:5.0,rect:true,frameColor:'#c2ae83'}]),bands:[{y:3.9,h:.24,d:.22,color:'#bfa780'},{y:7.8,h:.2,d:.3,color:'#d8c6a4'}]}],
  note:'Esquina de dos niveles con molduras y rejas observada en Serdán y Garmendia; asociación con el edificio Bley aproximada, sin certificación predial.'}
]},{block:'C24',evidence:'recorrido-Serdan-R000',buildings:[
 {id:'CH-GA-OXXO',ownerPrefix:'Huella OSM 499760720',height:5.5,color:'#e6dfd0',uncertainty:2.5,
  points:[[53.57592,-105.343545],[56.12256,-109.79264],[67.35888,-112.111495],[74.13372,-76.5964],[59.51484,-73.00162]],
  sources:['recorrido/Kuwk3mZuIWZ2RDonhuaV9A.jpg'],
  facades:[{edge:1,plain:true,bays:[{x:2.8,w:3.7,h:2.85,b:.1,rect:true,noBars:true,fillColor:'#51615e'},{x:7.9,w:3.8,h:2.85,b:.1,rect:true,noBars:true,fillColor:'#576661'}],bands:[{y:3.35,h:.38,d:.24,color:'#bd4637'},{y:5.25,h:.24,d:.22,color:'#ded6c5'}]}],
  note:'Frente comercial fotografiado en Serdán; la ubicación OXXO se contrasta con coordenadas publicadas en 2021. Domicilio y ocupación actuales requieren cotejo.'}
]}];

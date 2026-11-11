// 48 / B3-03 / C23 · cuadra 12 · ARCADA DEL ESTACIONAMIENTO MODELADA CON FOTO DE CALLE (11-nov-2026).
// Criterio del propietario (10-nov-2026): «más que genérico, una versión aceptable a la realidad
// según las fotos». Fotos: panorámicas del recorrido R-001 P11 (MtTpU1NWETczZgzdClblwg) y P12
// (5FAUCdPN0bi6PQuYj_IQOA) sobre Calle Obregón, rectificadas sobre el plano de la fachada (cámara
// a 2.45 m); aérea Esri z19 (calco/referencia.webp, ajuste-visual/C23.jpg).
//
// Antes, B3-03 salía del frente 'estacionamiento-frente' de paramento-data.js (que no se edita):
// una caja techada de 5.8 m con seis vanos abiertos. Las fotos muestran otra cosa: el frente norte
// de Obregón es una arcada-barda de un estacionamiento descubierto, sin techo detrás de los arcos
// (se ve el cielo por los abanicos), y la franja clara de la aérea detrás de ella es una cubierta
// ligera sobre los autos. El paquete toma ese frente como dueño (Planta física · B3-03), lo retira
// y lo reconstruye aquí por secciones: barda de block, portal alto, tramo de tres arcos con
// entablamento, tramo oriente con puerta en arco y ventanal, y la cubierta del estacionamiento.
//
// Visto en la foto: aplanado crema con pilastras, impostas y zoclo ocres; portal rectangular con
// reja de barrotes y ático escalonado; tres arcos de medio punto sobre columnas con reja y abanico;
// en el tramo oriente una puerta en arco y un ventanal en arco con antepecho bajo; al poniente del
// portal, una barda de block partido con marco de ladrillo; detrás, autos bajo una cubierta de
// lámina sobre postes. Estimado: posiciones a ±0.6 m (dos cámaras con poses aproximadas), alturas
// por el ángulo de la base y del remate (±8 %), anchos de vano, colores a media luz y fondo de la
// cubierta (franja clara de la aérea, ±1 m). Los vanos en arco son abiertos: se ve el patio a
// través de la reja; la cara posterior repite los vanos sin reja. El ventanal mide 2.56 m para que
// un barrote quede en su eje (retícula de barrotes de 0.23 m del constructor).
// No modelado: el último arco grande y la puerta en arco junto a la esquina de EB-SE quedan dentro
// del volumen de EB-SE (frente de octubre con su firma de colisiones congelada; ver c23-50).
const crema='#e9dccd',ocre='#c4904f',remate='#d6c3a6',block='#b3a38f',ladrillo='#b9805f';
const zoclo={y:.3,h:.6,d:.05,color:ocre};
const pilastra=(x,h=4.9,w=.6)=>({x,b:0,h,w,d:.12,color:ocre});
// Arco abierto de reja (puerta: lleva el encuentro de hojas al centro) y su espejo posterior sin reja.
const arco=(x,w,h,b=0,door=true)=>({x,w,h,b,open:true,door,archFrameColor:ocre});
const espejo=(L,v)=>({...v,x:+(L-v.x).toFixed(3),noBars:true});
const seccion=(part,points,height,facades,o={})=>({part,points,height,color:o.color??crema,roofColor:o.roofColor??remate,facades,...o.extra});
// Largo de cada tramo sobre la arista frontal (para reflejar los vanos en la cara posterior).
const L={barda:3.709,portal:5.012,arcos:10.024,oriente:8.972};
const portalFrente=[{x:2.707,w:2.4,h:4.4,b:0,open:true,rect:true,door:true,noCrossBars:true,frameColor:ocre,frameWidth:.12}];
const arcosFrente=[arco(1.504,2.4,4.9),arco(5.012,2.4,4.9),arco(8.521,2.4,4.9)];
const orienteFrente=[arco(1.203,1.6,3.6),arco(6.315,2.56,4.3,.25,false)];
export const C23_48={block:'C23',evidence:'C23/20261111-modelado',buildings:[{
 id:'B3-03',height:5.5,color:crema,roofColor:remate,uncertainty:.8,
 surfaceMaterial:{metalness:0,roughness:.95},liteLod:true,normalizeSections:true,facades:[],
 sources:['recorrido/MtTpU1NWETczZgzdClblwg.jpg','recorrido/5FAUCdPN0bi6PQuYj_IQOA.jpg','calco/referencia.webp','ajuste-visual/C23.jpg','evidence/B3-03/20261006-01-cierre.json','evidence/C23/20261111-modelado/ficha.json'],
 // Aristas en el orden de cada sección tal como está escrita (normalizeSections): 0 frente a
 // Obregón (de poniente a oriente), 1 oriente, 2 cara posterior al estacionamiento, 3 poniente.
 sections:[
  seccion('48-barda-block',[[123.7,2.715],[127.4,2.458],[127.365,1.959],[123.665,2.216]],3.4,
   [{edge:0,plain:true,bays:[],bands:[{y:.2,h:.4,d:.05,color:ladrillo},{y:2.55,h:.3,d:.06,color:ladrillo},{y:3.3,h:.16,d:.08,color:block}],fins:[{x:.3,b:0,h:2.7,w:.3,d:.06,color:ladrillo},{x:3.41,b:0,h:2.7,w:.3,d:.06,color:ladrillo}]}],
   {color:block,roofColor:block}),
  seccion('48-portal',[[127.4,2.458],[132.4,2.11],[132.365,1.611],[127.365,1.959]],8.2,
   [{edge:0,plain:true,bays:portalFrente,bands:[zoclo,{y:4.75,h:.2,d:.18,color:ocre},{y:5.35,h:.24,d:.26,color:ocre},{y:6.65,h:.2,d:.22,color:ocre},{y:7.95,h:.22,d:.26,color:ocre}],fins:[pilastra(.75,4.9,.8),pilastra(4.4,4.9,.8)]},
    {edge:2,plain:true,bays:portalFrente.map(v=>espejo(L.portal,v))}]),
  seccion('48-arcos',[[132.4,2.11],[142.4,1.414],[142.365,.915],[132.365,1.611]],7.2,
   [{edge:0,plain:true,bays:arcosFrente,bands:[zoclo,{y:5.35,h:.24,d:.26,color:ocre},{y:6.25,h:.16,d:.18,color:ocre},{y:7.0,h:.22,d:.26,color:ocre}],fins:[pilastra(9.85,5.2,.3)]},
    {edge:2,plain:true,bays:arcosFrente.map(v=>espejo(L.arcos,v))}]),
  seccion('48-oriente',[[142.4,1.414],[151.35,.791],[151.315,.292],[142.365,.915]],5.5,
   [{edge:0,plain:true,bays:orienteFrente,bands:[zoclo,{y:5.25,h:.24,d:.26,color:ocre}],fins:[pilastra(.25,5.0,.4),pilastra(3.75,5.0,.5),pilastra(8.7,5.0,.4)]},
    {edge:2,plain:true,bays:orienteFrente.map(v=>espejo(L.oriente,v))}]),
  // Cubierta ligera sobre los autos: postes y lámina, sin muros (franja clara de la aérea).
  seccion('48-cubierta-estacionamiento',[[132.433,-.298],[149.233,-1.467],[148.984,-5.059],[132.184,-3.89]],2.9,[],
   {color:'#8d9491',roofColor:'#c4c7c2',extra:{openCanopy:true}})
 ],
 fabrica:{fecha:'2026-11-11',tipologia:'observada en foto de calle',fotoCalle:true,secciones:5},
 hypothesis:{id:'H48-01',status:'modelado con foto de calle por secciones: arcada-barda y cubierta del estacionamiento',measured:false,photoreal:false,generic:false,
  observed:'Frente norte de Obregón: arcada-barda crema con pilastras, impostas y zoclo ocres de un estacionamiento descubierto (cielo visible por los abanicos de los arcos); portal rectangular con reja y ático escalonado; tres arcos de medio punto sobre columnas con reja y abanico bajo un entablamento más alto; tramo oriente con puerta en arco y ventanal en arco de antepecho bajo; barda de block partido con marco de ladrillo al poniente del portal; autos bajo una cubierta de lámina sobre postes (franja clara en la aérea).',
  estimated:'Posiciones de vanos y pilastras a ±0.6 m (rectificación de P11 y P12 con poses aproximadas); alturas 3.4/8.2/7.2/5.5 m por los ángulos de base y remate con cámara a 2.45 m (±8 %); cubierta a 2.9 m y su fondo según la aérea (±1 m); anchos de vano, abanicos como reja de barrotes, colores a media luz.',
  unchanged:'Planta de inventario de B3-03 (evidence/B3-03) como registro; paramento-data.js sin editar (el paquete toma el frente estacionamiento-frente como dueño y lo reconstruye); vecinos B3-02, EB-SE y EB-NE sin tocar por este paquete.',
  decision:{by:'Alejandro Puebla (propietario)',date:'2026-11-10',text:'Más que genérico, una versión aceptable a la realidad según lo que muestren las fotos.'}},
 note:'48/B3-03: arcada-barda del estacionamiento sobre Obregón con portal, tres arcos y ventanal, más la cubierta ligera de los autos; modelada con las fotos de calle P11 y P12.'}]};

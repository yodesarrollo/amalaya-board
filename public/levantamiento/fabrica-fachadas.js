// Fábrica de fachadas · Amalaya 3D (10-nov-2026).
// Modela frentes con aberturas reales (vanos perforados, rejas, marcos y remates)
// cuando la evidencia es aérea y no hay foto de calle. Las tipologías reproducen
// proporciones habituales de la zona; NO son medidas ni describen una fachada
// observada. Cada edificio que las usa declara qué vio la aérea y qué se estimó.

export const PALETA={
 hierro:'#262626',vidrio:'#2d3336',madera:'#5d4630',metal:'#4d5354',
 marco:'#ebe5d6',zoclo:'#a59a86',cortina:'#8f9696'
};

// Proporciones tipológicas (metros). `modulo` es el ancho objetivo por vano.
export const TIPOLOGIAS={
 // Casa de un nivel del centro: puerta y ventanas altas con reja frontal.
 casa:{modulo:2.9,margen:.7,puerta:{w:1.0,h:2.35},ventana:{w:1.15,h:1.6,b:.95}},
 // Comercio de barrio: cortina metálica por módulo y puerta de servicio.
 comercio:{modulo:4.0,margen:.6,cortina:{w:2.8,h:2.6},puerta:{w:.95,h:2.3}},
 // Barda o muro ciego con un solo acceso.
 muro:{margen:.8,porton:{w:2.6,h:2.3}}
};

const r3=v=>+v.toFixed(3);

// Reparte n centros a lo largo de L dejando `margen` en los extremos.
export function modulos(L,modulo,margen){
 const util=Math.max(0,L-2*margen),n=Math.max(1,Math.round(util/modulo)),w=util/n;
 return Array.from({length:n},(_,i)=>r3(margen+(i+.5)*w));
}

// Remate superior y zoclo: bandas delgadas que no tapan vanos (clipBands).
export function bandas(altura,{remate=true,zoclo=true,colorRemate=PALETA.marco,colorZoclo=PALETA.zoclo}={}){
 return [...(remate?[{y:r3(altura-.12),h:.22,d:.18,color:colorRemate}]:[]),...(zoclo?[{y:.27,h:.5,d:.035,color:colorZoclo}]:[])];
}

// Casas de techo alto (≥4.5 m) llevan vanos más altos; las bajas, vanos que
// siempre dejan libre el remate superior.
const ventana=(x,altura,v,o)=>{const alta=altura>=4.5,h=alta?Math.min(2.0,altura-2.75):Math.min(v.h,altura-1.55),b=alta?.85:v.b;
 return {x,w:v.w,h:r3(Math.max(.9,h)),b,rect:true,frontBars:true,barColor:o.hierro||PALETA.hierro,frameColor:o.marco||PALETA.marco,frameWidth:.08,fillColor:o.vidrio||PALETA.vidrio};};
const puerta=(x,altura,v,o)=>({x,w:v.w,h:r3(Math.min(v.h+(altura>=4.5?.35:0),altura-.55)),b:.06,rect:true,noBars:true,wood:!o.puertaMetal,fillColor:o.puertaMetal?PALETA.metal:(o.madera||PALETA.madera),frameColor:o.marco||PALETA.marco,frameWidth:.08});

// Frente de casa. `puertas`: índices de módulo o 'centro'|'inicio'|'fin' (por defecto el central).
export function frenteCasa(L,altura,opciones={}){
 const t=TIPOLOGIAS.casa,xs=modulos(L,opciones.modulo||t.modulo,opciones.margen??t.margen),n=xs.length;
 const pick=p=>p==='inicio'?0:p==='fin'?n-1:p==='centro'?Math.floor((n-1)/2):Math.max(0,Math.min(n-1,p));
 const doors=new Set((opciones.puertas??['centro']).map(pick));
 if(opciones.sinPuerta)doors.clear();
 return {bays:xs.map((x,i)=>doors.has(i)?puerta(x,altura,t.puerta,opciones):ventana(x,altura,t.ventana,opciones)),bands:bandas(altura,opciones)};
}

export function frenteComercio(L,altura,opciones={}){
 const t=TIPOLOGIAS.comercio,xs=modulos(L,opciones.modulo||t.modulo,opciones.margen??t.margen);
 const w=Math.min(t.cortina.w,(L-2*t.margen)/xs.length-.5);
 return {bays:xs.map(x=>({x,w:r3(w),h:r3(Math.min(t.cortina.h,altura-1.3)),b:.06,rect:true,noBars:true,shutter:true,fillColor:PALETA.cortina,frameColor:opciones.marco||PALETA.marco,frameWidth:.08})),bands:bandas(altura,opciones)};
}

export function frenteMuro(L,altura,opciones={}){
 const t=TIPOLOGIAS.muro,x=r3(opciones.acceso??L/2);
 return {bays:L>=t.porton.w+2*t.margen?[{x,w:t.porton.w,h:r3(Math.min(t.porton.h,altura-.6)),b:.06,rect:true,noBars:true,fillColor:PALETA.metal,frameColor:opciones.marco||PALETA.marco,frameWidth:.08}]:[],bands:bandas(altura,{...opciones,zoclo:false})};
}

const TIPO={casa:frenteCasa,comercio:frenteComercio,muro:frenteMuro};

// Fachada lista para CUADRA_DETAILS a partir de la longitud real de la arista.
export function fachada(points,edge,altura,tipo='casa',opciones={}){
 const a=points[edge],b=points[(edge+1)%points.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
 if(!TIPO[tipo])throw Error('Tipología desconocida '+tipo);
 const {bays,bands}=TIPO[tipo](L,altura,opciones);
 return {edge,plain:true,bays,bands,fabrica:{tipo,longitud:r3(L)}};
}

// Varias fachadas de una misma planta: [{edge,tipo,...opciones}].
export function fachadas(points,altura,defs){return defs.map(({edge,tipo='casa',...o})=>fachada(points,edge,altura,tipo,o));}

// Equipos de azotea visibles en la aérea (posición observada; medidas típicas).
export const tinaco=(x,z)=>({x,z,w:1.05,h:1.25,d:1.05,color:'#2b2c2c'});
export const ventila=(x,z,w=.9,d=.5)=>({x,z,w,h:.35,d,color:'#8d8c84'});
export const calentador=(x,z)=>({x,z,w:1.9,h:.9,d:1.1,color:'#4f5a63'});

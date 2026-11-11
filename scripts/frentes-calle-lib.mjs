// Street frontage detection for the facade factory. A building edge faces the
// street when it runs close and nearly parallel to the inner edge of its block's
// sidewalk (ajuste-visual surfaces, kind "sidewalk"), and its outward normal points
// to that edge. Pure geometry in local metres; no measurement claim.
export const FRENTE={distancia:2.6,angulo:25,minimo:1.2};

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const len=v=>Math.hypot(v[0],v[1]);
export const signedArea=pts=>pts.reduce((s,a,i)=>{const b=pts[(i+1)%pts.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;

function nearestOnSegment(p,a,b){const ab=sub(b,a),t=Math.max(0,Math.min(1,((p[0]-a[0])*ab[0]+(p[1]-a[1])*ab[1])/((ab[0]**2+ab[1]**2)||1)));return {q:[a[0]+ab[0]*t,a[1]+ab[1]*t],dir:ab};}
function nearestOnRings(p,rings){let best=null;for(const r of rings)for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],{q,dir}=nearestOnSegment(p,a,b),d=len(sub(p,q));if(!best||d<best.d)best={d,q,dir};}return best;}

// Returns one entry per edge of `points`: length, mean distance to the frontage
// rings, angle (degrees) to the nearest frontage segment, and the street verdict.
export function frentesDeCalle(points,rings,opts=FRENTE){
 const n=points.length,ccw=signedArea(points)>0;
 return points.map((a,edge)=>{
  const b=points[(edge+1)%n],v=sub(b,a),L=len(v);
  // outward normal: right of travel for CCW (x right, z down => screen), use area sign
  const out=ccw?[v[1]/L,-v[0]/L]:[-v[1]/L,v[0]/L];
  const samples=[.15,.35,.5,.65,.85].map(t=>[a[0]+v[0]*t,a[1]+v[1]*t]);
  let dist=0,ang=0,facing=0;
  for(const p of samples){const h=nearestOnRings(p,rings);dist+=h.d/samples.length;
   const c=Math.abs((v[0]*h.dir[0]+v[1]*h.dir[1])/(L*(len(h.dir)||1)));ang+=Math.acos(Math.min(1,c))*180/Math.PI/samples.length;
   const to=sub(h.q,p);facing+=(len(to)<1e-6?1:(to[0]*out[0]+to[1]*out[1])/len(to))/samples.length;}
  const calle=L>=opts.minimo&&dist<=opts.distancia&&ang<=opts.angulo&&facing>-.2;
  return {edge,length:+L.toFixed(2),distance:+dist.toFixed(2),angle:+ang.toFixed(1),facing:+facing.toFixed(2),calle};
 });
}

// Inner rings of a block's sidewalk surface = the frontage line seen from the lots.
export function lineaDeFachada(ajusteVisual,block){
 const s=ajusteVisual.surfaces.find(s=>s.id===block&&s.kind==='sidewalk');
 if(!s)throw Error('Sin banqueta para '+block);
 return s.polygons.flatMap(p=>p.holes||[]);
}

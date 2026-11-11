// Shared by generar-vista-ligera.mjs and pruebas-lod-ligero.mjs: the phone
// overview LOD of a paramento wall (wall() with liteLod) is its outer face plus
// one flat panel per opening. Panels sit 6 cm proud of the face so the 5 cm
// quantization of the overview can never place them behind the wall.
export const LOD_OFFSET=.06;

// Outline of an opening in wall-local metres (x along the wall, y up).
export function lodOutline(v){
 const lo=v.b+(v.infill||0),r=v.w/2,top=v.b+v.h;
 if(v.rect)return [[v.x-r,lo],[v.x+r,lo],[v.x+r,top],[v.x-r,top]];
 const spring=Math.max(lo,top-r);
 return [[v.x-r,lo],[v.x+r,lo],[v.x+r,spring],...Array.from({length:7},(_,k)=>{const t=Math.PI*(k+1)/8;return [v.x+r*Math.cos(t),top-r+r*Math.sin(t)];}),[v.x-r,spring]];
}

// Triangles of one LOD wall in world coordinates: [{vs:[V,V,V],color,part}].
// `matrix` is the wall group's column-major world matrix captured by compact().
export function lodTriangles(w,Vector3){
 const e=w.matrix,at=(x,y,z)=>new Vector3(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]);
 const out=[],fan=(pts,color,part)=>{for(let i=1;i<pts.length-1;i++)out.push({vs:[pts[0],pts[i],pts[i+1]],color,part});};
 fan([at(0,0,0),at(w.length,0,0),at(w.length,w.height,0),at(0,w.height,0)],w.color,'muro');
 for(const v of w.bays)fan(lodOutline(v).map(([x,y])=>at(x,y,LOD_OFFSET)),v.color,'vano');
 return out;
}

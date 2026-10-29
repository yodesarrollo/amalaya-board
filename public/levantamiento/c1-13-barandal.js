// C1-13 / 82: the visible south rooftop railing, December 2023.
// Geometry is an approximation tied to the original footprint, not surveyed dimensions.
// Invoke before compacting the owner, with its original fitted plan and native block helper.
export function addC113SouthRail(parent, points, height, block) {
 if (!Array.isArray(points) || points.length !== 4 || !Number.isFinite(height)) throw Error('C1-13: invalid railing anchor');
 const [a,b] = [points[2],points[3]], dx=b[0]-a[0], dz=b[1]-a[1], length=Math.hypot(dx,dz);
 if (length <= 1.7) throw Error('C1-13: south edge too short');
 // Corner 2 is visually rounded over an estimated 1.4 m; stay on its straight tangent.
 // A small inward offset anchors the bars to the cornice instead of projecting into the street.
 const center=points.reduce((v,p)=>[v[0]+p[0]/4,v[1]+p[1]/4],[0,0]);
 const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2], nx=center[0]-mid[0], nz=center[1]-mid[1], nl=Math.hypot(nx,nz);
 const start=1.4, end=length-.15, ux=dx/length, uz=dz/length;
 const at=t=>{const x=a[0]+ux*t,z=a[1]+uz*t,vx=center[0]-x,vz=center[1]-z,n=Math.hypot(vx,vz);return [x+vx/n*.12,z+vz/n*.12]};
 const color='#e6ece7', base=height+.05, top=base+1.12, first=at(start), last=at(end);
 for(const y of [base+.12,top-.08]) {
  const m=block(parent,(first[0]+last[0])/2,y,(first[1]+last[1])/2,end-start,.045,.045,color,'Paramento · cubierta barandal riel');
  m.rotation.y=Math.atan2(-dz,dx);
 }
 // Continue around the same quadratic corner used by roundedFront: tangent on
 // edge 1 to tangent on edge 2. Inset each sample toward the plan center.
 const prev=points[1], pdx=a[0]-prev[0], pdz=a[1]-prev[1], plen=Math.hypot(pdx,pdz);
 if(plen<=1.4 || !nl) throw Error('C1-13: invalid corner anchor');
 const cornerStart=[a[0]-pdx/plen*1.4,a[1]-pdz/plen*1.4], cornerEnd=[a[0]+ux*1.4,a[1]+uz*1.4];
 const corner=t=>{const x=(1-t)**2*cornerStart[0]+2*t*(1-t)*a[0]+t*t*cornerEnd[0],z=(1-t)**2*cornerStart[1]+2*t*(1-t)*a[1]+t*t*cornerEnd[1];
  const vx=center[0]-x,vz=center[1]-z,n=Math.hypot(vx,vz);return [x+vx/n*.12,z+vz/n*.12];};
 const steps=8;
 for(let i=0;i<steps;i++) {const u=corner(i/steps),v=corner((i+1)/steps),x=v[0]-u[0],z=v[1]-u[1];
  for(const y of [base+.12,top-.08]) {const m=block(parent,(u[0]+v[0])/2,y,(u[1]+v[1])/2,Math.hypot(x,z),.045,.045,color,'Paramento · cubierta barandal riel curvo');m.rotation.y=Math.atan2(-z,x);}
  const [x0,z0]=u;block(parent,x0,(base+top)/2,z0,.035,top-base,.035,color,'Paramento · cubierta barandal barrote curvo');
 }
 const intervals=Math.ceil((end-start)/.23);
 for(let i=0;i<=intervals;i++) {
  const [x,z]=at(start+(end-start)*i/intervals);
  block(parent,x,(base+top)/2,z,.035,top-base,.035,color,'Paramento · cubierta barandal barrotes');
 }
 return {edge:2, start, end, base, top, intervals, status:'visual estimate; unmeasured'};
}

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
 const at=t=>[a[0]+ux*t+nx/nl*.12,a[1]+uz*t+nz/nl*.12];
 const color='#e6ece7', base=height+.05, top=base+1.12, first=at(start), last=at(end);
 for(const y of [base+.12,top-.08]) {
  const m=block(parent,(first[0]+last[0])/2,y,(first[1]+last[1])/2,end-start,.045,.045,color,'Paramento · cubierta barandal riel');
  m.rotation.y=Math.atan2(-dz,dx);
 }
 const intervals=Math.ceil((end-start)/.23);
 for(let i=0;i<=intervals;i++) {
  const [x,z]=at(start+(end-start)*i/intervals);
  block(parent,x,(base+top)/2,z,.035,top-base,.035,color,'Paramento · cubierta barandal barrotes');
 }
 return {edge:2, start, end, base, top, intervals, status:'visual estimate; unmeasured'};
}

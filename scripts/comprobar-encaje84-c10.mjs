// Requires a named scene exported from the same world, retaining mesh name as triangle[10].
import {readFileSync} from 'node:fs';
const scene=JSON.parse(readFileSync(process.argv[2]));
const p=[[-102.483,108.307],[-89.969,110.388],[-88.666,113.768],[-90.23,134.051],[-98.573,136.131],[-99.355,138.732],[-112.39,136.912],[-113.694,132.231],[-105.351,131.711]];
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function ptseg(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)}
function segdist(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),u=cross(c,d,a),v=cross(c,d,b);if(x*y<=0&&u*v<=0 && Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0])) && Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1])))return 0;return Math.min(ptseg(a,c,d),ptseg(b,c,d),ptseg(c,a,b),ptseg(d,a,b))}
const out={};for(const t of scene.triangles){const name=t[10];if(!name?.startsWith('Ajuste visual · road')&&!name?.startsWith('Ajuste visual · sidewalk'))continue;const q=[[t[0],t[2]],[t[3],t[5]],[t[6],t[8]]];for(let i=0;i<p.length;i++)for(let j=0;j<3;j++){const signs=[cross(q[0],q[1],p[i]),cross(q[1],q[2],p[i]),cross(q[2],q[0],p[i])];const inside=Math.abs(cross(q[0],q[1],q[2]))>1e-9&&(signs.every(n=>n>=-1e-9)||signs.every(n=>n<=1e-9));const d=inside?0:segdist(p[i],p[(i+1)%p.length],q[j],q[(j+1)%3]);if(!out[name]||d<out[name].distance)out[name]={distance:d,edge:i};}}
console.log(JSON.stringify(out,null,2));

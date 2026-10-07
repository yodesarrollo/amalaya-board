// Orthographic depth rendering without WebGL. Larger depth is nearer the camera.
// A shared pixel grid also prevents hairline cracks between adjacent triangles.
export function createDepthFrame(width,height){
  return {width,height,pixels:new Uint8ClampedArray(width*height*4),depth:new Float32Array(width*height)};
}
export function drawDepthFrame(frame,triangles,project){
  const {width,height,pixels,depth}=frame;
  pixels.fill(0);depth.fill(-Infinity);
  for(const t of triangles){
    const a=project(t[0]);let b=project(t[1]),c=project(t[2]);
    if(![...a,...b,...c].every(Number.isFinite))continue;
    let area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    if(Math.abs(area)<1e-8)continue;
    if(area<0){[b,c]=[c,b];area=-area;}
    const x0=Math.max(0,Math.ceil(Math.min(a[0],b[0],c[0])-.5)),x1=Math.min(width-1,Math.floor(Math.max(a[0],b[0],c[0])-.5));
    const y0=Math.max(0,Math.ceil(Math.min(a[1],b[1],c[1])-.5)),y1=Math.min(height-1,Math.floor(Math.max(a[1],b[1],c[1])-.5));
    if(x1<x0||y1<y0)continue;
    const ax=b[1]-c[1],ay=c[0]-b[0],bx=c[1]-a[1],by=a[0]-c[0],cx=a[1]-b[1],cy=b[0]-a[0];
    let e0=(c[0]-b[0])*(y0+.5-b[1])-(c[1]-b[1])*(x0+.5-b[0]);
    let e1=(a[0]-c[0])*(y0+.5-c[1])-(a[1]-c[1])*(x0+.5-c[0]);
    let e2=(b[0]-a[0])*(y0+.5-a[1])-(b[1]-a[1])*(x0+.5-a[0]);
    const az=a[2]/area,bz=b[2]/area,cz=c[2]/area,color=typeof t[3]==='number'?t[3]:parseInt(t[3].slice(1),16);
    const red=(color>>>16)&255,green=(color>>>8)&255,blue=color&255;
    for(let y=y0;y<=y1;y++,e0+=ay,e1+=by,e2+=cy){
      let u=e0,v=e1,w=e2,index=y*width+x0;
      for(let x=x0;x<=x1;x++,index++,u+=ax,v+=bx,w+=cx){
        if(u< -1e-7||v< -1e-7||w< -1e-7)continue;
        const z=u*az+v*bz+w*cz;
        if(z<depth[index]-1e-5)continue;
        depth[index]=z;const i=index*4;
        pixels[i]=red;pixels[i+1]=green;pixels[i+2]=blue;pixels[i+3]=255;
      }
    }
  }
  return frame;
}

"""Evidence renderer: actual exported triangles, perspective projection and depth buffer.
No invented facade assets. Camera height is provisional, not a calibrated survey.
"""
import json, math, sys
from pathlib import Path
import numpy as np
from PIL import Image

OUT=Path(sys.argv[2]);OUT.mkdir(parents=True,exist_ok=True)
data=json.load(open(sys.argv[1]))
W,H=1363,937
def clip(poly):
    out=[]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        ina,inb=a[2]>=.15,b[2]>=.15
        if ina:out.append(a)
        if ina!=inb:out.append(a+(.15-a[2])/(b[2]-a[2])*(b-a))
    return out
def render(name,lat,lon,heading,fov,pitch=0,eye=2.5):
    camera=np.array([(lon+110.9547151)*97200,eye,(29.076115-lat)*110950])
    h=math.radians(heading);p=math.radians(pitch);forward=np.array([math.sin(h)*math.cos(p),math.sin(p),-math.cos(h)*math.cos(p)])
    right=np.array([math.cos(h),0,math.sin(h)]);up=np.cross(right,forward)
    basis=np.stack([right,up,forward],axis=1);f=W/(2*math.tan(math.radians(fov)/2))
    pixels=np.zeros((H,W,3),dtype=np.uint8);pixels[:H//2]=[189,213,225];pixels[H//2:]=[186,180,164]
    if pitch < -60:pixels[:]=[186,180,164]
    depth=np.full((H,W),np.inf)
    for row in data['triangles']:
        verts=np.array(row[:9]).reshape(3,3)
        if np.linalg.norm(verts.mean(0)[[0,2]]-camera[[0,2]])>170:continue
        v=(verts-camera)@basis
        if v[:,2].max()<.15:continue
        poly=clip(list(v))
        color=np.array([int(row[9][i:i+2],16) for i in (0,2,4)],dtype=float)
        normal=np.cross(verts[1]-verts[0],verts[2]-verts[0]);norm=np.linalg.norm(normal)
        light=.88 if norm==0 else .76+.24*abs(np.dot(normal/norm,np.array([.3,.85,.43])))
        color=np.clip(color*light,0,255).astype(np.uint8)
        for j in range(1,len(poly)-1):
            t=np.array([poly[0],poly[j],poly[j+1]])
            xy=np.stack([W/2+f*t[:,0]/t[:,2],H/2-f*t[:,1]/t[:,2]],axis=1)
            x0=max(0,int(math.floor(xy[:,0].min())));x1=min(W-1,int(math.ceil(xy[:,0].max())))
            y0=max(0,int(math.floor(xy[:,1].min())));y1=min(H-1,int(math.ceil(xy[:,1].max())))
            if x1<x0 or y1<y0:continue
            a,b,c=xy;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(den)<1e-8:continue
            yy,xx=np.mgrid[y0:y1+1,x0:x1+1];xx=xx+.5;yy=yy+.5
            u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den
            v=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den
            w=1-u-v;inside=(u>=-1e-7)&(v>=-1e-7)&(w>=-1e-7)
            inv=u/t[0,2]+v/t[1,2]+w/t[2,2]
            z=np.divide(1,inv,out=np.full_like(inv,np.inf),where=inv>0)
            sub=depth[y0:y1+1,x0:x1+1];mask=inside&(z<sub)
            sub[mask]=z[mask];pixels[y0:y1+1,x0:x1+1][mask]=color
    Image.fromarray(pixels).save(OUT/f'{name}-3d.jpg',quality=94)
    print(name,camera.tolist(),flush=True)
cameras=[('P08',29.0759921,-110.9540252,350,90),('P09',29.075998,-110.9538125,355,80),('P10',29.0760107,-110.9536147,355,90),('H01',29.075781,-110.957122,350,90),('W02',29.07583,-110.9565574,170,90)]
if len(sys.argv)>3:cameras=json.load(open(sys.argv[3]))
for args in cameras:render(*args)

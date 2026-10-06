"""Render actual exported vertices before/after, with identical per-building cameras.
Usage: python scripts/evidencias-calzadas-lote50.py baseline.json current.json ids.json
Software rendering is deliberately labelled; it is not a WebGL screenshot.
"""
import json,sys,math,hashlib,datetime,copy,os
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from concurrent.futures import ProcessPoolExecutor

root=Path('public/levantamiento'); W,H=960,600
data=json.loads(Path('public/seguimiento-3d.json').read_text()); ids=json.load(open(sys.argv[3])); bodies={b['id']:b for a in data['blocks'] for b in a['buildings']}
worlds=[]
for f in sys.argv[1:3]:
 d=json.load(open(f)); ts=d['triangles']; vs=np.array([t[:9] for t in ts],dtype=np.float64).reshape(-1,3,3)
 colors=np.array([[int(t[9][i:i+2],16) for i in (0,2,4)] for t in ts],dtype=np.float64)
 normals=np.cross(vs[:,1]-vs[:,0],vs[:,2]-vs[:,0]); sizes=np.linalg.norm(normals,axis=1)
 light=np.array([-.35,1,.3]);light/=np.linalg.norm(light)
 colors*= (.7+.3*np.abs(normals@light/np.maximum(sizes,1e-10)))[:,None]
 worlds.append((vs,colors.astype(np.uint8),vs.min(axis=1),vs.max(axis=1),sizes))
 del ts,d
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';big=ImageFont.truetype(font,23);small=ImageFont.truetype(font,14)
now=datetime.datetime.now(datetime.timezone.utc).isoformat(); hashes=[hashlib.sha256(Path(sys.argv[4]).read_bytes()).hexdigest(),hashlib.sha256((root/'world.js').read_bytes()).hexdigest()]
method='Software rasterization of actual compiled Three.js world vertices, flat material colours; procedural texture maps omitted. Not WebGL or site photography.'
def render(job):
 id,stage,camera=job; vs,colors,lo3,hi3,sizes=worlds[stage]; origin=np.array(camera['target']); span=camera['span'];rad=span*.8
 selected=np.nonzero((hi3[:,0]>origin[0]-rad)&(lo3[:,0]<origin[0]+rad)&(hi3[:,2]>origin[2]-rad)&(lo3[:,2]<origin[2]+rad)&(hi3[:,1]>=-.2)&(lo3[:,1]<35)&(sizes>.05))[0]
 direction=np.array(camera['direction'],float);direction/=np.linalg.norm(direction);right=np.cross([0,1,0],direction);right/=np.linalg.norm(right);up=np.cross(direction,right)
 scale=W/span; buf=np.full((H,W),-np.inf); rgb=np.full((H,W,3),(230,233,228),dtype=np.uint8)
 for ix in selected:
  v=vs[ix];rel=v-origin;xy=np.column_stack((rel@right*scale+W/2,-rel@up*scale+H*.56));depth=rel@direction
  lo=np.maximum(np.floor(xy.min(axis=0)).astype(int),[0,0]);hi=np.minimum(np.ceil(xy.max(axis=0)).astype(int),[W-1,H-1])
  if np.any(lo>hi):continue
  a,b,c=xy;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
  if abs(den)<.25:continue
  yy,xx=np.mgrid[lo[1]:hi[1]+1,lo[0]:hi[0]+1];xx=xx+.5;yy=yy+.5
  u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den;w=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;z=1-u-w
  dz=u*depth[0]+w*depth[1]+z*depth[2];old=buf[lo[1]:hi[1]+1,lo[0]:hi[0]+1];mask=(u>=-1e-5)&(w>=-1e-5)&(z>=-1e-5)&(dz>old)
  rgb[lo[1]:hi[1]+1,lo[0]:hi[0]+1][mask]=colors[ix];old[mask]=dz[mask]
 img=Image.fromarray(rgb);draw=ImageDraw.Draw(img);draw.rectangle([0,0,W,54],fill='#163b34');draw.text((18,12),id+' · '+('Antes · calzada' if stage==0 else 'Después · calzada'),font=big,fill='white')
 draw.rectangle([0,H-43,W,H],fill='#f4f1e9');draw.text((15,H-34),'Acción 2 · entorno vial aproximado · alturas y fachadas pendientes',font=small,fill='#31453d');draw.text((15,H-17),'Modelo 3D · vista por software, sin texturas · no es fotografía del sitio',font=small,fill='#5f655f')
 rel=f'levantamiento/evidence/{id}/20261006-02-'+('antes' if stage==0 else 'calzada')+'.png';path=Path('public')/rel;path.parent.mkdir(parents=True,exist_ok=True);img.quantize(colors=128).save(path,optimize=True)
 return id,stage,dict(url=rel,title='Acción 2 · '+('antes' if stage==0 else 'calzada revisada'),label='Calzada · 02',capturedAt=now,worldSha256=hashes[stage],sha256=hashlib.sha256(path.read_bytes()).hexdigest(),cameraId=camera['id'],renderMethod=method),len(selected)
cameras={};oldRecords={}
for id in ids:
 rec=json.loads((Path('public')/bodies[id]['visualProgress']['manifest']).read_text());oldRecords[id]=rec
 cam=copy.deepcopy(rec['camera']);cam['id']=id+'-street50-20261006';cam['span']=max(70,cam['span']*1.3);cam['direction']=[.2,1,1];cameras[id]=cam
results={i:{} for i in ids}
with ProcessPoolExecutor(max_workers=4) as pool:
 for id,stage,image,n in pool.map(render,[(id,s,cameras[id]) for id in ids for s in [0,1]]):
  results[id][stage]=(image,n)
  if stage:print(id+' comparison saved',flush=True)
Path(sys.argv[5]).write_text(json.dumps(dict(images=results,cameras=cameras,oldRecords=oldRecords,timestamp=now,hashes=hashes,method=method),ensure_ascii=False))

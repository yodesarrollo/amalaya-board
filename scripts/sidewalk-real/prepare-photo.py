"""Reproduce the literal panorama projection; no generated or retouched imagery."""
import json,math,hashlib
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/levantamiento/sidewalk-real-v1'
cfg=json.loads((OUT/'reprojection.json').read_text())
src=ROOT/cfg['source'];im=np.array(Image.open(src));W,H=cfg['output']
f=W/(2*math.tan(math.radians(cfg['horizontalFovDegrees'])/2));yy,xx=np.mgrid[:H,:W]
rays=np.stack([(xx+.5-W/2)/f,-(yy+.5-H/2)/f,np.ones((H,W))],axis=-1)
pitch=math.radians(cfg['pitchDegrees']);c,s=math.cos(pitch),math.sin(pitch)
rx=rays[:,:,0];ry=c*rays[:,:,1]+s*rays[:,:,2];rz=-s*rays[:,:,1]+c*rays[:,:,2]
theta=np.arctan2(rx,rz);phi=np.arctan2(ry,np.sqrt(rx*rx+rz*rz))
u=(cfg['panoramaCenterPixel']+theta*im.shape[1]/(2*math.pi))%im.shape[1];v=im.shape[0]/2-phi*im.shape[0]/math.pi
pixels=np.stack([map_coordinates(im[:,:,i],[v,u],order=1,mode='wrap')for i in range(3)],axis=-1).astype('uint8')
path=OUT/'images/photo-P10-south.jpg';Image.fromarray(pixels).save(path,quality=94)
assert hashlib.sha256(path.read_bytes()).hexdigest()==json.loads((OUT/'study.json').read_text())['cases'][0]['reference']['sha256']
print('Reprojection matches frozen photograph SHA256.')

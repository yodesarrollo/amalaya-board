"""Render real exported model triangles, with depth, using no generated imagery."""
import json,sys,math,hashlib
from pathlib import Path
import numpy as np
from PIL import Image
cfg=json.loads(Path(sys.argv[1]).read_text());W,H=cfg['width'],cfg['height'];OUT=Path(cfg['output'])
def clip(poly):
 out=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  ina,inb=a[2]>=.15,b[2]>=.15
  if ina:out.append(a)
  if ina!=inb:out.append(a+(.15-a[2])/(b[2]-a[2])*(b-a))
 return out
def render(triangles,camera):
 eye=np.array(camera['position'],float);forward=np.array(camera['target'],float)-eye;forward/=np.linalg.norm(forward)
 right=np.cross(forward,np.array([0,1,0]));right/=np.linalg.norm(right);up=np.cross(right,forward)
 basis=np.stack([right,up,forward],axis=1);f=W/(2*math.tan(math.radians(camera['fov'])/2))
 pixels=np.zeros((H,W,3),dtype=np.uint8);pixels[:]=[191,214,226];depth=np.full((H,W),np.inf)
 # Neutral capture floor is deliberately separate from the exported building geometry.
 floor=[[40,0,60,160,0,60,40,0,-80,'b6b0a0'],[160,0,60,160,0,-80,40,0,-80,'b6b0a0']]
 for row in floor+triangles:
  verts=np.array(row[:9]).reshape(3,3);v=(verts-eye)@basis
  if v[:,2].max()<.15:continue
  poly=clip(list(v));color=np.array([int(row[9][i:i+2],16)for i in(0,2,4)],float)
  normal=np.cross(verts[1]-verts[0],verts[2]-verts[0]);norm=np.linalg.norm(normal);light=.88 if norm==0 else .76+.24*abs(np.dot(normal/norm,np.array([.3,.85,.43])))
  color=np.clip(color*light,0,255).astype(np.uint8)
  for j in range(1,len(poly)-1):
   t=np.array([poly[0],poly[j],poly[j+1]]);xy=np.stack([W/2+f*t[:,0]/t[:,2],H/2-f*t[:,1]/t[:,2]],axis=1)
   x0=max(0,int(math.floor(xy[:,0].min())));x1=min(W-1,int(math.ceil(xy[:,0].max())));y0=max(0,int(math.floor(xy[:,1].min())));y1=min(H-1,int(math.ceil(xy[:,1].max())))
   if x1<x0 or y1<y0:continue
   a,b,c=xy;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
   if abs(den)<1e-8:continue
   yy,xx=np.mgrid[y0:y1+1,x0:x1+1];xx=xx+.5;yy=yy+.5
   u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den;v=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;w=1-u-v
   inside=(u>=-1e-7)&(v>=-1e-7)&(w>=-1e-7);inv=u/t[0,2]+v/t[1,2]+w/t[2,2];z=np.divide(1,inv,out=np.full_like(inv,np.inf),where=inv>0)
   sub=depth[y0:y1+1,x0:x1+1];mask=inside&(z<sub);sub[mask]=z[mask];pixels[y0:y1+1,x0:x1+1][mask]=color
 return pixels
def save_image(pixels,name):
 path=OUT/'images'/name;Image.fromarray(pixels).save(path,optimize=True);raw=path.read_bytes()
 if len(raw)>4*1024*1024:raise ValueError('PNG exceeds payload cap')
 return {'path':'images/'+name,'sha256':hashlib.sha256(raw).hexdigest()}
cases=[];truth=[];cache={}
for file in cfg['case_files']:
 c=json.loads(Path(file).read_text());key=json.dumps(c['camera'],sort_keys=True)
 if key not in cache:cache[key]=render(c['baseline'],c['camera'])
 reference=cache[key]
 candidate=reference if c['category']=='none' else render(c['candidate'],c['candidateCamera'])
 refs=save_image(reference,c['case_id']+'-reference.png');cand=save_image(candidate,c['case_id']+'-candidate.png')
 cases.append({'case_id':c['case_id'],'split':c['split'],'reference':refs,'candidate':cand})
 sufficient=c['category']!='insufficient_evidence';presence=None if not sufficient else c['category']!='none';box=None
 diff=np.any(reference!=candidate,axis=2);ys,xs=np.where(diff)
 if presence:
  if len(xs)<30:raise ValueError('Planted defect not visibly rendered: '+c['case_id'])
  box={'left':float(xs.min()/W),'top':float(ys.min()/H),'right':float((xs.max()+1)/W),'bottom':float((ys.max()+1)/H)}
 truth.append({'case_id':c['case_id'],'split':c['split'],'expected':{'presence':presence,'sufficient_evidence':sufficient,'category':c['category'],'box':box,'critical':False},'planted_transform':{'action':c['action'],'value':c['value']},'camera':c['camera'],'candidate_camera':c['candidateCamera'],'changed_pixels':int(len(xs)),'ground_truth_method':'deterministic geometry intervention; box is visible RGB difference extent at the matched camera, not a parcel measurement'})
 print(c['case_id'],c['category'],'changed_pixels',len(xs),flush=True)
criteria={
 'context':'Compare the reference and candidate rendered images of the same EB-SW building microzone. Reference is the approved model checkpoint for this controlled test. Look only for a visible geometric or architectural feature defect in the candidate relative to reference. The neutral ground, software rendering style, unmeasured real-world dimensions and defects already shared by both images are outside scope. Images with a mismatched view or the target hidden do not provide sufficient evidence. Do not infer hidden geometry.',
 'presence':'A defect exists only when candidate visibly removes, displaces or changes scale of a building or architectural feature relative to the reference at a comparable camera. Identical geometry means no defect. Set presence null and abstain true if comparison cannot establish this.',
 'abstain':'Abstain when the candidate does not show the same target facade or obscures it so a reliable comparison is impossible; do not treat camera mismatch or occlusion as a confirmed building defect.',
 'categories':{'none':'No new visible building defect.','missing_feature':'An architectural element visible in reference is absent from candidate.','displacement':'An element or building has moved relative to reference.','scale':'An element or building has changed size or proportion relative to reference.','insufficient_evidence':'The target cannot reliably be compared because the view is mismatched or hidden.'},
 'box':'If a defect is present, return the smallest axis-aligned normalized 0..1 box in the candidate covering the affected region (including its original location when it moved). Do not return a useful defect box when presence is false or null.'}
manifest={'study_id':cfg['study_id'],'schema_version':1,'openai_model':'gpt-5.4','criteria':criteria,'cases':cases,'provenance':{k:v for k,v in cfg.items()if k in ['seed','width','height','renderer','scope','source']},'limitations':['Controlled changes to actual model geometry; no claim of measured site fidelity.','Software depth rendering omits production textures/shadows.','Cases are variations of one microzone and are not independent buildings.']}
(OUT/'study.json').write_text(json.dumps(manifest,indent=2)+'\n')
Path(cfg['truth_output']).write_text(json.dumps({c['case_id']:{'family':'EB-SW','expected':c['expected'],'planted_transform':c['planted_transform'],'camera':c['camera'],'candidate_camera':c['candidate_camera'],'changed_pixels':c['changed_pixels'],'ground_truth_method':c['ground_truth_method']}for c in truth},indent=2)+'\n')

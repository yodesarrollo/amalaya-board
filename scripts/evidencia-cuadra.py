"""Diagnostic evidence from the immutable reference; no image inference or invented geometry."""
import base64, hashlib, io, json, math
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
j=json.loads((root/'src/plano-trazos.json').read_text())
source=root/'public/levantamiento'/j['reference']['image']
assert hashlib.sha256(source.read_bytes()).hexdigest()==j['reference']['imageSha256']
b=j['blocks'][0];left,top,right,bottom=b['reviewBoundsPixels'];w,h=right-left,bottom-top
im=Image.open(source).crop((left,top,right,bottom));buf=io.BytesIO();im.save(buf,format='PNG');data=base64.b64encode(buf.getvalue()).decode()
W,H=360,515;scale=min(W/w,H/h);pw,ph=w*scale,h*scale
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="710" viewBox="0 0 1160 710"><rect width="1160" height="710" fill="#f7f5ef"/><style>text{{font-family:Arial,sans-serif;fill:#25251f}}.small{{font-size:13px}}</style><text x="24" y="30" font-size="22">C01 · Cuadra B1 · comparación en la misma referencia</text><text x="24" y="52" class="small">B1-05 / B1-06 / B1-07 · cuatro lados inspeccionados; dos parciales y dos pendientes</text><defs><image id="foto" width="{pw}" height="{ph}" href="data:image/png;base64,{data}"/></defs>']
for i,(title,traces,color) in enumerate([('Referencia fotográfica',[],'#167d9a'),('Antes · trazos sin validar',j['previousTraces'],'#ef33b5'),('Retrazado · solo segmentos visibles',j['traces'],'#00d4ea')]):
 x=24+i*380;svg.append(f'<text x="{x}" y="82" font-size="15">{title}</text><svg x="{x}" y="95" width="{pw}" height="{ph}" overflow="hidden"><use href="#foto"/>')
 for t in traces:
  pts=' '.join(f'{(a-left)*scale:.2f},{(bb-top)*scale:.2f}' for a,bb in t['pixels'])
  svg.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.5"/>')
 svg.append('</svg>')
svg.extend(['<text x="24" y="633" class="small">Retirados en C01: T02 (cubierta/sombra), T04 (cubierta), T08 (cubierta/estacionamiento).</text>','<text x="24" y="654" class="small">Norte y sur pendientes por oclusión. Banquetas completas e interiores: sin verificar. No se cierran huecos.</text>','<text x="24" y="675" class="small">Esri World Imagery · captura sin fecha verificada · ~0.52 m/píxel · calco visual, no levantamiento topográfico.</text>','</svg>'])
(root/'docs/calco-cuadras/C01.svg').write_text(''.join(svg))
# Distances compare drawings only. No cadastral/survey accuracy or widths inferred.
def dist(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1];den=dx*dx+dy*dy
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
old={t['id']:t for t in j['previousTraces']};new={t['id']:t for t in j['traces']}
zoom=j['reference']['tileZoom'];ty=j['reference']['tileBounds'][1]+((top+bottom)/2)/256
lat=math.atan(math.sinh(math.pi*(1-2*ty/2**zoom)))
mpp=2*math.pi*6378137*math.cos(lat)/(256*2**zoom)
comparisons=[]
for oldid,newids in [('T04',['C01-E1']),('T08',['C01-E2','C01-E3']),('T09',['C01-W1','C01-W2','C01-W3'])]:
 points=old[oldid]['pixels']; ymin=min(p[1] for p in points);ymax=max(p[1] for p in points)
 samples=[]
 for id in newids:
  pts=new[id]['pixels']
  for a,bp in zip(pts,pts[1:]):
   for k in range(11):
    p=[a[v]+(bp[v]-a[v])*k/10 for v in range(2)]
    if ymin<=p[1]<=ymax:samples.append(min(dist(p,u,v) for u,v in zip(points,points[1:])))
 samples.sort();comparisons.append({'previous':oldid,'new':newids,'metric':'Distancia entre dibujos en zona de solape; no error topográfico','medianPixels':round(samples[len(samples)//2],1),'maxPixels':round(max(samples),1),'medianMetersApprox':round(samples[len(samples)//2]*mpp,1),'maxMetersApprox':round(max(samples)*mpp,1),'differencePercent':None,'reasonNoPercentage':'No hay ancho local medido de forma independiente.'})
report={'block':'C01','imageSha256':j['reference']['imageSha256'],'approxMetersPerPixel':round(mpp,3),'closedSidewalkPolygons':0,'completedBlocks':0,'sides':j['blocks'][0]['sides'],'comparisons':comparisons,'status':'parcial-con-oclusiones'}
(root/'docs/calco-cuadras/C01.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(comparisons,ensure_ascii=False))

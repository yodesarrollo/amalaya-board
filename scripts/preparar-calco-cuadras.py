"""Package a reviewed, partial 2D drawing; does not generate missing edges.
Inputs: reviewed JSON, reference JPEG, tile manifest. Requires Pillow.
"""
import json,sys,hashlib,math
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];out=root/'public/levantamiento/calco';out.mkdir(exist_ok=True)
notes=json.loads(Path(sys.argv[1]).read_text());source=Path(sys.argv[2]);manifest=json.loads(Path(sys.argv[3]).read_text())
assert hashlib.sha256(source.read_bytes()).hexdigest()==manifest['imageSha256']
image=Image.open(source);image.save(out/'referencia.webp',quality=84,method=6)
reference={**manifest,'sourceImageSha256':manifest['imageSha256'],'image':'levantamiento/calco/referencia.webp','imageSha256':hashlib.sha256((out/'referencia.webp').read_bytes()).hexdigest(),'width':image.width,'height':image.height,'captureDates':['2024-01-13','2024-01-16'],'captureDateScope':'Dos registros de metadatos intersectan el área; no se asigna una fecha única a cada píxel.','basePixelTransform':{'offset':[256,384],'scale':2}}
# The reviewed points use the z18 inventory coordinate frame, not screen coordinates.
def pixels(p):return [(p[0]-256)*2,(p[1]-384)*2]
def geo(p):
 x,y=p;n=2**reference['tileZoom'];tx=reference['tileBounds'][0]+x/256;ty=reference['tileBounds'][1]+y/256
 return [tx/n*360-180,math.atan(math.sinh(math.pi*(1-2*ty/n)))*180/math.pi]
traces=[];reviews=[]
for bid,b in notes.items():
 ids=[]
 for kind,label in [('roads','borde-calzada'),('walks','borde-interior-peatonal')]:
  for i,line in enumerate(b[kind]):
   ident=f'{bid}-'+('V' if kind=='roads' else 'P')+f'{i+1:02}';ps=list(map(pixels,line));ids.append(ident)
   traces.append({'id':ident,'blockId':bid,'type':label,'status':'interpretacion-visual-por-contrastar','pixels':ps})
 reviews.append({'blockId':bid,'reviewed':True,'status':'partial' if ids else 'needs-evidence','traceIds':ids,'gaps':b['gaps'],'requiredEvidence':'Contraste de bordes ocultos con levantamiento georreferenciado o imagen de suelo sin oclusión; no interpolar a partir de cubiertas ni anchos típicos.'})
summary={'reviewedBlocks':len(reviews),'blocksWithTraces':sum(bool(r['traceIds']) for r in reviews),'blocksWithoutTraces':sum(not r['traceIds'] for r in reviews),'roadEdges':sum(t['type']=='borde-calzada' for t in traces),'pedestrianEdges':sum(t['type']=='borde-interior-peatonal' for t in traces),'completeBlocks':0,'discardedCandidates':50}
assert summary=={'reviewedBlocks':33,'blocksWithTraces':17,'blocksWithoutTraces':16,'roadEdges':20,'pedestrianEdges':5,'completeBlocks':0,'discardedCandidates':50}
drawing={'version':1,'reviewedAt':'2026-10-07','status':'partial','reference':reference,'summary':summary,'limits':['Calco visual parcial, no levantamiento métrico ni aprobación de banqueta.','Las líneas no forman superficies ni se extruyen; todos los huecos permanecen abiertos.','La captura de enero de 2024 no acredita cambios posteriores.','Los límites INEGI se usan para agrupar, nunca como guarniciones automáticas.'],'traces':traces,'reviews':reviews}
(out/'cuadras-2d.json').write_text(json.dumps(drawing,ensure_ascii=False,separators=(',',':'))+'\n')
(out/'cuadras-2d.geojson').write_text(json.dumps({'type':'FeatureCollection','features':[{'type':'Feature','id':t['id'],'properties':{'id':t['id'],'blockId':t['blockId'],'type':t['type'],'status':t['status'],'sourceSha256':reference['imageSha256']},'geometry':{'type':'LineString','coordinates':list(map(geo,t['pixels']))}} for t in traces]},ensure_ascii=False,separators=(',',':'))+'\n')
regpath=root/'public/levantamiento/cuadras.json';registry=json.loads(regpath.read_text());registry['tracingSummary']=summary
for b in registry['blocks']:
 r=next(r for r in reviews if r['blockId']==b['id']);b['tracing']={'status':r['status'],'traceCount':len(r['traceIds']),'data':'levantamiento/calco/cuadras-2d.json'}
# Physical task approvals and existing history are intentionally left as they were.
regpath.write_text(json.dumps(registry,ensure_ascii=False,separators=(',',':'))+'\n')
print(summary,'referenceBytes',(out/'referencia.webp').stat().st_size)

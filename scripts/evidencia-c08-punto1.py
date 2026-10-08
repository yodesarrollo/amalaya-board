"""Evidence from actual exported before/after footprints, in the same source frame.
Usage: python scripts/evidencia-c08-punto1.py before.json after.json
"""
import hashlib, json, math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Polygon, Point, shape
from shapely.ops import unary_union

root=Path(__file__).resolve().parents[1];p=root/'public/levantamiento'
reg_path=p/'cuadras.json';reg=json.loads(reg_path.read_text())
block=next(b for b in reg['blocks'] if b['id']=='C08')
fit=json.loads((p/'ajuste-visual/cuadras.json').read_text());ref=fit['reference']
out=p/'evidence/c08-punto1-20261008';out.mkdir(exist_ok=True)
rel='levantamiento/evidence/c08-punto1-20261008/'
def footprints(path):
 d=json.loads(Path(path).read_text())
 f={b['id']:Polygon(b['points'],b.get('holes',[])) for b in d['plans']}
 f.update({b['id']:unary_union([Polygon(t) for t in b['triangles']]) for b in d['entries']})
 return f
before,after=map(footprints,sys.argv[1:3])
changed=[k for k in before if before[k].symmetric_difference(after[k]).area>1e-5]
assert changed==['C2-03'],changed
assert all(after[k].is_valid for k in block['buildingIds'])
surfaces={kind:unary_union([Polygon(poly['points'],poly['holes']) for s in fit['surfaces'] if s['kind']==kind for poly in s['polygons']]) for kind in ['road','sidewalk']}
occupied=unary_union([after[k] for k in block['buildingIds']])
assert occupied.intersection(surfaces['road']).area<.0001
assert occupied.intersection(surfaces['sidewalk']).area<.0001
parking=[[-77,57],[-74,74],[-51,72]]
assert not any(occupied.covers(Point(*q)) for q in parking)
assert all(after['C2-03'].intersection(after[k]).area<.0001 for k in block['buildingIds'] if k!='C2-03')
def px(x,z):
 lng=-110.9547151+x/97200;lat=29.076115-z/110950;n=2**ref['tileZoom']
 return (((lng+180)/360*n-ref['tileBounds'][0])*256,((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n-ref['tileBounds'][1])*256)
def polys(g):
 return [] if g.is_empty else [g] if g.geom_type=='Polygon' else [q for q in g.geoms if q.geom_type=='Polygon']
source=root/'public'/ref['image'];im=Image.open(source).convert('RGBA')
assert hashlib.sha256(source.read_bytes()).hexdigest()==ref['imageSha256']
g=shape(block['boundaryLocal']);a=px(g.bounds[0]-15,g.bounds[1]-15);z=px(g.bounds[2]+15,g.bounds[3]+15)
cx=(a[0]+z[0])/2;cy=(a[1]+z[1])/2;span=max(z[0]-a[0],z[1]-a[1]);box=(int(cx-span/2),int(cy-span/2),int(cx+span/2),int(cy+span/2))
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',10)
def paint(data,color):
 layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer)
 for q in polys(surfaces['road']):
  d.polygon([px(*v) for v in q.exterior.coords],fill=(30,140,230,55))
  for hole in q.interiors:d.polygon([px(*v) for v in hole.coords],fill=(0,0,0,0))
 for ident in block['buildingIds']:
  for q in polys(data[ident]):
   d.polygon([px(*v) for v in q.exterior.coords],fill=(*color,45),outline=(*color,255),width=1)
   for hole in q.interiors:d.polygon([px(*v) for v in hole.coords],fill=(0,0,0,0),outline=(*color,255))
  pt=data[ident].representative_point();d.text(px(pt.x,pt.y),ident,font=font,fill='white',stroke_width=1,stroke_fill='black',anchor='mm')
 return Image.alpha_composite(im,layer).convert('RGB').crop(box).resize((900,900))
im.convert('RGB').crop(box).resize((900,900)).save(out/'referencia.jpg',quality=90,optimize=True)
paint(before,(255,168,42)).save(out/'antes.jpg',quality=90,optimize=True)
paint(after,(21,226,155)).save(out/'despues.jpg',quality=90,optimize=True)
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
model_files=['world.js','sheet-plan-data.js','sheet-plan-refinement.js','ajuste-visual-data.js','ajuste-visual-refinement.js','paramento-data.js','paramento-refinement.js']
record=dict(schemaVersion=1,scope='block',building=None,block='C08',section=1,tasks=['plan','street'],
 status='done',approval='visual-approximate',reviewedAt='2026-10-08',baselineCommit='75075dba101bcde9bcc15d4ab984d20e08e4ffcf',
 members=block['buildingIds'],changedBuildingIds=changed,retainedBuildingIds=[k for k in block['buildingIds'] if k not in changed],
 summary='Cinco plantas cotejadas. C2-03 recolocada y completada con su brazo norte visible; cuatro plantas y las calles existentes conservadas. Patio y estacionamiento abiertos.',
 reference={k:ref[k] for k in ['provider','attribution','retrievedAt','image','imageSha256','tileZoom','tileBounds','metadataUrl']},
 camera=dict(type='orthographic-plan',sourcePixelBox=box,outputSize=[900,900],sameBeforeAfter=True),
 images={s:dict(url=rel+file,sha256=sha(out/file)) for s,file in [('before','antes.jpg'),('reference','referencia.jpg'),('after','despues.jpg')]},
 modelHashes={f:sha(p/f) for f in model_files},worldSha256=sha(p/'world.js'),
 geometry=dict(before={k:before[k].__geo_interface__ for k in block['buildingIds']},after={k:after[k].__geo_interface__ for k in block['buildingIds']}),
 checks=dict(changedBuildings=changed,unchangedBuildings=len(before)-len(changed),roadOverlapArea=round(occupied.intersection(surfaces['road']).area,8),
 sidewalkOverlapArea=round(occupied.intersection(surfaces['sidewalk']).area,8),parkingSamples=parking,parkingSamplesFree=True,otherBlocksUnchanged=True),
 limits=['Aproximación visual sobre imagen conservada; no levantamiento topográfico.','La imagen de referencia tiene capturas regionales de enero de 2024; no se presenta como foto actual.',
 'Alturas heredadas sin medir. La división de cuerpos y alturas corresponde al punto 3.','Arbolado y vehículos ocultan tramos del borde; conservan continuidad estimada.',
 'Banquetas, esquinas y las demás secciones no se cierran en esta ejecución.'],
 next=dict(block='C08',section=2,name='Banquetas y esquinas',status='pending'))
(out/'registro.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
block.setdefault('sectionReviews',{})['1']=dict(state='done',reviewedAt=record['reviewedAt'],summary=record['summary'],record=rel+'registro.json',comparison=rel+'index.html',
 evidence={k:v['url'] for k,v in record['images'].items()},worldSha256=record['worldSha256'])
reg['workPlan']=dict(version=1,mode='block-sections',activeBlock='C08',completedSection=1,nextSection=2,
 title='C08 · punto 1 cerrado: planta y calle',detail='Cinco edificios revisados; C2-03 corregido. Siguiente: punto 2, banquetas y esquinas de esta misma cuadra. Los avances previos se conservan.')
reg_path.write_text(json.dumps(reg,ensure_ascii=False,separators=(',',':'))+'\n')
html='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C08 · Planta y calle · Punto 1</title><style>body{font:16px/1.6 system-ui;margin:auto;max-width:1500px;padding:24px;background:#f6f7f2;color:#244233}h1{line-height:1.2}a{color:#215e49}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}figure{margin:0}img{width:100%;border-radius:12px}figcaption{font-weight:600}.ok{background:#dcebd8;padding:18px;border-radius:12px}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:10px;border-bottom:1px solid #ccc}small{display:block;color:#667468}@media(max-width:700px){.grid{grid-template-columns:1fr}body{padding:16px}}</style><body><a href="../../../seguimiento-3d.html?cuadra=C08">← Volver a la cuadra en Amalaya</a><h1>C08 · Planta y calle</h1><p class="ok"><strong>🟢 Punto 1 cerrado visualmente.</strong> Cinco edificios revisados: OB-01, OB-02, C2-01, C2-02 y C2-03. Se corrigió el contorno desplazado de C2-03 y se completó su brazo norte visible. Las otras cuatro plantas y las calles se conservaron.</p><div class="grid"><figure><a href="antes.jpg"><img src="antes.jpg" alt="Modelo anterior: huellas en naranja sobre la referencia"></a><figcaption>Antes · modelo recibido</figcaption></figure><figure><a href="referencia.jpg"><img src="referencia.jpg" alt="Referencia aérea sin trazos"></a><figcaption>Referencia real · Esri World Imagery</figcaption></figure><figure><a href="despues.jpg"><img src="despues.jpg" alt="Modelo corregido: huellas en verde sobre la misma referencia"></a><figcaption>Después · modelo corregido</figcaption></figure></div><p>Plantas extraídas del modelo 3D, en el mismo encuadre. Azul: calzada conservada. Las imágenes muestran el cambio del contorno, no una modificación de la fotografía.</p><table><thead><tr><th>Sección</th><th>Estado del cierre por cuadra</th></tr></thead><tbody><tr><td>1. Planta y calle</td><td>🟢 Cerrado visual · con evidencia</td></tr><tr><td>2. Banquetas y esquinas</td><td>🔴 Por cerrar · avance previo conservado</td></tr><tr><td>3. Edificios y volúmenes</td><td>🔴 Pendiente</td></tr><tr><td>4. Fachadas y acabados</td><td>🔴 Pendiente</td></tr><tr><td>5. Equipamiento y cierre</td><td>🔴 Pendiente</td></tr></tbody></table><p>Comprobaciones: sin invasión de calzada por las plantas; patio y estacionamiento abiertos; solo C2-03 cambia. El registro conserva geometría, fuente y hashes.</p><small>Aproximación visual. La referencia conservada tiene capturas regionales de enero de 2024; no es una fotografía actual ni un levantamiento topográfico. Alturas heredadas sin medir. Los bordes ocultos conservan continuidad estimada. El siguiente paso es banquetas y esquinas de C08.</small><p><a href="registro.json">Registro completo de la cuadra</a></p></body></html>'''
(out/'index.html').write_text(html)
print(json.dumps(record['checks'],ensure_ascii=False))

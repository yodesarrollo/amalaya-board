"""Inventario espacial reproducible. Requiere Shapely 2.1 y Pillow.
Uso: python scripts/generar-inventario-cuadras.py fuente.geojson huellas.json
La fuente puede ser la respuesta INEGI completa o el recorte versionado.
"""
import json, sys, math, hashlib
from pathlib import Path
from shapely.geometry import shape, Polygon, LineString, box, mapping
from shapely.ops import transform, unary_union
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]; public=root/'public'; dest=public/'levantamiento/cuadras'
read=lambda p:json.loads(Path(p).read_text())
write=lambda p,v:Path(p).write_text(json.dumps(v,ensure_ascii=False,separators=(',',':'))+'\n')
source=read(sys.argv[1]); exported=read(sys.argv[2]); tracking=read(public/'seguimiento-3d.json')
registry=read(public/'levantamiento/cuadras.json'); c01=registry['blocks'][0]
local=lambda x,y:((x+110.9547151)*97200,(29.076115-y)*110950)
features=[f for f in source['features'] if shape(f['geometry']).intersects(box(-110.960,29.070,-110.950,29.079))]
polys={f['properties']['cvegeo']:transform(local,shape(f['geometry'])) for f in features}
assert all(p.is_valid for p in polys.values())
footprints={p['id']:Polygon(p['points'],p.get('holes',[])) for p in exported['plans']}
for e in exported['entries']:footprints[e['id']]=unary_union([Polygon(t) for t in e['triangles']])
records=[b for g in tracking['blocks'] for b in g['buildings'] if not b.get('publicSpace')]
assignments=[]; groups={}
for b in records:
 p=footprints[b['id']]; assert p.is_valid and p.area>0
 scores=sorted([(p.intersection(q).area/p.area,k) for k,q in polys.items()],reverse=True)
 ratio,key=scores[0]; assert ratio>0 and ratio>scores[1][0]*2, b['id']
 # Pick an interior point of the actual intersection, never a camera target.
 pt=p.intersection(polys[key]).representative_point()
 entry={'buildingId':b['id'],'cvegeo':key,'overlapRatio':round(ratio,6),'secondOverlapRatio':round(scores[1][0],6),'secondCvegeo':scores[1][1] if scores[1][0]>0 else None,'pointLocal':[round(pt.x,5),round(pt.y,5)],'geometryReviewPending':ratio<.85}
 assignments.append(entry); groups.setdefault(key,[]).append(b['id'])
assert len(records)==139 and len(groups)==33
# Stable local traversal, starting with historical C01; nearest unvisited centroid.
order=['2603000013352005']; remaining=set(groups)-set(order)
while remaining:
 prev=polys[order[-1]]
 nxt=min(remaining,key=lambda k:(prev.centroid.distance(polys[k].centroid),k));order.append(nxt);remaining.remove(nxt)
ids={k:f'C{i+1:02}' for i,k in enumerate(order)}
roads=[]
for e in read(public/'levantamiento/data/osm-context.json')['elements']:
 if e.get('tags',{}).get('highway') and e.get('tags',{}).get('name') and len(e.get('geometry',[]))>1:
  roads.append((e['tags']['name'],LineString([local(p['lon'],p['lat']) for p in e['geometry']])))
meta=read(public/'levantamiento/ground-reference.json');im=Image.open(public/'levantamiento'/meta['image']).convert('RGBA');N=2**meta['tileZoom'];x0,y0,*_=meta['tileBounds']
def pixel(x,z):
 lng=-110.9547151+x/97200;lat=29.076115-z/110950
 return (((lng+180)/360*N-x0)*256,((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*N-y0)*256)
def rings(p):return [list(a.exterior.coords) for a in (list(p.geoms) if p.geom_type=='MultiPolygon' else [p])]
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
blocks=[]
for key in order:
 p=polys[key];bid=ids[key]
 scores=sorted([(p.boundary.intersection(line.buffer(13)).length,name) for name,line in roads],reverse=True)
 streets=list(dict.fromkeys(name for length,name in scores if length>20))[:4]
 name=' / '.join(streets[:2]) or 'Borde del cerro'
 if key=='2603000013371069':name='Pie del cerro · franja irregular'
 b=dict(c01) if bid=='C01' else {'id':bid,'name':name,'taskStates':{},'sides':[]}
 issues=[a['buildingId'] for a in assignments if a['cvegeo']==key and a['geometryReviewPending']]
 b.update(buildingIds=groups[key],membershipComplete=True,cvegeo=key,source='INEGI · Marco Geoestadístico, diciembre de 2025. Límite de inventario; no es guarnición medida.',nearbyStreets=streets,geometryReviewIds=issues,inventoryEvidence=f'levantamiento/cuadras/{bid}-inventario.jpg',boundaryLocal=mapping(p),mapRings=[[[round(x,2),round(y,2)] for x,y in map(lambda q:pixel(*q),r)] for r in rings(p)],mapLabel=[round(v,2) for v in pixel(*p.representative_point().coords[0])])
 b['adjacentBlocks']=[ids[k] for k in order if k!=key and p.distance(polys[k])<25]
 blocks.append(b)
 overlay=Image.new('RGBA',im.size);d=ImageDraw.Draw(overlay)
 for r in rings(p):d.polygon([pixel(*q) for q in r],fill=(15,240,170,24),outline=(30,255,180),width=3)
 for member in groups[key]:
  for r in rings(footprints[member]):d.polygon([pixel(*q) for q in r],fill=(255,155,30,125) if member in issues else (255,225,120,75))
 points=[pixel(*q) for r in rings(p) for q in r];xs,ys=zip(*points);cx=(min(xs)+max(xs))/2;cy=(min(ys)+max(ys))/2;w=max(max(xs)-min(xs)+50,(max(ys)-min(ys)+50)*1.5);h=w/1.5
 crop=Image.alpha_composite(im,overlay).crop((int(cx-w/2),int(cy-h/2),int(cx+w/2),int(cy+h/2))).resize((480,320)).convert('RGB');d=ImageDraw.Draw(crop);d.rectangle((0,288,480,320),fill='#102b30');d.text((10,295),f'{bid} · INEGI / Esri · límite de inventario',font=font,fill='white');crop.save(dest/f'{bid}-inventario.jpg',quality=77,optimize=True)
# The city payload includes census attributes; retain geography only.
keys=['cvegeo','nom_ent','nom_mun','nom_loc','cve_ageb','cve_mza','ambito','tipomza']
subset={'type':'FeatureCollection','sourceUrl':'https://gaia.inegi.org.mx/wscatgeo/v2/geo/mza/26/030/0001','retrievedAt':'2026-10-07','metadatos':source.get('metadatos',{}),'features':[{'type':'Feature','properties':{k:f['properties'][k] for k in keys},'geometry':f['geometry']} for f in features]}
if source.get('originalResponseSha256'):subset['originalResponseSha256']=source['originalResponseSha256']
else:subset['originalResponseSha256']=hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest()
write(dest/'manzanas-inegi.geojson',subset)
proof={'version':1,'method':'Mayor intersección de huella del modelo con manzana INEGI; sin asignación por proximidad. Punto interior de la intersección. Revisión visual de ocho casos <85%.','screeningThreshold':.85,'thresholdMeaning':'Filtro de revisión de pertenencia, no tolerancia geométrica aceptada.','candidateBlocks':len(features),'worldSha256':exported['worldSha256'],'footprintSources':['sheet-plan-data.js','exportar-huellas-inventario.mjs'],'assignments':assignments,'reviewNotes':{'EB-SW':'Envolvente de La Barra/Club en manzana occidental; el paso al este separa la otra manzana.','D1-03':'La huella cruza el encuentro vial: 54.75% en la manzana asignada, 12.75% en la vecina. Corregir huella en etapa geométrica.','D3-11':'Huella extendida hacia el cerro: 36.46% en la franja asignada, 1.10% en vecina. Pertenencia por acceso/franja visible; geometría pendiente.','others':'C2-09, C3-04, D3-02, D3-04 y D3-09: desborde lateral de huella, sin intersección competidora.'}}
write(dest/'asignaciones.json',proof)
write(public/'levantamiento/cuadras.json',{'version':2,'totalPhysicalBlocks':33,'inventoryComplete':True,'inventoryDate':'2026-10-07','scope':'33 manzanas que contienen los 139 registros de edificios del modelo actual. No es un censo de todas las construcciones reales.','note':'Inventario completo; calles, banquetas y geometrías conservan sus pendientes.','source':{'provider':'INEGI','edition':'diciembre de 2025','url':subset['sourceUrl'],'file':'levantamiento/cuadras/manzanas-inegi.geojson','sha256':hashlib.sha256((dest/'manzanas-inegi.geojson').read_bytes()).hexdigest()},'numbering':'C01 histórico; C02–C33 recorrido por centroide más próximo no visitado. IDs estables después de este cierre.','counts':{'buildings':139,'unassigned':0,'duplicates':0,'publicSpaces':1,'geometryReviews':8},'map':{'image':'levantamiento/ground-reference.jpg','width':im.width,'height':im.height},'blocks':blocks})
print(f'{len(blocks)} cuadras / {len(assignments)} edificios / {sum(a["geometryReviewPending"] for a in assignments)} huellas señaladas')

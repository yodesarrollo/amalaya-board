"""Pasos 2+3: modelo visual aproximado, sin certificación topográfica.
Python 3 + Shapely 2.1. Ejecutar después de exportar-huellas-inventario.mjs.
Mantiene las fuentes y los estados históricos; produce una capa reversible.
"""
import json, math, hashlib, sys
from pathlib import Path
from shapely.geometry import Polygon, LineString, shape, mapping
from shapely.ops import unary_union, transform
from shapely.affinity import affine_transform
from shapely import constrained_delaunay_triangles, make_valid
root=Path(__file__).resolve().parents[1]; dest=root/'public/levantamiento'; out=dest/'ajuste-visual'; out.mkdir(exist_ok=True)
read=lambda p:json.loads(Path(p).read_text())
write=lambda p,d:Path(p).write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
source=read(sys.argv[1]); reg=read(dest/'cuadras.json'); calco=read(dest/'calco/cuadras-2d.json'); ref=calco['reference']
local=lambda x,y:((x+110.9547151)*97200,(29.076115-y)*110950)
def geo(p):return [-110.9547151+p[0]/97200,29.076115-p[1]/110950]
def pixel(p):
 lon,lat=geo(p);n=2**ref['tileZoom'];return [round(((lon+180)/360*n-ref['tileBounds'][0])*256,3),round(((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n-ref['tileBounds'][1])*256,3)]
def polygons(g):
 if g.is_empty:return []
 if g.geom_type=='Polygon':return [g]
 return [p for a in g.geoms for p in polygons(a)] if hasattr(g,'geoms') else []
def clean(g):return unary_union([p for p in polygons(make_valid(g).simplify(.035,preserve_topology=True)) if p.area>.06])
def rings(g):return [list(p.exterior.coords) for p in polygons(g)]
def packed(g):return [{'points':[[x,y] for x,y in list(p.exterior.coords)[:-1]],'holes':[[[x,y] for x,y in list(h.coords)[:-1]] for h in p.interiors]} for p in polygons(g)]
def triangles(g):
 result=[]
 for t in constrained_delaunay_triangles(g).geoms:
  pts=list(t.exterior.coords)[:3]
  if t.area<.0001:continue
  if (pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0])>0:pts.reverse()
  result.extend(round(v,5) for q in pts for v in q)
 return result
foot={p['id']:Polygon(p['points'],p.get('holes',[])) for p in source['plans']}
foot.update({e['id']:unary_union([Polygon(t) for t in e['triangles']]) for e in source['entries']})
# Visual comparison C21: the eastern facade exceeded the visible block edge.
# Compress X about the west edge; retain materials, details, height and courtyard.
east=foot['EB-SW'];anchor=east.bounds[0];sx=.88;affine=[sx,0,0,1,anchor*(1-sx),0]
foot['EB-SW']=affine_transform(east,affine)
legacy=next(e for e in source['entries'] if e['id']=='EB-SW')
adjustments=[{'id':'EB-SW','owners':legacy['owners'],'affine':affine,'before':packed(east),'after':packed(foot['EB-SW']),'maxDisplacementMeters':round((east.bounds[2]-east.bounds[0])*(1-sx),2),'reason':'C21: ajustar el frente oriental al borde visible de calle; se conserva el detalle del edificio. Corrección del modelo previo, no tolerancia de medición.'}]
protected=unary_union(list(foot.values())).buffer(.12,join_style=2)
# Inventory boundary is only a seed. Roof overhangs/mismatched cadastral edges
# must not create asphalt through an existing building (C12/C18 in particular).
blocks={}
for b in reg['blocks']:
 base=shape(b['boundaryLocal']); members=unary_union([foot[i] for i in b['buildingIds']])
 blocks[b['id']]=clean(unary_union([base,members.buffer(.3,join_style=2)]).buffer(.35,join_style=2).buffer(-.35,join_style=2))
# Surrounding, unmodelled blocks remain protected too: do not pave their roofs.
keys={b['cvegeo'] for b in reg['blocks']}
neighbors=[transform(local,shape(f['geometry'])) for f in read(dest/'cuadras/manzanas-inegi.geojson')['features'] if f['properties']['cvegeo'] not in keys]
block_union=unary_union([*blocks.values(),*neighbors]); scope=unary_union(list(blocks.values())).buffer(16,join_style=2)
ways={}
for name in ['osm-context.json','osm-plaza-hidalgo.json']:
 for e in read(dest/'data'/name)['elements']:
  if e.get('geometry') and e.get('tags',{}).get('highway'):ways[e['id']]=e
road_candidates=[]; paths=[]; used=[]
for ident,e in sorted(ways.items()):
 kind=e['tags']['highway'];name=e['tags'].get('name','')
 if kind=='service':continue # parking aisles are not public streets
 pts=[local(p['lon'],p['lat']) for p in e['geometry']]
 if len(pts)<2:continue
 line=LineString(pts)
 if not line.intersects(scope):continue
 pedestrian=kind in ['path','footway','pedestrian','steps']
 if pedestrian:width=2.0
 else:width=19 if kind=='primary' else 16 if kind=='tertiary' else 14
 # Width is a search envelope. Actual surface stops at the adjusted blocks.
 g=line.buffer(width/2,cap_style=2,join_style=2).intersection(scope)
 if pedestrian:paths.append(g)
 else:road_candidates.append(g)
 used.append({'osmId':ident,'name':name,'kind':kind,'searchWidthMeters':width})
road_mask=unary_union(road_candidates)
road=clean(road_mask.difference(block_union).difference(protected)).difference(protected)
walks={}; used_walk=Polygon()
for b in reg['blocks']:
 poly=blocks[b['id']]
 # Approximate 1.1 m pavement inside the outline, only at a street-facing edge.
 # Narrow/flush frontages stay narrow; natural hill edges do not get a sidewalk.
 band=poly.difference(poly.buffer(-1.1,join_style=2)).intersection(road.buffer(1.4)).difference(protected).difference(used_walk)
 walk=clean(band).difference(protected).difference(road.buffer(.02)).difference(used_walk.buffer(.02));walks[b['id']]=walk;used_walk=unary_union([used_walk,walk])
path=clean(unary_union(paths).intersection(scope).difference(block_union).difference(protected).difference(road.buffer(.02)).difference(used_walk.buffer(.02)))
path=path.difference(protected).difference(road.buffer(.02)).difference(used_walk.buffer(.02))
# The street mesh owns intersections once. Sidewalk polygons never own asphalt.
assert road.intersection(used_walk).area<1e-6
assert protected.intersection(unary_union([road,used_walk,path])).area<1e-6
surfaces=[]
for id,kind,g,y in [('vial','road',road,.025),('pasos','path',path,.045)]+[(k,'sidewalk',v,.09) for k,v in walks.items()]:
 if g.area<.06:continue
 surfaces.append({'id':id,'kind':kind,'elevation':y,'area':round(g.area,3),'polygons':packed(g),'triangles':triangles(g)})
traces=[];reviews=[]
for b in reg['blocks']:
 bid=b['id']; poly=blocks[bid]; ids=[]
 for i,ring in enumerate(rings(poly)):
  id=f'{bid}-L{i+1:02}';ids.append(id);traces.append({'id':id,'blockId':bid,'type':'limite-aproximado','status':'estimado-visual','pixels':list(map(pixel,ring))})
 for i,ring in enumerate(rings(walks[bid])):
  id=f'{bid}-P{i+1:02}';ids.append(id);traces.append({'id':id,'blockId':bid,'type':'banqueta-aproximada','status':'estimado-visual','pixels':list(map(pixel,ring))})
 old=next(r for r in calco['reviews'] if r['blockId']==bid)
 review={'blockId':bid,'status':'ajuste-visual','traceIds':ids,'roadAreaNearby':round(road.intersection(poly.buffer(16)).area,2),'sidewalkArea':round(walks[bid].area,2),'historicalGaps':old['gaps'],'note':'Contorno aproximado para montaje visual. En frentes estrechos la banqueta se reduce; bordes naturales del cerro no se convierten en calles. La oclusión se resuelve con continuidad estimada, no con medición.'}
 reviews.append(review)
 b['visualFit']={'status':'ajuste-visual','steps':[2,3],'taskStates':dict.fromkeys(['plan','street','sidewalkA','sidewalkB','corners'],'done'),'data':'levantamiento/ajuste-visual/cuadras.json','evidence':f'levantamiento/ajuste-visual/{bid}.jpg','sidewalkArea':review['sidewalkArea']}
checks={'roadBuildingOverlap':round(road.intersection(protected).area,8),'sidewalkBuildingOverlap':round(used_walk.intersection(protected).area,8),'roadSidewalkOverlap':round(road.intersection(used_walk).area,8),'buildingPairs':[{'a':a,'b':b,'area':round(foot[a].intersection(foot[b]).area,5)} for i,a in enumerate(foot) for b in list(foot)[i+1:] if foot[a].intersection(foot[b]).area>.01]}
summary={'blocks':len(reviews),'buildings':len(foot),'roadArea':round(road.area,2),'sidewalkArea':round(used_walk.area,2),'pathArea':round(path.area,2),'adjustedBuildings':len(adjustments),'checks':checks}
version='cuadras-visual-20261007';data={'version':version,'status':'ajuste-visual','landSurvey':False,'targetToleranceMeters':[.5,1],'toleranceMeaning':'Objetivo visual de ajuste, no exactitud cartográfica comprobada. Las huellas y el relieve conservan incertidumbre heredada.','reference':ref,'summary':summary,'traces':traces,'reviews':reviews,'adjustments':adjustments,'surfaces':surfaces,'sources':{'inventory':reg['source'],'osmWays':used,'baselineWorldSha256':source['worldSha256'],'footprintsSha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest()},'limits':['Representación aproximada de planta y suelo, sin levantamiento.','Ancho peatonal nominal de 1.1 m limitado por el espacio disponible; no medición ni verificación normativa.','Relieve, alturas de edificios y fachadas siguen en sus etapas originales.','La cubierta OB-01 y fachada OB-02 comparten 0.11 m² en su encuentro histórico, no es una calle atravesando un edificio.']}
write(out/'cuadras.json',data)
write(out/'superficies.geojson',{'type':'FeatureCollection','features':[{'type':'Feature','properties':{'id':s['id'],'kind':s['kind'],'status':'estimado-visual'},'geometry':mapping(transform(lambda x,y:(-110.9547151+x/97200,29.076115-y/110950),unary_union([Polygon(p['points'],p['holes']) for p in s['polygons']])))} for s in surfaces]})
# Compact runtime module excludes imagery metadata, historical descriptions and polygons.
runtime={'version':version,'summary':summary,'adjustments':adjustments,'surfaces':[{k:s[k] for k in ['id','kind','elevation','triangles']} for s in surfaces]}
(dest/'ajuste-visual-data.js').write_text('export const VISUAL_FIT = '+json.dumps(runtime,ensure_ascii=False,separators=(',',':'))+';\n')
reg['visualFitSummary']={**summary,'status':'ajuste-visual','steps':[2,3]};write(dest/'cuadras.json',reg)
print(json.dumps(summary,ensure_ascii=False))

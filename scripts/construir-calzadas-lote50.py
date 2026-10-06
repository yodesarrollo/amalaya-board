"""Rebuild batch geometry from the archived model and OSM, using Shapely 2.1.
Run with the baseline geometry export as argv[1]. No imagery is embedded in meshes.
"""
import json,sys,math,hashlib,struct
from pathlib import Path
from shapely.geometry import Polygon,LineString
from shapely.ops import unary_union
from shapely import constrained_delaunay_triangles

root=Path('public/levantamiento'); baseline=json.load(open(sys.argv[1]))
ways={}
for name in ['osm-context.json','osm-plaza-hidalgo.json']:
 for e in json.loads((root/'data'/name).read_text())['elements']:
  if e.get('geometry'): ways[e['id']]=[(round((p['lon']+110.9547151)*97200,5),round((29.076115-p['lat'])*110950,5)) for p in e['geometry']]
def way(i,a=None,b=None):return ways[i][a:b]
def quantized_triangle(v):
 v=[tuple(round(c,5) for c in p) for p in v]
 f=[tuple(struct.unpack('f',struct.pack('f',c))[0] for c in p) for p in v]
 cross=(f[1][0]-f[0][0])*(f[2][1]-f[0][1])-(f[1][1]-f[0][1])*(f[2][0]-f[0][0])
 if abs(cross)<.00001:return []
 if cross>0:v=[v[0],v[2],v[1]]
 return [c for p in v for c in p]
# Samples are curb-to-curb visual estimates. 20 m / 79 screen pixels;
# uncertainties include shadows, parked cars and the approximate OSM alignment.
specs=[
 ('RO','Rosales · Plutarco–sur del lote',way(1128404333,4,12),14,1.5,'A1/C1',[[366,420],[421,410]]),
 ('PS-N','Pino Suárez · Plutarco–Obregón',list(reversed(way(1294811485))),12.5,1.5,'A1',[[640,443],[689,435]]),
 ('PS-S','Pino Suárez · Obregón–Sufragio',list(reversed(way(996686901,2))),10.5,1.5,'C1',[[727,443],[769,439]]),
 ('SE-O','Serdán · Rosales–Yáñez',way(996686907),9.5,1.5,'A1',[[805,573],[812,611]]),
 ('OB-O','Obregón · Rosales–Pino Suárez',way(996686904),9.5,1.5,'C1',[[620,345],[624,382]]),
 ('OB-C','Obregón · Pino Suárez–Yáñez',way(28788558,0,3),7,1.3,'C1',[[842,334],[845,362]]),
 ('YA-N','Yáñez · Plutarco–Serdán',way(1295021909,0,3),8,1.5,'A1',[[939,419],[971,416]]),
 ('YA-C','Yáñez · Chihuahua–Obregón',way(1295021909,4),7.5,1.5,'C1',[[977,183],[1006,179]]),
 ('YA-S','Yáñez · Obregón–Sufragio',way(545173384),7,1.5,'C1',[[946,437],[973,434]]),
 ('CE','Callejón del Centro',way(545173385),5.5,1,'C1',[[832,506],[837,527]]),
 ('SU','Sufragio Efectivo · Pino Suárez–Yáñez',way(258733195,0,10),8,1.5,'C1',[[953,585],[961,616]]),
 ('PL','Plutarco Elías Calles · Rosales–Garmendia',way(1294811486)+way(996686906)[1:]+way(28704095,1,4),9,1.5,'A3',[[591,97],[595,132]]),
 ('GA-N50','Garmendia · Plutarco–tramo existente',list(reversed(way(83988835,4,7))),6,1.5,'A3',[[361,261],[385,258]]),
 ('AB-N','Abasolo · Serdán–Chihuahua',way(28704528,0,4),6.6,1,'A3',[[903,440],[929,438]]),
 ('SE-E50','Serdán · Guerrero–borde oriental',list(reversed(way(25757083,0,4))),10,1.5,'A3',[[1021,322],[1030,360]]),
 ('CH-E50','Chihuahua · Abasolo–borde del lote',[ways[28704525][-2],(222,-49.0)],5.21,.7,'A3',[[1040,698],[1041,719]]),
 ('OB-E50','Obregón · Abasolo–borde del lote',way(28788558,-2),5.61,.8,'A3',None),
 ('PM','Pedro Moreno / Ignacio Allende · borde occidental',way(996675499,7,17),7.5,1.5,'C1',[[371,499],[401,496]]),
 ('OB-RO','Obregón–Hidalgo · borde occidental–Rosales',way(258733179,-2),9.5,1.5,'C1',[[427,365],[431,402]]),
 ('SE-RO','Serdán · Rosales–Pedro Moreno',way(996686908),8.5,1.5,'A1',None),
]
protected=unary_union([Polygon(p['points'],p.get('holes',[])).buffer(.15,join_style=2) for p in baseline['plans']])
# Existing road, kerb and pavement surfaces own their current area. Exclude the
# generic base terrain: it is the substrate, not a competing street owner.
surface=[]; existing_roads=[]
for t in baseline['triangles']:
 name=t[10]; vs=[t[i:i+3] for i in (0,3,6)]
 if not all(-.1<=p[1]<=.4 for p in vs):continue
 if not any(s in name.lower() for s in ['calzada','calle obregón · perfil','banqueta','bordillo','pavimento peatonal','paseo b','borde b','canal de escurrimiento']):continue
 poly=Polygon([(p[0],p[2]) for p in vs])
 if poly.area<1e-8:continue
 surface.append(poly)
 if ('calzada' in name.lower() or 'Calle Obregón · perfil' in name) and not any(x in name.lower() for x in ['banqueta','paseo','borde','canal','no es una calzada']):existing_roads.append(poly)
occupied=unary_union(surface); road_union=unary_union(existing_roads)
entries=[]; new_union=Polygon()
for sid,name,points,width,tolerance,reference,pixels in specs:
 candidate=LineString(points).buffer(width/2,cap_style=2,join_style=2)
 overlap=candidate.intersection(protected).area
 geom=candidate.difference(protected).difference(occupied).difference(new_union)
 polys=list(geom.geoms) if geom.geom_type=='MultiPolygon' else [geom]
 polygons=[]; triangles=[]
 for poly in polys:
  if poly.geom_type!='Polygon' or poly.area<.02:continue
  polygons.append({'points':list(poly.exterior.coords)[:-1],'holes':[list(h.coords)[:-1] for h in poly.interiors]})
  for tri in constrained_delaunay_triangles(poly).geoms:
   v=list(tri.exterior.coords)[:3]
   cross=(v[1][0]-v[0][0])*(v[2][1]-v[0][1])-(v[1][1]-v[0][1])*(v[2][0]-v[0][0])
   if cross>0:v=[v[0],v[2],v[1]]
   triangles.extend(quantized_triangle(v))
 new_union=unary_union([new_union,geom])
 entries.append(dict(id=sid,name=name,points=points,widthMeters=width,uncertaintyMeters=tolerance,reference=reference,samplePixels=pixels,polygons=polygons,triangles=triangles,areaMeters2=geom.area,trimmedBuildingAreaMeters2=overlap))
 print(sid,round(geom.area,1),'m2, footprint trim',round(overlap,2),'m2')
assert new_union.intersection(protected).area<1e-6
assert new_union.intersection(occupied).area<1e-6
owner='Chihuahua · calzada de continuidad Amalaya'
old_polys=[]
for t in baseline['triangles']:
 if t[10]!=owner:continue
 v=[t[i:i+3] for i in (0,3,6)];p=Polygon([(q[0],q[2]) for q in v])
 if p.area>1e-8:old_polys.append(p)
original=unary_union(old_polys); revised=original.difference(protected); tri=[]
for t in constrained_delaunay_triangles(revised).geoms:
 v=list(t.exterior.coords)[:3]
 if (v[1][0]-v[0][0])*(v[2][1]-v[0][1])-(v[1][1]-v[0][1])*(v[2][0]-v[0][0])>0:v=[v[0],v[2],v[1]]
 tri.extend(quantized_triangle(v))
replacement=dict(id='CH-JOIN',owner=owner,name='Chihuahua · encuentro existente junto a B3-04',triangles=tri,removedAreaMeters2=original.area-revised.area,reason='Remove old roadway overlap with B3-04 roof footprint; building and collisions are unchanged.')
data=dict(version='street-batch50-20261006',entries=entries,replacements=[replacement],method='Approximate visual road widths; OSM centre lines; old road/paving owners retained except documented B3-04 corner repair, new junctions partitioned without duplicate asphalt.',scaleMetersPerPixel=20/79,landSurvey=False)
(root/'street-batch50-data.js').write_text('export const STREET_BATCH50 = '+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';\n')
(root/'street-batch50-geometry-report.json').write_text(json.dumps({'newAreaMeters2':new_union.area,'buildingOverlapMeters2':new_union.intersection(protected).area,'existingSurfaceOverlapMeters2':new_union.intersection(occupied).area,'replacements':[{k:v for k,v in replacement.items() if k!='triangles'}],'segments':[{k:v for k,v in e.items() if k not in ['triangles','polygons']} for e in entries]},ensure_ascii=False,indent=2)+'\n')

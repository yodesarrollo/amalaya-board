"""Bounded C08 ground review. Rebuild from the published point-1 baseline.
Only the reviewed perimeter and its Juan Alvarez pedestrian connection change.
Dimensions remain visual estimates; Street View images are retained with attribution.
"""
import json, math, subprocess, sys
from pathlib import Path
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union, triangulate
from shapely import constrained_delaunay_triangles

ROOT=Path(__file__).resolve().parents[1]
P=ROOT/'public/levantamiento'
BASE='300c61589fdb21baad0a391cf704dec4c2d7802a'
def original(path):
    return json.loads(subprocess.check_output(['git','show',BASE+':public/levantamiento/'+path],cwd=ROOT))
fit=original('ajuste-visual/cuadras.json')
def polys(g):
    return [] if g.is_empty else [g] if g.geom_type=='Polygon' else [p for p in g.geoms if p.geom_type=='Polygon']
def geom(s):
    return unary_union([Polygon(p['points'],p.get('holes',[])) for p in s['polygons']])
def pack(s,g):
    assert g.is_valid
    s['polygons']=[dict(points=list(p.exterior.coords)[:-1],holes=[list(h.coords)[:-1] for h in p.interiors]) for p in polys(g)]
    ts=[t for p in polys(g) for t in constrained_delaunay_triangles(p).geoms]
    assert abs(sum(t.area for t in ts)-g.area)<1e-5
    s['triangles']=[round(v,6) for t in ts for q in list(t.exterior.coords)[:3] for v in q]
    s['area']=round(g.area,3)
    return s

old=next(s for s in fit['surfaces'] if s['id']=='C08')
old_ground=geom(old)
outer=Polygon(old['polygons'][0]['points'])
ring=list(outer.exterior.coords)[:-1]
# Existing registered street edge retained. Round only the sharp mathematical
# corners; photos NW/SW show rounded returns, not five square mitres.
rounded=outer.buffer(-.55,join_style=1).buffer(.55,join_style=1,quad_segs=4)
# Independent visible widths for the five perimeter segments, in original order:
# west lower, Sufragio, east, Obregon, west upper. Not surveyed widths.
widths=[1.15,1.45,1.25,1.50,1.10]
inner=outer
for (a,b),width in zip(zip(ring,ring[1:]+ring[:1]),widths):
    dx,dz=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dz)
    normal=(-dz/length,dx/length)
    if (outer.centroid.x-a[0])*normal[0]+(outer.centroid.y-a[1])*normal[1]<0:normal=(-normal[0],-normal[1])
    start=(a[0]-dx/length*1000+normal[0]*width,a[1]-dz/length*1000+normal[1]*width)
    end=(b[0]+dx/length*1000+normal[0]*width,b[1]+dz/length*1000+normal[1]*width)
    inner=inner.intersection(Polygon([start,end,(end[0]+normal[0]*1000,end[1]+normal[1]*1000),(start[0]+normal[0]*1000,start[1]+normal[1]*1000)]))
sidewalk=rounded.difference(inner)
# Close the thin artificial gaps between the perimeter slab and the reviewed
# frontages. Only front strips are connected; rear yards are never infilled.
def frontage_strip(points,edge):
    line=LineString(edge)
    from shapely.geometry import Point
    q=[line.interpolate(line.project(Point(*p))) for p in [points[-1],points[0]]]
    return Polygon(points+[(p.x,p.y) for p in q]).intersection(rounded)
sidewalk=sidewalk.union(frontage_strip([(-85.25,33.49),(-53.93,29.79),(-36.99,27.95),(-21.213,27.232)],[ring[4],ring[3]]))
for points in [[(-21.213,27.232),(-18.605,38.674)],[(-17.041,44.915),(-12.088,66.498)]]:
    sidewalk=sidewalk.union(frontage_strip(points,[ring[3],ring[2]]))
# The street-level NE and SE references confirm a paved pedestrian corridor.
# These endpoints use the already registered opposing curb edges, not a buffer
# extrapolated along an unobserved street.
east=Polygon([ring[3],ring[2],[-2.34373,69.24625],[-11.31932,23.43408]])
# Ramp next to C2-01's eastern facade, explicitly visible with blue railing in NE.
# Its dimensions and slope are visual interpretation, not accessibility compliance.
a=(-21.213,27.232);b=(-18.605,38.674)
dx,dz=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dz)
n=(dz/length,-dx/length)
def on(t,offset):return (a[0]+dx*t+n[0]*offset,a[1]+dz*t+n[1]*offset)
ramp=Polygon([on(.10,.03),on(.70,.03),on(.70,1.08),on(.10,1.08)])
raw=json.loads(Path(sys.argv[1]).read_text())
buildings=unary_union([Polygon(p['points'],p.get('holes',[])) for p in raw['plans']]+[Polygon(t) for e in raw['entries'] for t in e['triangles']])
ramp=ramp.difference(buildings)
sidewalk=sidewalk.difference(ramp).difference(buildings)
east=east.difference(ramp).difference(buildings).difference(sidewalk)
road=next(s for s in fit['surfaces'] if s['kind']=='road')
# Remove the asphalt only below the documented corridor/ramp, and fill tiny
# corners released by the rounded curb. Other streets retain their geometry.
newroad=geom(road).union(outer.difference(rounded)).difference(east.union(ramp)).difference(buildings)
pack(road,newroad)
pack(old,sidewalk)
old['review']='C08 punto 2 · perímetro contrastado con Street View diciembre 2023'
old['curbEdges']=[]
east_line=LineString([ring[2],ring[3]])
for p,q in zip(list(rounded.exterior.coords),list(rounded.exterior.coords)[1:]):
    # Flush connection with pedestrian Juan Alvarez: no curb across its entrance.
    if LineString([p,q]).distance(east_line)<.08:continue
    old['curbEdges'].append([list(p),list(q),.025,.09])
path=pack(dict(id='C08-peatonal',kind='path',elevation=.09,color='#c8c2b4',review='NE y SE · Juan Álvarez peatonal'),east)
r=pack(dict(id='C08-rampa',kind='path',elevation=.09,color='#c2beb4',review='NE · rampa adosada a fachada'),ramp)
def ramp_y(x,z):
    t=((x-a[0])*dx+(z-a[1])*dz)/(length*length)
    return round(.09+.21*max(0,min(1,(.70-t)/.60)),6)
r['elevations']=[ramp_y(*r['triangles'][i:i+2]) for i in range(0,len(r['triangles']),2)]
r['curbEdges']=[[list(p),list(q),.09,ramp_y(*p),ramp_y(*q)] for p,q in zip(list(ramp.exterior.coords),list(ramp.exterior.coords)[1:])]
fit['surfaces'] += [path,r]
fit['version']='c08-banquetas-esquinas-20261008'
fit['section2Review']=dict(block='C08',sourceDate='2023-12',baselineCommit=BASE,visualOnly=True,
    perimeterWidths=widths,curbHeight=.09,rampRise=.21,estimatedDimensions=True,
    changedSurfaceIds=['C08','vial','C08-peatonal','C08-rampa'],
    notes=['Cuatro frentes y cuatro encuentros contrastados.','Juan Álvarez peatonal: retirada la franja de asfalto bajo el corredor.',
    'Guarnición visible, esquinas suavizadas, remates hasta fachadas y conexión oriental sin bordillo transversal.',
    'Solo se modela la rampa visible en NE. No se infieren rebajes ocultos por vehículos.',
    'Patio y estacionamiento conservan su superficie y sus accesos; sin losa nueva interior.'])
fit['summary']['sidewalkArea']=round(sum(s['area'] for s in fit['surfaces'] if s['kind']=='sidewalk'),3)
(P/'ajuste-visual/cuadras.json').write_text(json.dumps(fit,ensure_ascii=False,separators=(',',':'))+'\n')
runtime=json.loads((P/'ajuste-visual-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
runtime.update(version=fit['version'],surfaces=fit['surfaces'],summary=fit['summary'])
(P/'ajuste-visual-data.js').write_text('export const VISUAL_FIT = '+json.dumps(runtime,ensure_ascii=False,separators=(',',':'))+';\n')
print(json.dumps(dict(sidewalkArea=sidewalk.area,pedestrianArea=east.area,rampArea=ramp.area,buildingOverlap=sidewalk.union(east).union(ramp).intersection(buildings).area)))

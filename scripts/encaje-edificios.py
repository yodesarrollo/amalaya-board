"""Fit buildings against independently reviewed block edges, never carve roads around them."""
import json, math
from pathlib import Path
from shapely.geometry import Polygon, shape
from shapely.ops import unary_union
from shapely.affinity import affine_transform
from scipy.optimize import minimize, differential_evolution

def fit_buildings(source, registry, directory):
 reference=json.loads((directory/'encaje-edificios-referencia.json').read_text())
 blocks={b['id']:shape(b['boundaryLocal']) for b in registry['blocks']}
 for bid,e in reference['blockOverrides'].items():blocks[bid]=Polygon(e['points'])
 membership={i:b['id'] for b in registry['blocks'] for i in b['buildingIds']}
 foot={};adjustments=[];plans=[];audit=[];inset=reference['curbInsetMeters']
 def packed(g):
  polys=[g] if g.geom_type=='Polygon' else list(g.geoms)
  return [{'points':list(p.exterior.coords)[:-1],'holes':[list(h.coords)[:-1] for h in p.interiors]} for p in polys if p.geom_type=='Polygon' and p.area>.01]
 def row(ident,before,after,action):
  block=blocks[membership[ident]]
  audit.append({'id':ident,'blockId':membership[ident],'action':action,'areaBefore':round(before.area,4),'areaAfter':round(after.area,4),'outsideBefore':round(before.difference(block).area,6),'outsideAfter':round(after.difference(block).area,6),'boundarySource':'reviewed-image' if membership[ident] in reference['blockOverrides'] else 'INEGI plus image review','evidence':'levantamiento/ajuste-visual/'+membership[ident]+'-modelo.jpg'})
 for p in source['plans']:
  ident=p['id'];before=Polygon(p['points'],p.get('holes',[]));after=before;reason='Conservado tras contraste con imagen y límite de calle.'
  if ident in reference['planOverrides']:
   override=reference['planOverrides'][ident];after=Polygon(override['points'],override.get('holes',[]));reason=override['reason']
  block=blocks[membership[ident]]
  if after.difference(block.buffer(-.15,join_style=2)).area>.01:
   after=after.intersection(block.buffer(-inset,join_style=2));reason='Corregir el contorno que invadía el frente vial; el límite de calle permanece fijo.'
  if after.is_empty or after.area<before.area*.35:raise ValueError('Ajuste excesivo: '+ident)
  parts=packed(after)
  if len(parts)!=1:raise ValueError('La corrección divide el edificio: '+ident)
  if not after.equals(before):plans.append({'id':ident,**parts[0],'before':packed(before),'reason':reason})
  foot[ident]=after;row(ident,before,after,'contorno-corregido' if not after.equals(before) else 'conservado')
 def fit_affine(g,allowed):
  if g.difference(allowed).area<.001:return [1,0,0,1,0,0]
  cx,cz=g.centroid.coords[0];width=g.bounds[2]-g.bounds[0];height=g.bounds[3]-g.bounds[1]
  def matrix(v):sx,sz,dx,dz=v;return [sx,0,0,sz,cx*(1-sx)+dx,cz*(1-sz)+dz]
  def cost(v):return v[2]**2+v[3]**2+((1-v[0])*width)**2+((1-v[1])*height)**2
  from shapely.geometry.polygon import orient
  hull=orient(allowed.convex_hull,sign=1);edges=list(hull.exterior.coords);points=[q for p in packed(g) for q in p['points']]
  def constraints(v):
   sx,_,_,sz,tx,tz=matrix(v)
   return [(b[0]-a[0])*(sz*z+tz-a[1])-(b[1]-a[1])*(sx*x+tx-a[0]) for a,b in zip(edges,edges[1:]) for x,z in points]
  opt=minimize(cost,[1,1,0,0],method='SLSQP',bounds=[(.75,1),(.75,1),(-12,12),(-12,12)],constraints={'type':'ineq','fun':constraints},options={'maxiter':300,'ftol':1e-9})
  v=opt.x
  if affine_transform(g,matrix(v)).difference(allowed).area>.001:
   opt=differential_evolution(lambda v:cost(v)+affine_transform(g,matrix(v)).difference(allowed).area*100000,[ (.75,1),(.75,1),(-12,12),(-12,12)],seed=7,tol=.00001,maxiter=300,popsize=12);v=opt.x
  result=matrix(v)
  if affine_transform(g,result).difference(allowed).area>.01:raise ValueError('No cabe el volumen conservando su arquitectura')
  return result
 for e in source['entries']:
  ident=e['id'];before=unary_union([Polygon(t) for t in e['triangles']]);afterparts=[]
  for part in e['parts']:
   original=unary_union([Polygon(t) for t in part['triangles']]);base=[1,0,0,1,0,0]
   # Retain the reviewed eastern-body width, but fit the detached west volume separately.
   if ident=='EB-SW' and part['owner'].startswith('Club Obregón'):
    anchor=before.bounds[0];base=[.88,0,0,1,anchor*.12,0]
   current=affine_transform(original,base);allowed=blocks[membership[ident]].buffer(-inset,join_style=2)
   delta=fit_affine(current,allowed) if current.difference(blocks[membership[ident]].buffer(-.15,join_style=2)).area>.01 else [1,0,0,1,0,0]
   affine=[delta[0]*base[0],0,0,delta[3]*base[3],delta[0]*base[4]+delta[4],delta[3]*base[5]+delta[5]]
   after=affine_transform(original,affine);afterparts.append(after)
   if affine!=[1,0,0,1,0,0]:
    points=[p for poly in packed(original) for p in poly['points']];displacement=max(math.hypot(affine[0]*x+affine[4]-x,affine[3]*z+affine[5]-z) for x,z in points)
    adjustments.append({'id':ident,'owners':[part['owner']],'affine':affine,'before':packed(original),'after':packed(after),'maxDisplacementMeters':round(displacement,3),'reason':'Encaje contra límite vial independiente; conserva caras, alturas y detalle del volumen.'})
  after=unary_union(afterparts);foot[ident]=after;row(ident,before,after,'volumen-ajustado' if any(a['id']==ident for a in adjustments) else 'conservado')
 assert len(audit)==139
 if any(e['outsideAfter']>.001 for e in audit):raise ValueError('Quedan invasiones de frente vial: '+str([e for e in audit if e['outsideAfter']>.001]))
 return foot,blocks,adjustments,plans,audit,reference

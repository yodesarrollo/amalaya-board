"""Clip existing sidewalk triangles only where reviewed building footprints now stand.
Does not change or invent road centerlines. Aerial/Street View controls are in paramento-data.js.
"""
import json,subprocess
from pathlib import Path
from shapely.geometry import Polygon
from shapely.ops import unary_union,triangulate
root=Path(__file__).resolve().parents[1]
raw=subprocess.check_output(['node','--input-type=module','-e',"import {FRONT_BUILDINGS,ROUND2_BUILDINGS,JOIN_REVIEWS} from './public/levantamiento/paramento-data.js';import {SHEET_PLANS} from './public/levantamiento/sheet-plan-data.js';import {VISUAL_FIT} from './public/levantamiento/ajuste-visual-data.js';console.log(JSON.stringify({front:[...FRONT_BUILDINGS,...ROUND2_BUILDINGS],joins:JOIN_REVIEWS,plans:SHEET_PLANS,fit:VISUAL_FIT}));"],cwd=root)
d=json.loads(raw);polys=[Polygon(b['points']) for b in d['front']]
for change in d['joins']:
 if any(p['id']==change['id'] for p in d['front']):continue
 p=next((x for x in d['fit']['planCorrections'] if x['id']==change['id']),None) or next(x for x in d['plans'] if x['id']==change['id'])
 points=[list(p) for p in p['points']]
 for v in change['vertices']:points[v['index']]=v['point']
 poly=Polygon(points)
 if not poly.is_valid:raise ValueError(change['id']+' invalid footprint')
 polys.append(poly)
cut=unary_union([p.buffer(.13,join_style=2) for p in polys]);out=[]
for s in d['fit']['surfaces']:
 if s['kind']!='sidewalk':continue
 ts=s['triangles'];g=unary_union([Polygon([(ts[j],ts[j+1]) for j in range(i,i+6,2)]) for i in range(0,len(ts),6)])
 if g.intersection(cut).area<.001:continue
 after=g.difference(cut)
 tris=[t for t in triangulate(after) if after.covers(t.representative_point()) and t.intersection(after).area>t.area-.00001]
 out.append({'id':s['id'],'removedArea':round(g.area-after.area,3),'triangles':[round(v,6) for t in tris for p in list(t.exterior.coords)[:3] for v in p]})
(root/'public/levantamiento/paramento-sidewalks.js').write_text('export const PARAMENTO_SIDEWALKS='+json.dumps(out,separators=(',',':'))+';\n')
print('Reviewed sidewalks:',[(p['id'],p['removedArea']) for p in out])

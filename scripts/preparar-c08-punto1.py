"""Apply the bounded C08 footprint review; all coordinates come from the retained aerial.
Run before preparing the visual-fit runtime and exporting the after footprints.
"""
import json, math
from pathlib import Path
from shapely.geometry import Polygon

root = Path(__file__).resolve().parents[1]
p = root / 'public/levantamiento'
fit_path = p / 'ajuste-visual/cuadras.json'
fit = json.loads(fit_path.read_text())
# Pixel frame of the original 2816x2304 Esri reference, not a resized screenshot.
pixels = [[918,1134],[971,1128],[972,1112],[1016,1107],
          [1019,1148],[1010,1150],[1012,1172],[922,1180]]
ref = fit['reference']
def local(pixel):
    x,y = pixel; n = 2 ** ref['tileZoom']
    lng = (ref['tileBounds'][0] + x/256) / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1-2*(ref['tileBounds'][1]+y/256)/n))))
    return [round((lng+110.9547151)*97200,6),round((29.076115-lat)*110950,6)]
points = [local(q) for q in pixels]
assert Polygon(points).is_valid
before = [[-61.362,51.155],[-36.594,48.295],[-35.03,57.138],[-60.319,59.217]]
existing = next((c for c in fit['planCorrections'] if c['id']=='C2-03'),None)
if existing:
    before = existing['before'][0]['points']
else:
    # The unmodified source footprint, preserved independently of the runtime.
    text = (p/'sheet-plan-data.js').read_text()
    plans = json.loads(text.split('=',1)[1].strip().rstrip(';'))
    before = next(b['points'] for b in plans if b['id']=='C2-03')
change = dict(id='C2-03',points=points,holes=[],before=[dict(points=before,holes=[])],
    reason='C08 punto 1: contorno interior desplazado; restituir el brazo norte y orientar la cubierta según la imagen aérea conservada. Altura heredada, sin medir.',
    sourcePixels=pixels,sourceImage=ref['image'],sourceImageSha256=ref['imageSha256'])
fit['planCorrections'] = [c for c in fit['planCorrections'] if c['id']!='C2-03']+[change]
fit['version'] = 'c08-planta-calle-20261008'
audit=next(a for a in fit['buildingAudit'] if a['id']=='C2-03')
audit.update(action='contorno-corregido',areaBefore=round(Polygon(before).area,4),areaAfter=round(Polygon(points).area,4),
    evidence='levantamiento/evidence/c08-punto1-20261008/index.html',reason=change['reason'])
fit['summary']['adjustedBuildings'] = len(set(c['id'] for c in fit['adjustments']+fit['planCorrections']))
fit_path.write_text(json.dumps(fit,ensure_ascii=False,separators=(',',':'))+'\n')
runtime = json.loads((p/'ajuste-visual-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
runtime.update(version=fit['version'],summary=fit['summary'],planCorrections=fit['planCorrections'])
(p/'ajuste-visual-data.js').write_text('export const VISUAL_FIT = '+json.dumps(runtime,ensure_ascii=False,separators=(',',':'))+';\n')
reg_path=p/'cuadras.json';reg=json.loads(reg_path.read_text())
reg['visualFitSummary']=fit['summary']|dict(status='ajuste-visual',steps=[2,3])
reg_path.write_text(json.dumps(reg,ensure_ascii=False,separators=(',',':'))+'\n')
print('C08: corregido C2-03; demás plantas, alturas y calles conservadas.')

"""Create a per-block checkpoint from actual scene geometry and retained references.
Arguments: before-footprints after-footprints before-scene after-scene references-json before-renders after-renders.
"""
import hashlib, json, math, shutil, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union

ROOT=Path(__file__).resolve().parents[1];P=ROOT/'public/levantamiento'
OUT=P/'evidence/c08-punto2-20261008';OUT.mkdir(exist_ok=True)
REL='levantamiento/evidence/c08-punto2-20261008/'
args=[Path(a) for a in sys.argv[1:]]
BASE='300c61589fdb21baad0a391cf704dec4c2d7802a'
old=json.loads(subprocess.check_output(['git','show',BASE+':public/levantamiento/ajuste-visual/cuadras.json'],cwd=ROOT))
new=json.loads((P/'ajuste-visual/cuadras.json').read_text())
reg=json.loads((P/'cuadras.json').read_text());block=next(b for b in reg['blocks'] if b['id']=='C08')
def footprints(path):
    d=json.loads(path.read_text());f={p['id']:Polygon(p['points'],p.get('holes',[])) for p in d['plans']}
    f.update({e['id']:unary_union([Polygon(t) for t in e['triangles']]) for e in d['entries']});return f
before,after=map(footprints,args[:2]);assert all(before[k].equals(after[k]) for k in before)
occupied=unary_union(list(after.values()))
scene_before,scene_after=[json.loads(p.read_text()) for p in args[2:4]]
assert scene_before['colliders']==scene_after['colliders'],'No building collider moves during sidewalk review'
def surface(s):return unary_union([Polygon(p['points'],p.get('holes',[])) for p in s['polygons']])
def collection(data,kind):return unary_union([surface(s) for s in data['surfaces'] if s['kind']==kind])
road=collection(new,'road');walk=unary_union([surface(s) for s in new['surfaces'] if s['id'].startswith('C08')])
assert walk.intersection(road).area<1e-5
assert walk.intersection(occupied).area<1e-5
unchanged=[]
for s in old['surfaces']:
    if s['id'] in ['C08','vial']:continue
    assert s==next(t for t in new['surfaces'] if t['id']==s['id']);unchanged.append(s['id'])
changed_ground=collection(old,'road').symmetric_difference(road)
assert changed_ground.difference(box(-98,20,1,98)).area<1e-5,'Ground change outside C08'
parking=[[-77,57],[-74,74],[-51,72]]
assert not any(walk.covers(Point(*p)) for p in parking)
ref=new['reference'];font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
im=Image.open(ROOT/'public'/ref['image']).convert('RGBA')
def px(x,z):
    n=2**ref['tileZoom'];lng=-110.9547151+x/97200;lat=29.076115-z/110950
    return (((lng+180)/360*n-ref['tileBounds'][0])*256,((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n-ref['tileBounds'][1])*256)
crop=(724,972,1169,1417)
def paint(data):
    layer=Image.new('RGBA',im.size);draw=ImageDraw.Draw(layer)
    for s in data['surfaces']:
        if s['id']!='C08' and not s['id'].startswith('C08-'):continue
        color=(30,205,157,210) if s['id']=='C08' else (60,166,238,210) if s['id']=='C08-peatonal' else (244,169,53,230)
        for p in s['polygons']:
            draw.polygon([px(*q) for q in p['points']],fill=color)
            for h in p['holes']:draw.polygon([px(*q) for q in h],fill=(0,0,0,0))
    return Image.alpha_composite(im,layer).convert('RGB').crop(crop).resize((1000,1000))
paint(old).save(OUT/'antes.jpg',quality=89,optimize=True)
paint(new).save(OUT/'despues.jpg',quality=89,optimize=True)
im.convert('RGB').crop(crop).resize((1000,1000)).save(OUT/'referencia.jpg',quality=89,optimize=True)
refs=json.loads(args[4].read_text())
for r in refs:
    source=args[4].parent/r['file'];shutil.copyfile(source,OUT/r['file']);r['file']=REL+r['file']
for source,prefix in [(args[5],'antes'),(args[6],'despues')]:
    for name in ['cuadra','peatonal']:shutil.copyfile(source/(name+'-3d.jpg'),OUT/(prefix+'-'+name+'-3d.jpg'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
summary='Banquetas de los cuatro frentes revisadas; Juan Álvarez conectado como corredor peatonal, rampa visible junto a C2-01 y guarniciones con caras verticales. Edificios y estacionamiento conservados.'
record=dict(schemaVersion=1,scope='block',building=None,block='C08',section=2,tasks=['sidewalkA','sidewalkB','corners'],status='done',approval='visual-approximate',reviewedAt='2026-10-08',baselineCommit=BASE,
    members=block['buildingIds'],summary=summary,reference=ref,streetView=refs,
    camera=dict(type='orthographic-plan',sourcePixelBox=list(crop),outputSize=[1000,1000],sameBeforeAfter=True),
    cameras3D=[dict(id='cuadra',latitude=29.07520,longitude=-110.95445,heading=310,fov=65,pitch=-48,eye=90),dict(id='peatonal',latitude=29.0759358,longitude=-110.9548665,heading=225,fov=90,pitch=-20,eye=2.5)],
    images={k:dict(url=REL+k+'.jpg',sha256=sha(OUT/(k+'.jpg'))) for k in ['antes','referencia','despues']},
    files={p.name:sha(p) for p in OUT.glob('*.jpg')},
    geometry=dict(before=[s for s in old['surfaces'] if s['id']=='C08'],after=[s for s in new['surfaces'] if s['id'].startswith('C08')]),
    checks=dict(unchangedBuildings=len(before),changedBuildings=[],buildingCollidersUnchanged=True,unchangedSurfaceIds=unchanged,roadSidewalkOverlap=round(walk.intersection(road).area,8),buildingSidewalkOverlap=round(walk.intersection(occupied).area,8),parkingSamples=parking,parkingSamplesFree=True,changesWithinC08=True),
    groundReview=new['section2Review'],worldSha256=sha(P/'world.js'),
    limits=['Cierre visual, no medición topográfica ni verificación de accesibilidad normativa.','Street View: diciembre de 2023. La referencia aérea conservada es anterior a esta revisión.',
    'Se conserva el borde vial registrado: las anchuras, radios y cotas siguen siendo estimaciones visuales.',
    'Vehículos y arbolado ocultan partes de las guarniciones. No se añaden rampas supuestas en esos tramos.',
    'La barandilla azul sirve de referencia para la rampa. El equipamiento y las fachadas corresponden a secciones posteriores.'],
    next=dict(block='C08',section=3,name='Edificios y volúmenes',status='pending'))
(OUT/'registro.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
block['sectionReviews']['2']=dict(state='done',reviewedAt=record['reviewedAt'],summary=summary,record=REL+'registro.json',comparison=REL+'index.html',evidence=dict(before=REL+'antes.jpg',reference=REL+'referencia.jpg',after=REL+'despues.jpg'),worldSha256=record['worldSha256'])
block['visualFit']['sidewalkArea']=next(s['area'] for s in new['surfaces'] if s['id']=='C08')
reg['workPlan'].update(completedSection=2,nextSection=3,title='C08 · puntos 1 y 2 cerrados visualmente',detail='Planta, calle, banquetas y esquinas con evidencia por cuadra. Siguiente: punto 3, edificios y volúmenes de C08. Se conserva lo ya corregido.')
(P/'cuadras.json').write_text(json.dumps(reg,ensure_ascii=False,separators=(',',':'))+'\n')
cards=''.join('<figure><a href="'+f+'"><img loading="lazy" src="'+f+'" alt="'+label+'"></a><figcaption>'+label+'</figcaption></figure>' for f,label in [('antes.jpg','Antes · franja uniforme'),('referencia.jpg','Referencia aérea conservada'),('despues.jpg','Después · banquetas y conexión peatonal')])
views=''.join('<figure><img loading="lazy" src="'+prefix+'-'+name+'-3d.jpg" alt="'+label+'"><figcaption>'+label+'</figcaption></figure>' for name in ['cuadra','peatonal'] for prefix,label in [('antes','Antes · '+name),('despues','Después · '+name)])
observations={'NW':'Esquina del estacionamiento: banqueta continua y retorno suavizado. No se crea un acceso vehicular en la esquina.','Acceso':'Frente oeste norte: murete y guarnición continuos; se conserva la banqueta.','Porton':'Frente oeste medio: vehículos ocultan el bordillo; no se inventa un rebaje.','Oeste':'Frente oeste sur: banqueta estrecha junto al muro; sin ampliar sobre el estacionamiento.','SW':'Sufragio–Yáñez: retorno de guarnición. El acceso visible y sus cotas no se convierten en una rampa supuesta.','SE':'Sufragio–Juan Álvarez: conexión con el corredor peatonal; se retira el asfalto ficticio de su interior.','NE':'Obregón–Juan Álvarez: corredor peatonal y rampa junto a fachada visibles. La pendiente reproducida es aproximada.'}
photos=''.join('<figure><img loading="lazy" src="'+Path(r['file']).name+'" alt="Street View '+r['id']+' diciembre 2023"><figcaption>'+observations[r['id']]+'</figcaption></figure>' for r in refs)
html='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C08 · Banquetas y esquinas</title><style>body{font:16px/1.55 system-ui;margin:auto;max-width:1500px;padding:24px;background:#f6f7f2;color:#244233}h1{line-height:1.2}a{color:#215e49}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.pairs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}figure{margin:0 0 18px}img{width:100%;border-radius:12px}figcaption{font-weight:600}.ok{background:#dcebd8;padding:18px;border-radius:12px}.note{color:#566958}@media(max-width:700px){.grid,.pairs{grid-template-columns:1fr}body{padding:16px}}</style><body><a href="../../../seguimiento-3d.html?cuadra=C08">← C08 en Amalaya</a><h1>C08 · Punto 2 · Banquetas y esquinas</h1><p class="ok"><strong>🟢 Cierre visual del punto 2.</strong> '''+summary+'''</p><div class="grid">'''+cards+'''</div><p>Verde: banqueta. Azul: corredor peatonal de Juan Álvarez. Naranja: rampa documentada. La planta utiliza la geometría del modelo; no modifica la fotografía.</p><h2>Modelo anterior y corregido</h2><div class="pairs">'''+views+'''</div><p class="note">Triángulos reales del modelo, renderizados con profundidad desde cámaras idénticas. El color y las cotas son aproximados; no es una fotografía ni prueba de recorrido WebGL.</p><h2>Contraste de los frentes y encuentros</h2><div class="pairs">'''+photos+'''</div><p class="note">Referencias Street View de diciembre de 2023, con atribución preservada. Anchuras, radios y alturas son estimaciones; los bordes ocultos no certifican presencia o ausencia de rebajes. No se añaden rampas sin respaldo visual.</p><p>🟢 1. Planta y calle · 🟢 2. Banquetas y esquinas · 🔴 3. Edificios y volúmenes · 🔴 4. Fachadas y acabados · 🔴 5. Equipamiento y cierre.</p><p><strong>Siguiente: punto 3 de C08.</strong></p><p><a href="registro.json">Registro y fuentes</a> · <a href="../c08-punto1-20261008/index.html">Conservar la comparación del punto 1</a></p></body></html>'''
(OUT/'index.html').write_text(html)
print(json.dumps(record['checks'],ensure_ascii=False))

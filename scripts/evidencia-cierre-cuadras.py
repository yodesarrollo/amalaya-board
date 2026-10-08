"""One compact evidence packet per block, sharing photos and render pairs.
Run only after inspecting the actual model renders and retained Street View.
"""
import hashlib, json, shutil, sys
from pathlib import Path
from html import escape
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union

ROOT=Path(__file__).resolve().parents[1]; P=ROOT/'public/levantamiento'
WORK=Path(sys.argv[1]);reg=json.loads((P/'cuadras.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
old=json.loads((WORK/'cierre-antes-huellas.json').read_text());new=json.loads((WORK/'cierre-final-huellas.json').read_text())
for a in old['plans']:
 b=next(p for p in new['plans'] if p['id']==a['id'])
 assert a['points']==b['points'] and a.get('holes',[])==b.get('holes',[]),'No retracing of the reviewed sheet footprints'
worldhash=sha(P/'world.js')
validation=json.loads((WORK/'cierre-validacion.json').read_text())
assert validation['worldSha256']==worldhash and validation['finiteGeometry']
assert validation['roadMeshIntrusions']==0 and validation['roadColliderIntrusions']==0
sections={1:('Planta y calle',['plan','street']),2:('Banquetas y esquinas',['sidewalkA','sidewalkB','corners']),3:('Edificios y volúmenes',['identity','volume']),4:('Fachadas y acabados',['facade','finish']),5:('Equipamiento y cierre',['equipment','qa'])}
descriptions={
 'C08':{3:'Se conservan las cinco plantas. C2-01 mantiene un nivel; C2-02 y el cuerpo interior C2-03 reciben alturas visuales diferenciadas. OB-01 y OB-02 conservan su reconstrucción anterior.',4:'Paños grises con marcos pardos en la esquina, frente azul claro hacia Sufragio, puertas y rejas; cuerpo interior sin ventanas supuestas. Muros sin techo alrededor del estacionamiento.',5:'Barandilla azul junto a la rampa, cerramiento oeste y fachada histórica sur con acceso abierto. Patio y calles libres; detalles agrupados por material.'},
 'C30':{1:'Las siete huellas registradas y los patios se conservan. Se contrasta el borde completo con la referencia aérea y se comprueba la ausencia de invasiones de calzada.',2:'Se revisan los encuentros visibles de Serdán, Garmendia, Yáñez y Obregón. Se conserva el suelo anterior; no se añaden banquetas ni rebajes donde no existe respaldo visual.',3:'Siete edificios revisados. Se diferencian el cuerpo de dos niveles de Obregón, los cuerpos bajos de Garmendia y la estructura abierta de Serdán; alturas estimadas, sin medición de campo.',4:'Se sustituyen los arcos genéricos uniformes por tres frentes de Obregón. Se añaden los rasgos visibles del banco, estructura abierta, cortina y ventanas de Garmendia; laterales ocultos permanecen neutros.',5:'Acceso escalonado y barandal visibles del banco, conservación del paseo y patios. Comprobación de geometría, rutas de navegación y carga ligera; sin inventar mobiliario en zonas ocultas.'}}
limits=['Cierre visual aproximado, no levantamiento topográfico ni restitución métrica.','Street View: diciembre de 2023; no acredita cambios posteriores.','Cotas y ejes de vanos se interpretan visualmente. Cámaras de contraste aproximadas, no calibración fotogramétrica.','Fachadas ocultas, interiores, anuncios, instalaciones y detalles ornamentales finos no se restituyen.','Los nombres heredados del inventario no certifican ocupante, propiedad ni uso actual.']

for bid,number in [('C08',1),('C30',8)]:
 block=next(b for b in reg['blocks'] if b['id']==bid);folder=f'{bid.lower()}-cierre-20261008';out=P/'evidence'/folder;out.mkdir(exist_ok=True)
 rel='levantamiento/evidence/'+folder+'/'
 packet=json.loads((WORK/(bid.lower()+'-paquete')/'paquete.json').read_text());assert packet['worldSha256']==worldhash
 scene=json.loads((WORK/(bid.lower()+'-paquete')/'escena.json').read_text())
 if bid=='C08':
  before=WORK/'cierre-antes';after=WORK/'c08-paquete/renders';views=['cuadra','NE','SE','sur']
  refs=json.loads((P/'evidence/c08-punto2-20261008/registro.json').read_text())['streetView']
  for r in refs:r['file']=str(ROOT/'public'/r['file'])
  refs.append(dict(id='sur-cerramiento',file='/workspace/scratch/c08-sur-cerramiento-20261008.jpg',date='dic 2023',url='https://www.google.com/maps/@29.0753114,-110.9553652,207a,75y,70t/data=!3m7!1e1!3m5!1s1vmV-2oXawxaQFLv2LCpuw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D20%26panoid%3D1vmV-2oXawxaQFLv2LCpuw%26yaw%3D0!7i16384!8i8192?entry=ttu'))
  # The original source is retained once; each section references the same files.
  reference=P/'evidence/c08-punto1-20261008/referencia.jpg'
  before_scene=json.loads((WORK/'cierre-antes-escena.json').read_text());first=3
 else:
  before=WORK/'c30-antes';after=WORK/'c30-paquete/renders';views=['cuadra','obregon','serdan','garmendia']
  refs=json.loads(Path('/workspace/scratch/c30-referencias-20261008.json').read_text())
  for r in refs:r['file']='/workspace/scratch/'+r['file']
  reference=P/'cuadras/C30-inventario.jpg';before_scene=json.loads((WORK/'c30-antes-escena.json').read_text());first=1
 for view in views:
  for source,prefix in [(before,'antes'),(after,'despues')]:shutil.copyfile(source/(view+'-3d.jpg'),out/(prefix+'-'+view+'.jpg'))
 shutil.copyfile(reference,out/'referencia-aerea.jpg')
 for r in refs:
  source=Path(r['file']);shutil.copyfile(source,out/source.name);r['file']=rel+source.name;r['sha256']=sha(out/source.name)
 plan_members={p['id']:p for p in new['plans'] if p['id'] in block['buildingIds']}
 checks=dict(sheetFootprintsUnchanged=True,retainedSheetFootprints=len(old['plans']),streetIntrusions=validation['roadMeshIntrusions'],streetColliderIntrusions=validation['roadColliderIntrusions'],finiteGeometry=validation['finiteGeometry'],groundSurfacesRetained=True,pairedCameras=True,reviewedMembers=block['buildingIds'])
 if bid=='C08':
  probes=[[-77,57],[-74,74],[-51,72],[-62.94,85]]
  for x,z in probes:assert not any(c['min'][0]<=x<=c['max'][0] and c['min'][2]<=z<=c['max'][2] and c['min'][1]<=1.6<=c['max'][1] for c in scene['colliders']),f'Patio/entrada bloqueada {x,z}'
  checks.update(parkingAndGatewayFree=True,parkingProbes=probes)
 allfiles={p.name:sha(p) for p in out.glob('*.jpg')}
 record=dict(schemaVersion=1,scope='block-batch',block=bid,number=number,status='done',approval='visual-approximate',reviewedAt='2026-10-08',members=block['buildingIds'],baselineCommit='bcda8473763c2e1c11902c6325ebebe9f4899d12',baselineNote='C08: modelo publicado anterior. C30: captura de trabajo previa a su tanda, con los cambios de C08 ya aplicados.',beforeWorldSha256=before_scene['worldSha256'],worldSha256=worldhash,streetView=refs,checks=checks,buildings=scene['buildings'],modelDetails=packet.get('details'),files=allfiles,limits=limits,cameras=json.loads((WORK/(bid.lower()+'-paquete')/'camaras.json').read_text()),next={'block':'C30' if bid=='C08' else 'C20','number':8 if bid=='C08' else 9,'section':1})
 (out/'registro.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
 for n in range(first,6):
  view='cuadra' if n<=3 else ('NE' if bid=='C08' else 'obregon') if n==4 else ('sur' if bid=='C08' else 'garmendia')
  refimage='referencia-aerea.jpg' if n<=3 else ('c08-ne-foto.jpg' if bid=='C08' else 'c30-obregon-isc-20261008.jpg') if n==4 else ('c08-sur-cerramiento-20261008.jpg' if bid=='C08' else 'c30-garmendia-medio-20261008.jpg')
  images={k:{'url':rel+f,'sha256':allfiles[f]} for k,f in [('before',f'antes-{view}.jpg'),('reference',refimage),('after',f'despues-{view}.jpg')]}
  name,tasks=sections[n];section={**record,'scope':'block','building':None,'section':n,'tasks':tasks,'summary':descriptions[bid][n],'images':images,'batchRecord':rel+'registro.json'}
  filename=f'registro-{n}.json';(out/filename).write_text(json.dumps(section,ensure_ascii=False,indent=2)+'\n')
  block.setdefault('sectionReviews',{})[str(n)]=dict(state='done',reviewedAt=record['reviewedAt'],summary=section['summary'],record=rel+filename,comparison=rel+'index.html',evidence={k:v['url'] for k,v in images.items()},worldSha256=worldhash)
 block['batchReview']=dict(record=rel+'registro.json',approval='visual-approximate',completeSections=5,number=number)
 cards=''.join(f'<figure><img loading="lazy" src="{prefix}-{view}.jpg" alt="{prefix} {escape(view)}"><figcaption>{prefix.title()} · {escape(view)}</figcaption></figure>' for view in views for prefix in ['antes','despues'])
 photos=''.join(f'<figure><img loading="lazy" src="{Path(r["file"]).name}" alt="Street View {escape(r["id"])}"><figcaption>{escape(r["id"])} · {escape(r["date"])}</figcaption></figure>' for r in refs)
 summaries=''.join(f'<li><strong>{n}. {sections[n][0]}</strong> — {escape(descriptions[bid].get(n,"Cierre anterior conservado con su propia evidencia."))}</li>' for n in range(1,6))
 (out/'index.html').write_text(f'''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cuadra {number} · Cierre visual</title><style>body{{font:16px/1.5 system-ui;max-width:1400px;margin:auto;padding:24px;background:#f5f6f2;color:#243c35}}h1{{line-height:1.15}}.pair{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}}figure{{margin:0 0 16px}}img{{width:100%;border-radius:10px}}a{{color:#256747}}.state{{padding:14px;background:#dfeede;border-radius:10px}}@media(max-width:650px){{.pair{{grid-template-columns:1fr}}body{{padding:14px}}}}</style><body><a href="../../../seguimiento-3d.html?cuadra={bid}">← Cuadra {number} en Amalaya</a><h1>Cuadra {number} · {escape(block['name'])}</h1><p class="state">Cinco etapas cerradas visualmente. Identificador de inventario: {bid}.</p><ol>{summaries}</ol><h2>Antes y después de la tanda</h2><div class="pair">{cards}</div><p>Cámaras idénticas entre modelo anterior y posterior. La comparación con las fotografías es visual y aproximada; las imágenes no son un levantamiento métrico.</p><h2>Referencias conservadas</h2><div class="pair">{photos}</div><h2>Límites del cierre</h2><ul>{''.join('<li>'+escape(x)+'</li>' for x in limits)}</ul><p><a href="registro.json">Registro, fuentes y comprobaciones</a> · Siguiente cuadra: {record['next']['number']}.</p></body></html>''')
 print(bid,number,'sections',len(block['sectionReviews']),'photos',len(allfiles))
reg['workPlan'].update(activeBlock='C20',activeNumber=9,completedSection=5,nextSection=1,title='Cuadras 1 y 8 · cinco etapas cerradas visualmente',detail='Siguiente: cuadra 9. Orden aprobado: 1 → 8 → 9 → 10 → 11 → 12 → 13 → 14. Cada cuadra se trabaja en una tanda con evidencia compartida.')
(P/'cuadras.json').write_text(json.dumps(reg,ensure_ascii=False,separators=(',',':'))+'\n')

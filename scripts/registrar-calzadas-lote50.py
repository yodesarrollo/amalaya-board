import json,copy,hashlib,sys
from pathlib import Path
root=Path('public/levantamiento'); path=Path('public/seguimiento-3d.json')
data=json.loads(path.read_text()); ids=json.load(open(sys.argv[1])); rendered=json.load(open(sys.argv[2]))
bs={b['id']:b for a in data['blocks'] for b in a['buildings']}
associations={
 'OB-21':['OB-E'],'SER-SANT':['SE-W','YA-N'],
 'A1-01':['RO','PS-N','SE-O'],'A1-02':['PS-N','YA-N','SE-O'],'A1-03':['PS-N','PL'],'A1-04':['RO','PL'],
 'A2-01':['YA-N','PL'],'A2-02':['SE-W'],'A2-03':['SE-W'],'A2-04':['GA-N50','PL'],'A2-05':['SE-W','GA-M'],'A2-06':['SE-W','GA-M'],
 'A3-01':['SE-T'],'A3-02':['SE-E50'],'A3-03':['SE-T'],'A3-04':['SE-T'],'A3-05':['SE-T'],'A3-06':['SE-T'],'A3-07':['SE-E50','AB-N'],'A3-08':['AB-N','CH-E'],'A3-09':['SE-E50','AB-N'],
 'B1-01':['RO','PS-N','SE-O'],'B1-02':['RO'],'B1-03':['RO','OB-O'],'B1-04':['PS-N','OB-O'],'B1-05':['PS-N','SE-O'],'B1-06':['YA-M','SE-O'],'B1-07':['YA-C','OB-C'],'B1-08':['PM','OB-RO'],'B1-09':['PM','SE-RO'],
 'B2-01':['GA-M'],'B2-02':['GA-M','CH-E'],
 'B3-01':['CH-E'],'B3-02':['CH-E','OB-E'],'B3-03':['OB-E'],'B3-04':['AB-N','CH-E50'],'B3-05':['AB-E','OB-E50'],
 'C1-01':['RO','OB-O'],'C1-02':['PS-S','OB-O'],'C1-03':['RO','PS-S','OB-O'],'C1-04':['PS-S'],'C1-05':['RO'],'C1-06':['RO','PS-S'],'C1-07':['PS-S','SU'],'C1-08':['PM','OB-RO'],'C1-09':['RO','OB-RO'],'C1-10':['RO'],'C1-11':['PS-S','YA-S','OB-C'],'C1-12':['CE','SU'],'C1-13':['CE','SU','YA-S']}
assert list(associations)==ids
new=json.loads((root/'street-batch50-geometry-report.json').read_text()); segments={e['id']:{**e,'operation':'added'} for e in new['segments']}
segments['CH-JOIN']={**new['replacements'][0],'operation':'repaired','widthMeters':5.21,'uncertaintyMeters':.7};associations['B3-04'].append('CH-JOIN')
for sid,name,width,unc in [('OB-E','Obregón · Garmendia–Abasolo',5.61,.56),('SE-W','Serdán · Yáñez–Garmendia',11,1.5),('SE-T','Serdán · Garmendia–Guerrero',12,1.5),('GA-M','Garmendia · Chihuahua–Serdán',6.2,1),('CH-E','Chihuahua · Garmendia–Abasolo',5.21,.5),('AB-E','Abasolo · Chihuahua–Obregón',6.6,.7),('YA-M','Yáñez · Serdán–Chihuahua',10.5,1.3)]:
 segments[sid]=dict(id=sid,name=name,widthMeters=width,uncertaintyMeters=unc,operation='retained-verified',source='street-round.json; existing geometry owner retained')
references=[dict(id=s,url='https://www.google.com/maps/@'+coords+',244m/data=!3m1!1e3',observedAt=rendered['timestamp'],scaleBarMeters=20,scaleBarPixels=79,viewport=[1363,936],imageryDateVerified=False) for s,coords in [('A1','29.0770989,-110.9564038'),('C1','29.0755344,-110.9564038'),('A3','29.0770989,-110.9535192')]]
results=[]
for n,id in enumerate(ids,1):
 b=bs[id];old=copy.deepcopy(b['visualProgress']);oldrec=rendered['oldRecords'][id];bef,count0=rendered['images'][id]['0'];aft,count1=rendered['images'][id]['1'];camera=rendered['cameras'][id]; segs=[segments[s] for s in associations[id]]
 action='añadida o conectada' if any(s['operation']=='added' for s in segs) else 'contrastada y conservada'
 note='REVISADO · Calzada '+action+': '+', '.join(s['name'] for s in segs)+'. Anchos visuales aproximados con margen; cruces compartidos sin duplicar asfalto. No certifica accesos privados, radios, banquetas, alturas ni fachadas.'
 if id in ['A1-04','B1-04','C1-03','C1-08']:note+=' Asociación al entorno de la manzana; no se inventa una entrada directa desde la calle.'
 if id=='B3-04':note+=' Se recorta el encuentro antiguo de Chihuahua que cruzaba la planta de B3-04.'
 recordPath=f'levantamiento/evidence/{id}/20261006-02-registro.json'
 record=dict(id=id,building=id,order=n,action=2,task='street',status='done',executedAt=rendered['timestamp'],note=note,source=oldrec['source'],heightMeasured=False,baseline=bef,current=aft,camera=camera,worldSha256=rendered['hashes'][1],baselineWorldSha256=rendered['hashes'][0],renderMethod=rendered['method'],triangles=count1,streetSegments=segs,references=references,checks=dict(unchangedBuildingAndColliderGeometry=True,uniqueRoadOwners=True,noNewRoadOverlapWithFootprints=True,sameComparisonCamera=True),limits=['Anchos y ejes aproximados; no es levantamiento topográfico.','Las franjas se recortan en el límite de plantas aproximadas para no invadirlas; el ancho nominal puede estrecharse localmente.','Las vistas son renders del modelo, no capturas WebGL ni fotografías.'])
 (Path('public')/recordPath).write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
 b['tasks']['street']='done';b.setdefault('taskDetails',{})['street']=note;b.setdefault('issues',{}).pop('street',None)
 b.setdefault('evidence',{})['street']=[dict(title='Acción 2 · comparación inicial',url=bef['url']),dict(title='Acción 2 · calzada revisada',url=aft['url']),dict(title='Registro de tramos y límites',url=recordPath)]
 history=copy.deepcopy(old.get('history',[]));hist={k:v for k,v in old.items() if k!='history'};history.append(hist)
 b['visualProgress']=dict(cameraId=camera['id'],current=aft,baseline=old.get('baseline',bef),comparisonBaseline=bef,manifest=recordPath,history=history)
 results.append(dict(id=id,order=n,state='done',segments=associations[id],manifest=recordPath))
remaining=[id for id in data['activeReview']['buildingOrder'] if bs[id]['tasks']['street']!='done'];closed=[id for id in data['activeReview']['buildingOrder'] if bs[id]['tasks']['street']=='done']
data.setdefault('workflowHistory',[]).append(copy.deepcopy(data['workflow']))
data['workflow']={**data['workflow'],'round':2,'task':'street','actionLabel':'Calzadas · lámina completa','buildingOrder':data['activeReview']['buildingOrder'],'closedBuildings':closed,'reviewedBuildings':closed,'unresolvedBuildings':remaining,'readyForNextRound':False,'nextTask':'sidewalkA','state':'incomplete','instructions':'Continuar calzadas en orden por toda la lámina. El lote autorizado de 50 termina en C1-13; el siguiente pendiente es '+remaining[0]+'.'}
data['currentBatch']=dict(id='calzadas-50-20261006',task='street',state='done',buildingOrder=ids,closedBuildings=ids,remainingBuildings=remaining,records=results,geometryReport='levantamiento/street-batch50-geometry-report.json')
data['updatedAt']=rendered['timestamp'];data['live']={**data['live'],'title':'Calzadas · lote de 50 revisado','detail':'50 de 50 del lote con comparación y registro. '+str(len(closed))+' de 139 calzadas revisadas; '+str(len(remaining))+' pendientes. Alturas y fachadas siguen pendientes.'}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(root/'street-batch50-provenance.json').write_text(json.dumps(dict(version='street-batch50-20261006',baselineCommit='6d4b69d919775b68670ba4a2aba3f02c242a1133',worldSha256=rendered['hashes'][1],baselineWorldSha256=rendered['hashes'][0],task='street',count=50,segments=list(segments.values()),references=references,results=results,limits='Only stage 2 of 11; shared road surroundings, not completed buildings. Existing map UI and navigation retained.'),ensure_ascii=False,indent=2)+'\n')
print(len(results),'closed;',len(closed),'total street done;',len(remaining),'pending; next',remaining[0])

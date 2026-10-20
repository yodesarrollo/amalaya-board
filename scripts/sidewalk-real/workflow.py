"""Primary comparison: nine-criterion review in one complete provider workflow."""
import json,hashlib,statistics
from pathlib import Path
import run as transport
ROOT=transport.ROOT;DATA=transport.DATA
OUT=ROOT/'tmp/sidewalk-workflow-results';OUT.mkdir(exist_ok=True);transport.OUT=OUT
freeze=json.loads((DATA/'workflow-freeze.json').read_text())
assert freeze['manifest_sha256']==transport.FREEZE['manifest_sha256']
truth=json.loads((DATA/'truth.json').read_text())

def validate(d,args):
    assert d['study_id']=='amalaya-sidewalk-workflow-v1' and d['manifest_sha256']==freeze['manifest_sha256']
    assert all(d[k]==v for k,v in args.items())
    assert d['status'] in ['complete','failed'],d
    if d['status']!='complete':return
    assert len(d['values'])==9 and {v['criterion_id']for v in d['values']}==set(truth)
    assert all(next(a for a in d['assets'] if a['role']==role)['sha256']==transport.CASES['surface'][role]['sha256']for role in ['reference','candidate'])
    assert len(d['stages'])==(1 if args['arm']=='A' or not d['fallback_ids'] else 2)
    for stage in d['stages']:
        receipt=stage['receipt'];model=transport.MANIFEST['openai_model'] if receipt['provider']=='openai' else 'jev-1.14.0'
        assert receipt['http_status']==200 and receipt['requested_model']==model and receipt['real_model']==model
        assert stage['raw']['model']==model and len(receipt['response_sha256'])==64
        if receipt['provider']=='openai':assert stage['reasoning_effort']=='medium'

def label(v):return None if v.get('abstain') else v.get('presence')
def score(d):
    return sum(label(v)==truth[v['criterion_id']]['presence'] and (truth[v['criterion_id']]['presence'] is not True or v['category']==truth[v['criterion_id']]['category'])for v in d['values'])

preflight=transport.rpc('amalaya_sidewalk_workflow_status',{})
assert preflight['data']['status']=='ready',preflight['data']
(OUT/'preflight.json').write_text(json.dumps(preflight,indent=2)+'\n')
schedule=[('A',0),('B95',0),('B90',0),('B90',1),('A',1),('B95',1)]
assert schedule==[tuple(x)for x in freeze['schedule']]
results=[]
for arm,repeat in schedule:
    args={'arm':arm,'repeat':repeat};path=OUT/f'{arm}--{repeat}.json'
    if path.exists():r=json.loads(path.read_text());validate(r['data'],args)
    else:
        r=transport.rpc('amalaya_sidewalk_workflow_run',args,validator=validate)
        path.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
    d=r['data'];assert d['status']=='complete',d
    print(arm,repeat,'score',score(d),'/9','automatic',len(d['automatic_ids']),'fallback',len(d['fallback_ids']),round(r['client_ms']),'ms',flush=True)
    results.append({'arm':arm,'repeat':repeat,'correct':score(d),'client_ms':r['client_ms'],'server_ms':d['elapsed_ms'],'automatic':len(d['automatic_ids']),'fallback':len(d['fallback_ids']),'provider_calls':len(d['stages']),'values':d['values']})
summary={}
for arm in ['A','B90','B95']:
    rr=[r for r in results if r['arm']==arm]
    summary[arm]={'correct':sum(r['correct']for r in rr),'total':18,'automatic':sum(r['automatic']for r in rr),'fallback':sum(r['fallback']for r in rr),'median_client_ms':statistics.median(r['client_ms']for r in rr),'runs_client_ms':[r['client_ms']for r in rr],'provider_calls':sum(r['provider_calls']for r in rr)}
    if arm!='A':summary[arm]['paired_time_change_pct']=(statistics.median(next(r for r in rr if r['repeat']==i)['client_ms']/next(r for r in results if r['arm']=='A' and r['repeat']==i)['client_ms']for i in range(2))-1)*100
report={'study_id':freeze['study_id'],'summary':summary,'runs':results,'time_definition':'Observed client wall time through all nine diagnostic decisions in one workflow, including image retrieval, Jev routing and grouped GPT fallback. Excludes one-off development/deployment and unperformed geometric placement.','limitations':transport.MANIFEST['limitations']}
(OUT/'analysis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))

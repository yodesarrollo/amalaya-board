"""Finite live trial. Each provider receipt is saved before scoring or fallback.
No credential is saved. Re-running reads the durable slot rather than paying twice.
"""
import json,time,uuid,hashlib,sys,random,urllib.request,urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'public/levantamiento/sidewalk-real-v1'
OUT=ROOT/'tmp/sidewalk-real-results';OUT.mkdir(exist_ok=True)
MANIFEST=json.loads((DATA/'study.json').read_text())
FREEZE=json.loads((DATA/'freeze.json').read_text())
TOKEN=(ROOT.parent/'tmp/amalaya-pilot-token').read_text().strip()
ENDPOINT='https://yod-cloud-room.onrender.com/jev-mcp'
SHA=lambda b:hashlib.sha256(b).hexdigest()
assert SHA((DATA/'study.json').read_bytes())==FREEZE['manifest_sha256']
assert SHA((DATA/'truth.json').read_bytes())==FREEZE['truth_sha256']
CASES={c['case_id']:c for c in MANIFEST['cases']}
last_request=0

def append(file,value):
    with (OUT/file).open('a') as f:f.write(json.dumps(value,ensure_ascii=False)+'\n');f.flush()

def rpc(name,args,validator=None):
    global last_request
    start=time.monotonic();attempts=[]
    for attempt in range(3):
        delay=1.3-(time.monotonic()-last_request)
        if delay>0:time.sleep(delay)
        last_request=time.monotonic();request_start=last_request
        identity=str(uuid.uuid4())
        body=json.dumps({'jsonrpc':'2.0','id':identity,'method':'tools/call','params':{'name':name,'arguments':args}}).encode()
        req=urllib.request.Request(ENDPOINT,data=body,headers={'Content-Type':'application/json','x-amalaya-pilot-token':TOKEN})
        raw=None;status=None
        try:
            with urllib.request.urlopen(req,timeout=75) as response:
                status=response.status;raw=response.read(4*1024*1024+1)
            assert len(raw)<=4*1024*1024,'response_too_large'
            envelope=json.loads(raw);assert envelope['id']==identity and envelope['jsonrpc']=='2.0'
            if 'error' in envelope:raise ValueError('rpc_error: '+str(envelope['error']))
            result=envelope['result'];data=json.loads(result['content'][0]['text'])
            rate=data.get('error')=='limite_de_uso'
            record={'at':time.time(),'tool':name,'args':args,'attempt':attempt,'http_status':status,'client_ms':(time.monotonic()-request_start)*1000,'response_sha256':SHA(raw),'response':envelope,'outcome':'rate_limit' if rate else 'received'}
            assert TOKEN not in json.dumps(record),'credential_in_response'
            append('attempts.jsonl',record);attempts.append({k:record[k]for k in ['attempt','client_ms','outcome']})
            if rate:
                if attempt==2:raise ValueError('rate_limit_exhausted')
                time.sleep(15*(attempt+1));continue
            if name.endswith('_run'):(validator or validate)(data,args)
            return {'data':data,'client_ms':(time.monotonic()-start)*1000,'attempts':attempts}
        except Exception as exc:
            append('errors.jsonl',{'at':time.time(),'tool':name,'args':args,'http_status':status,'error':str(exc)[:300],'elapsed_ms':(time.monotonic()-start)*1000})
            raise # No blind retry after a request may have reached the provider.

def validate(d,args):
    assert d['study_id']==MANIFEST['study_id'] and d['manifest_sha256']==FREEZE['manifest_sha256']
    assert all(d[k]==v for k,v in args.items())
    assert d['run_id']==f"{args['case_id']}--{args['arm']}--{args['repeat']}"
    assert d['status'] in ['complete','provider_error','timeout','invalid_output'],d
    if d['status']!='complete':return
    receipt=d['provider_receipt'];model='jev-1.14.0' if args['arm']=='B' else MANIFEST['openai_model']
    assert receipt['http_status']==200 and receipt['real_model']==model and receipt['requested_model']==model
    assert d['raw']['model']==model and len(receipt['response_sha256'])==64
    assert all(next(a for a in d['trace']['assets'] if a['role']==role)['sha256']==CASES[args['case_id']][role]['sha256'] for role in ['reference','candidate'])
    if args['arm']!='B':assert d['trace']['reasoning_effort']=='medium'

def run_slot(case,arm,repeat):
    # First pre-provider slot was blocked on a truncated upload; preserve it and use its one reserved recovery slot.
    physical_repeat=2 if (case,arm,repeat)==('surface','B',1) else repeat
    args={'case_id':case,'arm':arm,'repeat':physical_repeat};path=OUT/f'{case}--{arm}--{repeat}.json'
    if path.exists():
        r=json.loads(path.read_text());validate(r['data'],args);return r
    r=rpc('amalaya_sidewalk_run',args)
    path.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
    print(case,arm,repeat,r['data']['status'],round(r['client_ms']),flush=True)
    return r

def route(d,threshold):
    if d['status']!='complete':return None
    a=d['raw']['answers'];p=a['presence']['noul'];e=1-a['abstain']['noul'];cat=a['category']['choice']
    value=True if p>=threshold else False if p<=1-threshold else None
    coherent=(value is True and cat not in ['none','insufficient_evidence']) or (value is False and cat=='none')
    if e>=threshold and coherent:return {'presence':value,'abstain':False,'category':cat,'source':'Jev'}
    return None

def main():
    if len(sys.argv)>1 and sys.argv[1]=='preflight':
        r=rpc('amalaya_sidewalk_status',{});(OUT/'preflight.json').write_text(json.dumps(r,indent=2));print(json.dumps(r['data']));sys.exit()

    preflight=rpc('amalaya_sidewalk_status',{})
    assert preflight['data']['status']=='ready',preflight['data']
    (OUT/'preflight.json').write_text(json.dumps(preflight,indent=2)+'\n')
    schedule=[(case,r)for r in range(2)for case in CASES]
    random.Random(20261020).shuffle(schedule)
    (OUT/'schedule.json').write_text(json.dumps(schedule,indent=2)+'\n')
    for case,repeat in schedule:
        for arm in (['A','B'] if repeat==0 else ['B','A']):run_slot(case,arm,repeat)
        j=run_slot(case,'B',repeat)
        for threshold,arm in ([ (.9,'C'),(.95,'D')] if repeat==0 else [(.95,'D'),(.9,'C')]):
            automatic=route(j['data'],threshold)
            if automatic is None:run_slot(case,arm,repeat)
    print('All scheduled decisions and required independent fallbacks complete.',flush=True)

if __name__=='__main__':main()

"""Conciliate only completed/not-planned canonical Amalaya issues through GAS CAS."""
import json,os,re,sys
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request,urlopen

CANONICAL=re.compile(r'https://github\.com/yodesarrollo/amalaya-board/issues/([1-9]\d*)')

def candidates(items,fetch_issue):
    for c in items:
        if c.get('estado')!='tomada':continue
        match=CANONICAL.fullmatch(str(c.get('issue','')))
        if not match:raise ValueError('Non-canonical issue link; no write')
        issue=fetch_issue(int(match[1]))
        if issue.get('state')!='closed':continue
        reason=issue.get('state_reason')
        state={'completed':'terminada','not_planned':'descartada'}.get(reason)
        if not state:raise ValueError('Unverified close reason; no write')
        if issue.get('pull_request') or issue.get('html_url')!=c['issue'] or issue.get('number')!=int(match[1]) or str(issue.get('body','')).split('\n')[0].strip()!='# Chinche '+c['id']:
            raise ValueError('Issue does not match chinche ID; no write')
        yield {'action':'chincheEstado','id':c['id'],'issue':c['issue'],'estado_previo':c['estado'],'estado':state,'motivo':reason}

def request_json(request):
    with urlopen(request,timeout=45) as response:return json.load(response)

def main():
    key=os.environ.get('K','');token=os.environ.get('GH_TOKEN','')
    if not key:
        print('Sin token de puente; no se concilian estados.');return
    if not token:raise ValueError('Missing GitHub authentication')
    source=(Path(__file__).resolve().parents[1]/'src/config.js').read_text()
    endpoint=re.search(r'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec',source).group(0)
    data=request_json(Request(endpoint+'?'+urlencode({'accion':'chinches','k':key,'incluirTomadas':'si'})))
    if data.get('ok') is not True:raise ValueError('Backend did not authorize read')
    def issue(number):
        return request_json(Request('https://api.github.com/repos/yodesarrollo/amalaya-board/issues/'+str(number),headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json'}))
    plans=list(candidates(data.get('chinches',[]),issue))
    dry='--dry-run' in sys.argv
    for plan in plans:
        if dry:continue
        result=request_json(Request(endpoint,data=json.dumps({**plan,'k':key}).encode(),headers={'Content-Type':'text/plain;charset=utf-8'}))
        if result.get('ok') is not True or result.get('id')!=plan['id'] or result.get('estado')!=plan['estado'] or result.get('evidencia',{}).get('issue')!=plan['issue'] or result.get('evidencia',{}).get('motivo')!=plan['motivo']:
            raise ValueError('CAS closure not confirmed; reread before retry')
        print('Issue #'+str(CANONICAL.fullmatch(plan['issue'])[1])+': '+plan['estado']+' confirmada por GitHub y CAS.')
    print(str(len(plans))+(' cierre(s) propuesto(s); cero escrituras.' if dry else ' cierre(s) confirmado(s).'))

if __name__=='__main__':
    try:main()
    except Exception as error:
        # Never print response payloads or URLs containing the bridge token.
        print('Conciliación detenida: '+type(error).__name__+'. Revisar estado actual antes de reintentar.',file=sys.stderr);sys.exit(1)

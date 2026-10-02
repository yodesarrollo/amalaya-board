import vm from 'node:vm'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source=readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8')
const id='CHN-DEMO-1',url='https://github.com/yodesarrollo/amalaya-board/issues/123'
const closed={number:123,html_url:url,body:'# Chinche '+id,state:'closed',state_reason:'completed',closed_at:'2026-09-30T12:00:00Z'}
function fixture({github=closed,current='tomada',issue=url,historyFail=false,duplicate=false,http=200}={}){
  const state={current,issue,fetches:0,writes:0,log:[]}
  const history={getLastRow:()=>1,getRange:()=>({setValues:rows=>{if(historyFail)throw Error('fake failure');state.log=structuredClone(rows)},getValues:()=>state.log})}
  const sheet={getRange:()=>({getValues:()=>[[state.current,state.issue]],setValues:rows=>{state.writes++;[state.current,state.issue]=rows[0]}})}
  const c=vm.createContext({console,UrlFetchApp:{fetch:endpoint=>{
    assert.equal(endpoint,'https://api.github.com/repos/yodesarrollo/amalaya-board/issues/123');state.fetches++
    return {getResponseCode:()=>http,getContentText:()=>JSON.stringify(github)}
  }}})
  vm.runInContext(source,c)
  c.jsonOut=x=>x;c.conCandado=fn=>fn();c.tokenPuenteValido=k=>k==='fixture-secret'
  c.obtenerHoja=name=>name==='Chinches'?sheet:history;c.buscarFila=()=>2
  c.leerHoja=()=>duplicate?[{id},{id}]:[{id}]
  const call=(patch={})=>c.accChincheEstado({k:'fixture-secret',id,issue:url,estado_previo:'tomada',estado:'terminada',motivo:'completed',...patch})
  return {state,call}
}
const normal=fixture();assert.equal(normal.call().ok,true);assert.equal(normal.state.current,'terminada');assert.equal(normal.state.log.length,2)
assert.equal(normal.call().repetida,true);assert.equal(normal.state.writes,1);assert.equal(normal.state.fetches,2)
const badCases=[
  [{},{k:'wrong'}], [{},{estado:'tomada'}], [{},{motivo:'arbitrary'}],
  [{},{issue:'https://github.com/other/repo/issues/123'}],
  [{current:'nueva'},{}], [{issue:'https://github.com/yodesarrollo/amalaya-board/issues/124'},{}],
  [{duplicate:true},{}], [{http:429},{}],
  [{github:{...closed,state:'open'}},{}],
  [{github:{...closed,state_reason:'not_planned'}},{}],
  [{github:{...closed,body:'# Chinche CHN-DEMO-other'}},{}],
  [{github:{...closed,pull_request:{}}},{}],
]
for(const [options,patch] of badCases){const f=fixture(options);assert.equal(f.call(patch).ok,false);assert.equal(f.state.writes,0)}
const discarded=fixture({github:{...closed,state_reason:'not_planned'}})
assert.equal(discarded.call({estado:'descartada',motivo:'not_planned'}).ok,true)
const failed=fixture({historyFail:true});assert.equal(failed.call().ok,false);assert.equal(failed.state.current,'tomada')
const reopened=fixture({current:'terminada',github:{...closed,state:'open',state_reason:null}});assert.equal(reopened.call().ok,false);assert.equal(reopened.state.writes,0)
console.log('Chinches: token, CAS ID/estado/issue, GitHub autoritativo, motivo, cross-repo, idempotencia, reapertura y fallo de historial verificados sin red ni Sheets reales.')

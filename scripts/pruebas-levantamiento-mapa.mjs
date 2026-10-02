import assert from 'node:assert/strict'
import { montarLevantamiento } from '../src/levantamiento-mapa.js'
const tick=()=>new Promise(resolve=>setImmediate(resolve))
let ready=0,errors=0,disposed=0,added=0,removed=0
let escenarios=[],repintados=0
const listeners=new Map()
globalThis.window={
  addEventListener:(type,fn)=>listeners.set(type,fn),
  removeEventListener:(type,fn)=>{if(listeners.get(type)===fn)listeners.delete(type)},
  dispatchEvent:event=>{listeners.get(event.type)?.(event)},
}
const layer={id:'amalaya-levantamiento',setScenario:v=>escenarios.push(v)}
const api={createWorld:async()=>({}),disposeWorld:()=>disposed++,createMapLayer:()=>layer}
const map={addLayer:(l,before)=>{assert.equal(l,layer);assert.equal(before,'rutas-halo');added++},triggerRepaint(){repintados++},getLayer:()=>true,removeLayer:()=>removed++}
const stop=montarLevantamiento({map,base:'/levantamiento/',onReady:()=>ready++,onError:()=>errors++,load:async()=>api})
globalThis.window.dispatchEvent({type:'amalaya:scenario',detail:{version:'amalaya'}})
await tick();assert.equal(ready,1);assert.equal(added,1);assert.deepEqual(escenarios,['amalaya'])
globalThis.window.dispatchEvent({type:'amalaya:scenario',detail:{version:'actual'}})
assert.deepEqual(escenarios,['amalaya','actual']);assert.equal(repintados,3)
stop();assert.equal(removed,1);assert.equal(listeners.size,0)
const stopOffline=montarLevantamiento({map,base:'/',onReady:()=>ready++,onError:()=>errors++,load:async()=>{throw Error('offline')}})
await tick();assert.equal(errors,1);assert.equal(ready,1);stopOffline()
let resolve
const pending={...api,createWorld:()=>new Promise(r=>resolve=r)}
const cancel=montarLevantamiento({map,base:'/',onReady:()=>ready++,onError:()=>errors++,load:async()=>pending})
await tick();cancel();resolve({});await tick();assert.equal(disposed,1);assert.equal(added,1);assert.equal(ready,1)
delete globalThis.window
console.log('Maqueta: capa nueva bajo las rutas, fallo conserva respaldo y carga cancelada libera recursos.')

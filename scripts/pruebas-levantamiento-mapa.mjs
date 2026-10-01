import assert from 'node:assert/strict'
import { montarLevantamiento } from '../src/levantamiento-mapa.js'
const tick=()=>new Promise(resolve=>setImmediate(resolve))
let ready=0,errors=0,disposed=0,added=0,removed=0
const layer={id:'amalaya-levantamiento',setScenario:v=>assert.equal(v,'actual')}
const api={createWorld:async()=>({}),disposeWorld:()=>disposed++,createMapLayer:()=>layer}
const map={addLayer:(l,before)=>{assert.equal(l,layer);assert.equal(before,'rutas-halo');added++},triggerRepaint(){},getLayer:()=>true,removeLayer:()=>removed++}
const stop=montarLevantamiento({map,base:'/levantamiento/',onReady:()=>ready++,onError:()=>errors++,load:async()=>api})
await tick();assert.equal(ready,1);assert.equal(added,1);stop();assert.equal(removed,1)
montarLevantamiento({map,base:'/',onReady:()=>ready++,onError:()=>errors++,load:async()=>{throw Error('offline')}})
await tick();assert.equal(errors,1);assert.equal(ready,1)
let resolve
const pending={...api,createWorld:()=>new Promise(r=>resolve=r)}
const cancel=montarLevantamiento({map,base:'/',onReady:()=>ready++,onError:()=>errors++,load:async()=>pending})
await tick();cancel();resolve({});await tick();assert.equal(disposed,1);assert.equal(added,1);assert.equal(ready,1)
console.log('Maqueta: capa nueva bajo las rutas, fallo conserva respaldo y carga cancelada libera recursos.')

import assert from 'node:assert/strict'
import { recuperarCartografia } from '../src/mapa-recuperacion.js'
function fixture() {
  const events=new Map(),timers=new Map();let seq=0,styles=0,ready=0,fallback=0,failure=0
  const api=recuperarCartografia({on:(k,v)=>events.set(k,v),off:k=>events.delete(k),setStyle:s=>{styles++;assert.equal(s.version,8);assert.deepEqual(s.sources,{})}},{schedule:fn=>{timers.set(++seq,fn);return seq},cancel:id=>timers.delete(id),onFallback:()=>fallback++,onReady:()=>ready++,onFailure:()=>failure++})
  return {api,events,timers,counts:()=>({styles,ready,fallback,failure}),error:()=>events.get('error')?.({error:new Error('Failed to fetch style')}),tick:()=>{const [id,fn]=timers.entries().next().value;timers.delete(id);fn()}}
}
// Failure of the remote style recovers once, without poisoning the mounted canvas.
const f=fixture();f.error();f.error();assert.equal(f.counts().styles,1);f.api.ready();f.error();assert.equal(f.counts().failure,0);assert.equal(f.timers.size,0);f.api.dispose();assert.equal(f.events.size,0)
// Slow load and cleanup don't leave retry loops or late failures after unmount.
const g=fixture();g.tick();assert.equal(g.counts().fallback,1);g.api.dispose();assert.equal(g.timers.size,0);g.api.ready();assert.equal(g.counts().ready,0)
const h=fixture();h.api.ready();h.error();assert.equal(h.counts().styles,0)
const k=fixture();k.tick();k.tick();assert.equal(k.counts().failure,1);k.api.dispose()
console.log('OK: recuperación única; sin errores tardíos ni temporizadores tras desmontar.');

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { rumboRuta, mensajeRecorrido, urlPanorama } from '../src/recorrido-state.js'
const {rutas}=JSON.parse(readFileSync('public/recorrido/rutas.json','utf8'))
assert.equal(rutas.reduce((n,r)=>n+r.puntos.length,0),37)
const route=rutas[0], point=route.puntos[4]
assert.ok(rumboRuta(route.puntos,4)>80 && rumboRuta(route.puntos,4)<90)
assert.ok(rumboRuta(route.puntos,13)>80 && rumboRuta(route.puntos,13)<90)
assert.deepEqual(mensajeRecorrido({tipo:'recorrido360',ruta:route.id,punto:point.id},rutas),{routeId:route.id,index:4})
assert.equal(mensajeRecorrido({tipo:'recorrido360',ruta:route.id,punto:'no-existe'},rutas),null)
assert.equal(mensajeRecorrido({tipo:'otro',ruta:route.id,punto:point.id},rutas),null)
const url=new URL(urlPanorama('/amalaya-board/',route,point),'http://localhost')
assert.equal(url.searchParams.get('p'),point.id)
assert.equal(url.searchParams.get('r'),route.id)
assert.equal(url.pathname,'/amalaya-board/recorrido/')
console.log('Portal: IDs de panoramas preservados, rumbo derivado y mensajes desconocidos rechazados.')

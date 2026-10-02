import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { rumboRuta, rumboConsulta, mensajeRecorrido, urlPanorama } from '../src/recorrido-state.js'
const {rutas}=JSON.parse(readFileSync('public/recorrido/rutas.json','utf8'))
assert.equal(rutas.reduce((n,r)=>n+r.puntos.length,0),37)
const route=rutas[0], point=route.puntos[4]
assert.ok(rumboRuta(route.puntos,4)>80 && rumboRuta(route.puntos,4)<90)
assert.ok(rumboRuta(route.puntos,13)>80 && rumboRuta(route.puntos,13)<90)
assert.equal(rumboConsulta(route,2),185,'OB-02 conserva el rumbo de la comparación fotográfica')
assert.equal(rumboConsulta(route,1),185,'OB-01 conserva el rumbo de la comparación fotográfica')
assert.equal(rumboConsulta(route,0),rumboRuta(route.puntos,0),'los puntos restantes derivan rumbo desde coordenadas')
assert.deepEqual(mensajeRecorrido({tipo:'recorrido360',ruta:route.id,punto:point.id},rutas),{routeId:route.id,index:4})
assert.equal(mensajeRecorrido({tipo:'recorrido360',ruta:route.id,punto:'no-existe'},rutas),null)
assert.equal(mensajeRecorrido({tipo:'otro',ruta:route.id,punto:point.id},rutas),null)
const url=new URL(urlPanorama('/amalaya-board/',route,point),'http://localhost')
assert.equal(url.searchParams.get('p'),point.id)
assert.equal(url.searchParams.get('r'),route.id)
assert.equal(url.pathname,'/amalaya-board/recorrido/')
const viewer=readFileSync('public/recorrido/index.html','utf8')
assert.ok(viewer.includes("tipo:'amalaya:360-ready'"),'el tablero espera a que los puntos 360 estén listos antes de sincronizar')
const mapa=readFileSync('src/componentes/Mapa.jsx','utf8')
const panel=readFileSync('src/componentes/RecorridoModelo.jsx','utf8')
const inicioEtapa=mapa.indexOf("height: 'calc(100dvh - 150px)'")
const panelEnEtapa=mapa.indexOf('<RecorridoModelo />')
const lienzoAnterior=mapa.indexOf('ref={contRef}',inicioEtapa)
assert.ok(inicioEtapa>=0 && panelEnEtapa>inicioEtapa && panelEnEtapa<lienzoAnterior,'los controles viven encima del mapa principal')
assert.equal((mapa.match(/<RecorridoModelo \/>/g)||[]).length,1,'el recorrido aparece en una sola vista')
for(const modo of ["'planta', Map, 'Planta'", "'modelo', Box, '3D'", "'caminar', Footprints, 'Caminar'", "'streetview', Images, 'Street View'"]) {
  assert.ok(panel.includes(modo),`el tablero ofrece el modo ${modo}`)
}
console.log('Portal: IDs de panoramas preservados, rumbo derivado y mensajes desconocidos rechazados.')

import assert from 'node:assert/strict'
import { pinesDeEspacios } from '../src/espacios-mapa.js'
import { pctAGeo, geoAPct, leerGeo, GEO_DEF } from '../src/mapa-geo.js'
import { centroDeZonas } from '../src/territorio.js'
const geo=[[-111,30],[-110,30.1],[-109.9,29.1],[-110.9,29]]
const config=[{clave:'mapa_geo',valor:JSON.stringify(geo)}]
const [p]=pinesDeEspacios([{id:'interno-7',nombre:'Espacio <prueba>',pos_x:10,pos_y:20,ancho:20,alto:10}],config)
assert.equal(p.id,'interno-7')
assert.deepEqual(p.coordinates,pctAGeo(geo,20,25))
assert.deepEqual(geoAPct(geo,...p.coordinates),[20,25])
assert.deepEqual(pinesDeEspacios([{id:'E-001',pos_x:99,pos_y:99}],config)[0].coordinates,centroDeZonas(['Z01']))
assert.deepEqual(pinesDeEspacios([{id:'E-001',zona:'Z07'}],config)[0].coordinates,centroDeZonas(['Z07']))
assert.deepEqual(pinesDeEspacios([{id:'E-001',zona:'libre',pos_x:10,pos_y:20,ancho:20,alto:10}],config)[0].coordinates,p.coordinates)
assert.deepEqual(pinesDeEspacios([]),[])
assert.deepEqual(leerGeo([{clave:'mapa_geo',valor:'invalido'}]),GEO_DEF)
console.log('Espacios: IDs preservados, anclas y calibración compartidas, zona explícita y modo libre respetados.')

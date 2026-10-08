import assert from 'node:assert/strict'
import { calcularUnidad, calcularRecinto, consolidarRecintos, leerRecintos } from '../src/recintos.js'
const u={nombre:'Prueba',capacidad:100,periodos:10,ocupacion:50,precio:100,retencion:20,extra:10,variable:10,fijos:1000,renta:3000,regalias:1000,split:30,costoRegalias:10,area:100}
const x=calcularUnidad(u)
assert.equal(x.ingreso,15000);assert.equal(x.regalias,270);assert.equal(x.flujo,12770);assert.equal(x.residual,9500)
const p={unidades:[u],area:100,activo:100000,deuda:10000,inversion:120000,multiplo:6,multiploRegalias:4,servicioDeuda:5000}
const r=calcularRecinto(p);assert.equal(r.valor,148080);assert.equal(r.libre,7770);assert.equal(r.unidades[0].valor,r.valor)
assert.equal(consolidarRecintos([p,p],100).porAccion,2961.6)
assert.equal(consolidarRecintos([p],0).porAccion,null)
assert.equal(calcularUnidad({...u,ocupacion:100},'impulso').cantidad,1000)
assert(calcularUnidad({...u,ocupacion:101}).error)
assert(calcularUnidad({...u,precio:''}).error)
assert(calcularUnidad({...u,precio:-1}).error)
assert(calcularRecinto({...p,area:99}).error)
assert.equal(consolidarRecintos([p,{...p,area:1}],10).valor,undefined)
assert.equal(leerRecintos({Conocimientos:[{fuente:'amalaya:recinto:v1',texto:'oops',espacio_id:'x'}]}).errores[0],'x')
assert(calcularUnidad({...u,fijos:1000000}).equilibrio>100)
// Changing operating inputs must change equity value, independently of original dataset.
assert(calcularRecinto({...p,unidades:[{...u,precio:200}]}).valor>r.valor)
assert.equal(calcularRecinto({...p,unidades:[{...u,regalias:0}]}).regalias,0)
console.log('Recintos: flujos, valor neto, regalías, escenarios, capacidad, áreas y errores verificados.')

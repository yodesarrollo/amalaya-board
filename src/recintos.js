// Borradores privados en Conocimientos; no contiene cifras de Amalaya.
export const FUENTE_RECINTO = 'amalaya:recinto:v1'
export const ESCENARIOS_RECINTO = { prudente: {demanda:.8, precio:.9, costo:1.1}, base:{demanda:1,precio:1,costo:1}, impulso:{demanda:1.1,precio:1.1,costo:1.05} }
export const ARTISTAS_SONORA = [
  {nombre:'Carin León',origen:'Hermosillo, Sonora',foto:'carin-leon.jpg',fuente:'https://elpais.com/mexico/2025-12-29/carin-leon-y-su-cita-con-la-historia-queremos-cambiar-el-juego.html'},
  {nombre:'Christian Nodal',origen:'Caborca, Sonora',foto:'christian-nodal.jpg',fuente:'https://www.sonymusiclatin.com/artists/christian-nodal/'},
  {nombre:'Natanael Cano',origen:'Hermosillo, Sonora',foto:'natanael-cano.jpg',fuente:'https://www.nmas.com.mx/entretenimiento/famosos/cuando-cumple-anos-natanael-cano-donde-en-que-ano-nacio-el-nata/'},
  {nombre:'Alfredo Olivas',origen:'Ciudad Obregón, Sonora',foto:'alfredo-olivas.jpg',fuente:'https://www.saps.com.mx/biografias/alfredo-olivas-biografia.html'},
  {nombre:'Luis R Conriquez',origen:'Caborca, Sonora',foto:'luis-r-conriquez.jpg',fuente:'https://es.wikipedia.org/wiki/Luis_R._Conriquez'},
]
export function leerRecintos(datos) {
  const validos=[], errores=[]
  for(const fila of datos?.Conocimientos||[]) {
    if(fila.fuente!==FUENTE_RECINTO)continue
    try {const plan=JSON.parse(fila.texto);if(plan.version!==1||!Array.isArray(plan.unidades))throw Error('Formato desconocido');validos.push({fila,plan})}
    catch{errores.push(fila.espacio_id)}
  }
  return {validos,errores}
}
const number=(v,n)=>{if(v===''||v==null||!Number.isFinite(Number(v)))throw Error(`Revisar ${n}`);return Number(v)}
function positivo(v,n){const x=number(v,n);if(x<0)throw Error(`${n} no admite negativos`);return x}
function porcentaje(v,n){const x=positivo(v,n);if(x>100)throw Error(`${n} excede 100%`);return x/100}
export function calcularUnidad(u,escenario='base') {
  try {
    const s=ESCENARIOS_RECINTO[escenario];if(!s)throw Error('Escenario desconocido')
    const cantidad=positivo(u.capacidad,'capacidad')*positivo(u.periodos,'periodos')*Math.min(1,porcentaje(u.ocupacion,'ocupación')*s.demanda)
    const bruto=cantidad*positivo(u.precio,'precio')*s.precio
    const ingreso=bruto*porcentaje(u.retencion,'retención')+cantidad*positivo(u.extra,'ingreso complementario')*s.precio
    const variables=ingreso*porcentaje(u.variable,'costo variable')*s.costo
    const fijos=positivo(u.fijos,'costos fijos')*s.costo
    const renta=positivo(u.renta,'renta de referencia')
    const regalias=positivo(u.regalias,'regalías brutas')*porcentaje(u.split,'participación distrito')*(1-porcentaje(u.costoRegalias,'costo de gestión de regalías'))*s.demanda*s.precio
    const flujo=ingreso-variables-fijos+regalias
    const residual=ingreso-variables-fijos-renta
    const capacidadTotal=positivo(u.capacidad,'capacidad')*positivo(u.periodos,'periodos')
    const margenUnidad=(positivo(u.precio,'precio')*s.precio*porcentaje(u.retencion,'retención')+positivo(u.extra,'ingreso complementario')*s.precio)*(1-porcentaje(u.variable,'costo variable')*s.costo)
    const equilibrio=capacidadTotal*margenUnidad>0?(fijos+renta)/(capacidadTotal*margenUnidad)*100:null
    return {cantidad,bruto,ingreso,variables,fijos,renta,regalias,flujo,residual,equilibrio,error:null}
  }catch(e){return {error:e.message}}
}
export function calcularRecinto(plan,escenario='base') {
  try {
    const unidades=plan.unidades.map(u=>({...u,...calcularUnidad(u,escenario)}))
    const error=unidades.find(u=>u.error);if(error)throw Error(`${error.nombre}: ${error.error}`)
    const suma=unidades.reduce((a,u)=>a+positivo(u.area,'área'),0)
    const area=positivo(plan.area,'área del recinto');if(suma>area+.01)throw Error('Las unidades exceden el área construida del recinto')
    const activo=positivo(plan.activo,'valor inmobiliario')
    const deuda=positivo(plan.deuda,'saldo de deuda')
    const inversion=positivo(plan.inversion,'inversión')
    const operativo=unidades.reduce((a,u)=>a+u.residual,0)*positivo(plan.multiplo,'múltiplo operativo')
    const regalias=unidades.reduce((a,u)=>a+u.regalias,0)*positivo(plan.multiploRegalias,'múltiplo de regalías')
    const valor=activo+operativo+regalias-deuda
    const flujo=unidades.reduce((a,u)=>a+u.flujo,0)
    const servicio=positivo(plan.servicioDeuda,'servicio anual de deuda')
    const libre=flujo-servicio
    for(const u of unidades){u.valor=activo*(area>0?u.area/area:0)+u.residual*plan.multiplo+u.regalias*plan.multiploRegalias-deuda*(area>0?u.area/area:0)}
    return {unidades,area,areaAsignada:suma,activo,deuda,inversion,operativo,regalias,valor,flujo,libre,servicio,dscr:servicio>0?flujo/servicio:null,recuperacion:flujo>0?inversion/flujo:null,error:null}
  }catch(e){return {error:e.message}}
}
export function consolidarRecintos(planes,acciones,escenario='base') {
  const recintos=planes.map(p=>calcularRecinto(p,escenario));const errores=recintos.filter(r=>r.error).map(r=>r.error)
  if(errores.length)return {errores,recintos}
  const total=Object.fromEntries(['activo','deuda','inversion','operativo','regalias','valor','flujo','libre','servicio'].map(k=>[k,recintos.reduce((s,r)=>s+r[k],0)]))
  return {...total,recintos,errores,porAccion:Number(acciones)>0?total.valor/Number(acciones):null}
}

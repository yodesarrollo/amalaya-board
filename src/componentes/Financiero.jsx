import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { moneda } from '../formato.js'
import { resumenGlobal, resumenEspacio, montoLinea, mapaConfig, normalizarId } from '../calc.js'

// ============================================================
// El motor financiero — la vista donde el modelo de negocio se
// arma y el VALOR POR ACCIÓN se calcula en vivo.
//
// - Cada espacio: líneas de ingreso/costo (número o mini-fórmula
//   que empieza con = y usa las etiquetas de sus factores) y
//   escenarios comparables que se prenden y apagan.
// - Parámetros globales (Config): solo admin.
// - Panel de sumatorias SIEMPRE visible: barra lateral en
//   pantalla ancha, barra inferior desplegable en teléfono.
// - Una línea cuyo concepto diga "regalías" alimenta el tercer
//   componente del valor por acción.
// ============================================================

function EstadoGuardado({ tab, id }) {
  const { guardados, reintentarGuardado } = usarDatos()
  const estado = guardados[`${tab}|${id}`]
  if (!estado) return null
  if (estado === 'guardando') return <span className="text-terciario text-xs">Guardando…</span>
  if (estado === 'ok') return <span className="text-salvia text-xs">Guardado</span>
  return (
    <button className="text-ladrillo text-xs underline" onClick={() => reintentarGuardado(tab, id)}>
      No se guardó · Reintentar
    </button>
  )
}

// --- Una línea financiera -----------------------------------
function Linea({ linea, factores, escenarios, editable }) {
  const { editarFila, borrarFila } = usarDatos()
  const r = montoLinea(linea, factores)
  const esIngreso = normalizarId(linea.tipo) === 'ingreso'
  const esRegalia = normalizarId(linea.concepto).includes('regalia')

  return (
    <div className="tarjeta p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-xs rounded-full px-2 py-0.5 border shrink-0 ${esIngreso ? 'border-salvia text-salvia' : 'border-terracota text-terracota'}`}>
          {esIngreso ? 'ingreso' : 'costo'}
        </span>
        {esRegalia && (
          <span className="text-xs rounded-full px-2 py-0.5 border border-oro text-oro shrink-0">regalías</span>
        )}
        <input
          className="campo !py-1.5 flex-1 text-sm"
          value={linea.concepto || ''}
          onChange={(e) => editarFila('Finanzas_Lineas', linea.id, { concepto: e.target.value })}
          disabled={!editable}
          placeholder="Concepto"
        />
        {editable && (
          <button className="text-terciario hover:text-ladrillo p-1 shrink-0" onClick={() => borrarFila('Finanzas_Lineas', linea.id)} aria-label="Borrar línea">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="campo !py-1.5 flex-1 text-sm cifra"
          value={linea.monto_anual ?? ''}
          onChange={(e) => editarFila('Finanzas_Lineas', linea.id, { monto_anual: e.target.value })}
          disabled={!editable}
          placeholder="Monto anual, o =alumnos * mensualidad * 12"
        />
        <span className="cifra text-sm w-32 text-right shrink-0 text-marfil">
          {r.error ? '—' : moneda(r.valor)}
        </span>
      </div>

      {r.error && (
        <p className="text-xs text-noche bg-oro/90 rounded px-2 py-1">{r.error}</p>
      )}

      <div className="flex items-center gap-2">
        <select
          className="campo !py-1.5 !w-auto text-xs"
          value={linea.escenario_id || ''}
          onChange={(e) => editarFila('Finanzas_Lineas', linea.id, { escenario_id: e.target.value })}
          disabled={!editable}
          title="¿En qué escenario aplica esta línea?"
        >
          <option value="">siempre aplica</option>
          {escenarios.map((esc) => (
            <option key={esc.id} value={esc.id}>{esc.nombre}</option>
          ))}
        </select>
        <input
          className="campo !py-1.5 flex-1 text-xs"
          value={linea.supuesto || ''}
          onChange={(e) => editarFila('Finanzas_Lineas', linea.id, { supuesto: e.target.value })}
          disabled={!editable}
          placeholder="Supuesto (ej. 12 meses × $2,500 por alumno)"
        />
        <EstadoGuardado tab="Finanzas_Lineas" id={linea.id} />
      </div>
    </div>
  )
}

// --- El bloque de un espacio --------------------------------
function BloqueEspacio({ espacio, editable }) {
  const { datos, crearFila, editarFila } = usarDatos()
  const [abierto, setAbierto] = useState(true)
  const [nuevoEscenario, setNuevoEscenario] = useState('')

  const lineas = (datos?.Finanzas_Lineas || []).filter((l) => String(l.espacio_id) === String(espacio.id))
  const escenarios = (datos?.Escenarios || []).filter((e) => String(e.espacio_id) === String(espacio.id))
  const factores = (datos?.Factores || []).filter((f) => String(f.espacio_id) === String(espacio.id))
  const r = resumenEspacio(espacio, datos?.Finanzas_Lineas || [], datos?.Factores || [], datos?.Escenarios || [])

  async function agregarLinea(tipo) {
    await crearFila('Finanzas_Lineas', {
      espacio_id: espacio.id,
      escenario_id: '',
      concepto: '',
      tipo,
      monto_anual: '',
      supuesto: '',
    })
  }

  async function agregarEscenario(ev) {
    ev.preventDefault()
    if (!nuevoEscenario.trim()) return
    await crearFila('Escenarios', {
      espacio_id: espacio.id,
      nombre: nuevoEscenario.trim(),
      activo: 'no',
      notas: '',
    })
    setNuevoEscenario('')
  }

  return (
    <section className="tarjeta overflow-hidden">
      <button
        className="w-full p-4 flex items-center gap-3 text-left"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-terciario">{espacio.tipo}</div>
          <div className="font-titulo text-lg truncate">{espacio.nombre}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-terciario">utilidad anual</div>
          <div className={`cifra text-sm font-medium ${r.utilidad >= 0 ? 'text-salvia' : 'text-ladrillo'}`}>{moneda(r.utilidad)}</div>
        </div>
        {abierto ? <ChevronUp size={16} className="text-terciario shrink-0" /> : <ChevronDown size={16} className="text-terciario shrink-0" />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-3 border-t border-linea pt-3">
          {/* Escenarios comparables */}
          <div>
            <div className="text-xs uppercase tracking-wide text-terciario mb-1.5">
              Escenarios (prende el que quieras comparar)
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {escenarios.map((esc) => {
                const activo = normalizarId(esc.activo) === 'si'
                return (
                  <button
                    key={esc.id}
                    className={`text-xs rounded-full border px-3 py-1.5 transition-colors duration-micro ease-casa
                      ${activo ? 'border-oro text-noche bg-oro font-medium' : 'border-linea text-arena hover:text-marfil'}
                      ${editable ? '' : 'pointer-events-none'}`}
                    onClick={() => editarFila('Escenarios', esc.id, { activo: activo ? 'no' : 'si' })}
                  >
                    {esc.nombre}
                  </button>
                )
              })}
              {escenarios.length === 0 && (
                <span className="text-terciario text-xs">
                  Sin escenarios: todas las líneas aplican siempre.
                </span>
              )}
            </div>
            {editable && (
              <form className="flex gap-2 mt-2" onSubmit={agregarEscenario}>
                <input
                  className="campo !py-1.5 flex-1 text-xs"
                  value={nuevoEscenario}
                  onChange={(e) => setNuevoEscenario(e.target.value)}
                  placeholder="Nuevo escenario (ej. Escuela 50 alumnos)"
                />
                <button type="submit" className="boton-secundario !px-3 !py-1.5" disabled={!nuevoEscenario.trim()} aria-label="Agregar escenario">
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Líneas */}
          {lineas.length === 0 && (
            <p className="text-terciario text-sm">
              Sin líneas todavía. Agrega los ingresos y costos anuales de este
              espacio; el monto acepta números o fórmulas con sus factores
              (ej. <span className="cifra">=alumnos * mensualidad * 12</span>).
            </p>
          )}
          {lineas.map((l) => (
            <Linea key={l.id} linea={l} factores={factores} escenarios={escenarios} editable={editable} />
          ))}

          {editable && (
            <div className="flex gap-2">
              <button className="boton-secundario flex-1 !py-2 text-sm" onClick={() => agregarLinea('ingreso')}>
                <span className="flex items-center justify-center gap-1"><Plus size={14} /> Ingreso</span>
              </button>
              <button className="boton-secundario flex-1 !py-2 text-sm" onClick={() => agregarLinea('costo')}>
                <span className="flex items-center justify-center gap-1"><Plus size={14} /> Costo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// --- Parámetros globales (Config, solo admin) ----------------
const PARAMETROS = [
  { grupo: 'Valor inmobiliario por m² (para el componente inmobiliario)', claves: ['valor_m2_venue', 'valor_m2_museo', 'valor_m2_escuela', 'valor_m2_estacionamiento', 'valor_m2_departamento', 'valor_m2_restaurante', 'valor_m2_otro'] },
  { grupo: 'Costo de construcción por m²', claves: ['costo_m2_venue', 'costo_m2_museo', 'costo_m2_escuela', 'costo_m2_estacionamiento', 'costo_m2_departamento', 'costo_m2_restaurante', 'costo_m2_otro'] },
  { grupo: 'Generales', claves: ['gastos_generales', 'acciones_emitidas', 'multiplo_operativo', 'multiplo_regalias'] },
]

function Parametros({ esAdmin }) {
  const { datos, editarFila } = usarDatos()
  const [abierto, setAbierto] = useState(false)
  const filas = datos?.Config || []

  return (
    <section className="tarjeta overflow-hidden">
      <button className="w-full p-4 flex items-center gap-3 text-left" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
        <div className="flex-1">
          <div className="font-titulo text-lg">Parámetros globales</div>
          <div className="text-xs text-terciario">
            {esAdmin ? 'Solo admin los edita · todos marcados “supuesto — editable”' : 'Solo lectura para tu rol'}
          </div>
        </div>
        {abierto ? <ChevronUp size={16} className="text-terciario" /> : <ChevronDown size={16} className="text-terciario" />}
      </button>
      {abierto && (
        <div className="px-4 pb-4 space-y-4 border-t border-linea pt-3">
          {PARAMETROS.map((g) => (
            <div key={g.grupo}>
              <div className="text-xs uppercase tracking-wide text-terciario mb-2">{g.grupo}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {g.claves.map((clave) => {
                  const fila = filas.find((f) => normalizarId(f.clave) === clave)
                  if (!fila) return null
                  return (
                    <label key={clave} className="flex items-center gap-2">
                      <span className="text-xs text-arena flex-1">{fila.clave}</span>
                      <input
                        className="campo !py-1.5 !w-32 text-sm cifra text-right"
                        value={fila.valor ?? ''}
                        onChange={(e) => editarFila('Config', fila.clave, { valor: e.target.value })}
                        disabled={!esAdmin}
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// --- El panel del VALOR POR ACCIÓN ---------------------------
function PanelValor({ g }) {
  const v = g.valorPorAccion
  const total = Math.max(v.total, 1)
  const partes = [
    { nombre: 'Inmobiliario', valor: v.inmobiliario, color: 'bg-terracota' },
    { nombre: 'Operativo', valor: v.operativo, color: 'bg-oro' },
    { nombre: 'Regalías', valor: v.regalias, color: 'bg-salvia' },
  ]

  return (
    <div className="tarjeta bg-elevada border-t-2 border-t-ambar p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-arena">Valor por acción</div>
      <div className="cifra font-cartel font-normal text-4xl text-marfil mt-1 glow-ambar">
        {v.porAccion === null ? '—' : moneda(v.porAccion)}
      </div>
      {v.porAccion === null && (
        <p className="text-terciario text-xs mt-1">
          Falta capturar acciones_emitidas en los parámetros globales.
        </p>
      )}

      {/* Desglose apilado de los 3 componentes */}
      <div className="flex h-2.5 rounded-full overflow-hidden mt-4 bg-linea">
        {partes.map((p) => (
          <div key={p.nombre} className={p.color} style={{ width: `${Math.max((p.valor / total) * 100, 0)}%` }} />
        ))}
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        {partes.map((p) => (
          <div key={p.nombre} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
            <dt className="text-arena flex-1">{p.nombre}</dt>
            <dd className="cifra text-marfil">{moneda(p.valor)}</dd>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-linea pt-1.5">
          <dt className="text-marfil font-medium flex-1">Valor del proyecto</dt>
          <dd className="cifra text-oro font-medium">{moneda(v.total)}</dd>
        </div>
      </dl>

      <dl className="mt-4 space-y-1.5 text-sm border-t border-linea pt-3">
        <div className="flex justify-between"><dt className="text-arena">Costo de construcción</dt><dd className="cifra text-marfil">{moneda(g.costoConstruccion)}</dd></div>
        <div className="flex justify-between"><dt className="text-arena">Utilidad anual total</dt><dd className="cifra text-marfil">{moneda(g.utilidadTotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-arena">Años de recuperación</dt>
          <dd className="cifra text-marfil">{g.aniosRecuperacion === null ? '—' : g.aniosRecuperacion.toFixed(1)}</dd>
        </div>
      </dl>

      {/* Por espacio */}
      {g.porEspacio.length > 0 && (
        <dl className="mt-4 space-y-1 text-xs border-t border-linea pt-3">
          <div className="text-terciario uppercase tracking-wide mb-1">Utilidad por espacio</div>
          {g.porEspacio.map(({ espacio, utilidad }) => (
            <div key={espacio.id} className="flex justify-between">
              <dt className="text-arena truncate mr-2">{espacio.nombre}</dt>
              <dd className={`cifra ${utilidad >= 0 ? 'text-marfil' : 'text-ladrillo'}`}>{moneda(utilidad)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

// --- La vista completa ---------------------------------------
export default function Financiero() {
  const { sesion, datos, modo } = usarDatos()
  const editable = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)
  const esAdmin = modo !== 'demo' && sesion?.rol === 'admin'
  const [panelAbierto, setPanelAbierto] = useState(false)

  const espacios = datos?.Espacios || []
  const g = resumenGlobal({
    espacios,
    lineas: datos?.Finanzas_Lineas || [],
    factores: datos?.Factores || [],
    escenarios: datos?.Escenarios || [],
    config: mapaConfig(datos?.Config || []),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-6 lg:items-start">
      <div className="space-y-4 pb-28 lg:pb-8">
        <h2 className="font-cartel font-normal uppercase tracking-wide text-2xl">El modelo de negocio</h2>
        {espacios.length === 0 && (
          <div className="tarjeta p-8 text-center">
            <p className="text-marfil font-medium">Aún no hay espacios.</p>
            <p className="text-terciario text-sm mt-1">
              Primero crea los espacios en el mapa; aquí les armas su modelo.
            </p>
          </div>
        )}
        {espacios.map((e) => (
          <BloqueEspacio key={e.id} espacio={e} editable={editable} />
        ))}
        <Parametros esAdmin={esAdmin} />
      </div>

      {/* Panel lateral siempre visible en pantalla ancha */}
      <div className="hidden lg:block sticky top-20">
        <PanelValor g={g} />
      </div>

      {/* En teléfono: barra inferior fija, colapsada, que se expande */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
        {panelAbierto && (
          <div className="mx-3 mb-2 max-h-[60dvh] overflow-y-auto rounded-2xl shadow-2xl">
            <PanelValor g={g} />
          </div>
        )}
        <button
          className="w-full bg-elevada border-t-2 border-t-ambar px-5 py-3 flex items-center gap-3 shadow-2xl"
          onClick={() => setPanelAbierto(!panelAbierto)}
          aria-expanded={panelAbierto}
        >
          <span className="text-xs uppercase tracking-widest text-arena">Valor por acción</span>
          <span className="cifra font-cartel font-normal text-xl text-marfil flex-1 text-right glow-ambar">
            {g.valorPorAccion.porAccion === null ? '—' : moneda(g.valorPorAccion.porAccion)}
          </span>
          {panelAbierto ? <ChevronDown size={16} className="text-terciario" /> : <ChevronUp size={16} className="text-terciario" />}
        </button>
      </div>
    </div>
  )
}

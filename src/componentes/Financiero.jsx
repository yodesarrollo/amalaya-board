import { useState, useRef } from 'react'
import { Plus, X, ChevronDown, ChevronUp, Columns2, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { puedeEditarRol } from '../roles.js'
import { moneda, porcentaje } from '../formato.js'
import { resumenGlobal, resumenEspacio, montoLinea, mapaConfig, configNum, normalizarId, resumenConEscenario, sugerirFactores } from '../calc.js'

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

// --- Campo del monto con autocompletar ----------------------
// Al escribir una fórmula (=...) sugiere los factores del espacio.
function CampoFormula({ valor, onCambio, factores, editable }) {
  const ref = useRef(null)
  const [sug, setSug] = useState({ sugerencias: [], desde: 0 })
  const [elegida, setElegida] = useState(0)
  const etiquetas = factores.map((f) => f.etiqueta)

  function revisar(texto, cursor) {
    setSug(sugerirFactores(texto, cursor, etiquetas))
    setElegida(0)
  }
  function insertar(id) {
    const el = ref.current
    const texto = String(valor ?? '')
    const cursor = el?.selectionStart ?? texto.length
    const nuevo = texto.slice(0, sug.desde) + id + texto.slice(cursor)
    onCambio(nuevo)
    setSug({ sugerencias: [], desde: 0 })
    requestAnimationFrame(() => { el?.focus(); const p = sug.desde + id.length; el?.setSelectionRange(p, p) })
  }
  return (
    <div className="relative flex-1">
      <input
        ref={ref}
        className="campo !py-1.5 w-full text-sm cifra"
        value={valor ?? ''}
        onChange={(e) => { onCambio(e.target.value); revisar(e.target.value, e.target.selectionStart) }}
        onKeyDown={(e) => {
          if (!sug.sugerencias.length) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setElegida((elegida + 1) % sug.sugerencias.length) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setElegida((elegida - 1 + sug.sugerencias.length) % sug.sugerencias.length) }
          else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertar(sug.sugerencias[elegida]) }
          else if (e.key === 'Escape') setSug({ sugerencias: [], desde: 0 })
        }}
        onBlur={() => setTimeout(() => setSug({ sugerencias: [], desde: 0 }), 150)}
        disabled={!editable}
        placeholder="Monto anual, o =alumnos * mensualidad * 12"
        aria-autocomplete="list"
      />
      {sug.sugerencias.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 border border-oro/60 rounded-lg shadow-2xl overflow-hidden" style={{ background: "#1C1613" }} role="listbox" aria-label="Factores del espacio">
          {sug.sugerencias.map((id, i) => (
            <li key={id}>
              <button
                type="button"
                role="option"
                aria-selected={i === elegida}
                className={`w-full text-left px-3 py-1.5 text-xs cifra ${i === elegida ? 'bg-oro/20 text-marfil' : 'text-arena'}`}
                onMouseDown={(e) => { e.preventDefault(); insertar(id) }}
              >
                {id} <span className="text-terciario">= {factores.find((f) => normalizarId(f.etiqueta) === id)?.valor ?? ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
        <CampoFormula
          valor={linea.monto_anual}
          onCambio={(v) => editarFila('Finanzas_Lineas', linea.id, { monto_anual: v })}
          factores={factores}
          editable={editable}
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
        <div className="flex-1" />
        <EstadoGuardado tab="Finanzas_Lineas" id={linea.id} />
      </div>

      {/* El supuesto, visible bajo la línea; marca suave si falta */}
      <label className={`flex items-center gap-2 text-xs rounded px-2 py-1 ${String(linea.supuesto || '').trim() ? '' : 'border border-dashed border-oro/50'}`}>
        <span className={String(linea.supuesto || '').trim() ? 'text-terciario' : 'text-oro'}>
          {String(linea.supuesto || '').trim() ? 'Supuesto:' : 'Falta supuesto:'}
        </span>
        <input
          className="bg-transparent flex-1 text-arena placeholder:text-terciario outline-none"
          value={linea.supuesto || ''}
          onChange={(e) => editarFila('Finanzas_Lineas', linea.id, { supuesto: e.target.value })}
          disabled={!editable}
          placeholder={editable ? 'de dónde sale este número (ej. 12 meses × $2,500 por alumno)' : '—'}
        />
      </label>
    </div>
  )
}

// --- El bloque de un espacio --------------------------------
function BloqueEspacio({ espacio, editable, ajuste }) {
  const { datos, crearFila, editarFila } = usarDatos()
  // Tarjetas cerradas por defecto (nombre + utilidad); se abren al tocar.
  const [abierto, setAbierto] = useState(false)
  const [comparando, setComparando] = useState(false)
  const [nuevoEscenario, setNuevoEscenario] = useState('')

  const lineas = (datos?.Finanzas_Lineas || []).filter((l) => String(l.espacio_id) === String(espacio.id))
  const escenarios = (datos?.Escenarios || []).filter((e) => String(e.espacio_id) === String(espacio.id))
  const factores = (datos?.Factores || []).filter((f) => String(f.espacio_id) === String(espacio.id))
  const r = resumenEspacio(espacio, datos?.Finanzas_Lineas || [], datos?.Factores || [], datos?.Escenarios || [], ajuste)

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
              Escenarios (uno a la vez: prender uno apaga los demás)
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
                    onClick={() => {
                      // Excluyentes por espacio: dos escenarios activos a la
                      // vez sumarían sus líneas DOBLE en el reporte al banco.
                      if (!activo) {
                        escenarios
                          .filter((o) => o.id !== esc.id && normalizarId(o.activo) === 'si')
                          .forEach((o) => editarFila('Escenarios', o.id, { activo: 'no' }))
                      }
                      editarFila('Escenarios', esc.id, { activo: activo ? 'no' : 'si' })
                    }}
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
            {escenarios.length >= 2 && (
              <button className="text-xs text-arena hover:text-marfil flex items-center gap-1.5 mt-2" onClick={() => setComparando(!comparando)}>
                <Columns2 size={13} /> {comparando ? 'Cerrar comparación' : 'Comparar dos escenarios'}
              </button>
            )}
            {comparando && <CompararEscenarios espacio={espacio} escenarios={escenarios} />}
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

// --- Comparar dos escenarios lado a lado --------------------
function CompararEscenarios({ espacio, escenarios }) {
  const { datos } = usarDatos()
  const [a, setA] = useState(escenarios[0]?.id || '')
  const [b, setB] = useState(escenarios[1]?.id || '')
  const calc = (id) => resumenConEscenario(espacio, datos?.Finanzas_Lineas || [], datos?.Factores || [], datos?.Escenarios || [], id || null)
  const ra = calc(a); const rb = calc(b)
  const filas = [['Ingreso', 'ingreso'], ['Costo', 'costo'], ['Utilidad', 'utilidad']]
  const sel = (v, set) => (
    <select className="campo !py-1 !px-2 text-xs !w-full" value={v} onChange={(e) => set(e.target.value)}>
      <option value="">solo lo que aplica siempre</option>
      {escenarios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
    </select>
  )
  return (
    <div className="mt-2 rounded-lg border border-linea p-3" aria-label="Comparación de escenarios">
      <div className="grid grid-cols-[6rem_1fr_1fr] gap-2 items-center text-xs">
        <span />
        {sel(a, setA)}
        {sel(b, setB)}
        {filas.map(([t, k]) => (
          <div key={k} className="contents">
            <span className="text-terciario">{t}</span>
            <span className={`cifra text-right ${k === 'utilidad' ? 'text-marfil font-medium' : 'text-arena'}`}>{moneda(ra[k])}</span>
            <span className={`cifra text-right ${k === 'utilidad' ? 'text-marfil font-medium' : 'text-arena'}`}>{moneda(rb[k])}</span>
          </div>
        ))}
      </div>
      <p className="text-terciario text-[11px] mt-2">
        Diferencia de utilidad: <b className={`cifra ${rb.utilidad - ra.utilidad >= 0 ? 'text-salvia' : 'text-ladrillo'}`}>{moneda(rb.utilidad - ra.utilidad)}</b> · comparar no cambia qué escenario está prendido.
      </p>
    </div>
  )
}

// --- ¿Y si…? (no guarda nada) -------------------------------
function YSi({ ajuste, setAjuste }) {
  const [abierto, setAbierto] = useState(false)
  const movido = ajuste.ocupacion !== 0 || ajuste.precio !== 0
  const control = (clave, titulo) => (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-arena w-20">{titulo}</span>
      <input type="range" min="-30" max="30" step="5" value={ajuste[clave]} className="flex-1 accent-[#C9A45C]"
        onChange={(e) => setAjuste({ ...ajuste, [clave]: Number(e.target.value) })} aria-label={`${titulo} (%)`} />
      <span className="cifra w-10 text-right text-marfil">{ajuste[clave] > 0 ? '+' : ''}{ajuste[clave]}%</span>
    </label>
  )
  return (
    <div className="mt-3 border-t border-linea pt-2">
      <button className={`text-xs flex items-center gap-1.5 ${movido ? 'text-ambar' : 'text-terciario hover:text-arena'}`} onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
        <SlidersHorizontal size={12} /> ¿Y si…?{movido ? ' (activo · no se guarda)' : ''}
      </button>
      {abierto && (
        <div className="mt-2 space-y-1.5">
          {control('ocupacion', 'Ocupación')}
          {control('precio', 'Precios')}
          <div className="flex items-center justify-between">
            <span className="text-terciario text-[11px]">Mueve los ingresos; no guarda nada.</span>
            {movido && (
              <button className="text-[11px] text-arena hover:text-marfil flex items-center gap-1" onClick={() => setAjuste({ ocupacion: 0, precio: 0 })}>
                <RotateCcw size={11} /> volver
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Parámetros globales (Config, solo admin) ----------------
const PARAMETROS = [
  { grupo: 'Valor inmobiliario por m² (para el componente inmobiliario)', claves: ['valor_m2_venue', 'valor_m2_comercial', 'valor_m2_mixto', 'valor_m2_museo', 'valor_m2_escuela', 'valor_m2_estacionamiento', 'valor_m2_departamento', 'valor_m2_restaurante', 'valor_m2_estudio', 'valor_m2_otro'] },
  { grupo: 'Costo de construcción por m²', claves: ['costo_m2_venue', 'costo_m2_comercial', 'costo_m2_mixto', 'costo_m2_museo', 'costo_m2_escuela', 'costo_m2_estacionamiento', 'costo_m2_departamento', 'costo_m2_restaurante', 'costo_m2_estudio', 'costo_m2_otro'] },
  { grupo: 'Generales', claves: ['gastos_generales', 'acciones_emitidas', 'multiplo_operativo', 'multiplo_regalias', 'split_distrito', 'split_artista', 'split_compositor'] },
]

function Parametros({ esAdmin }) {
  const { datos, editarFila, crearFila } = usarDatos()
  const [abierto, setAbierto] = useState(false)
  const [creandoClave, setCreandoClave] = useState(null)
  const filas = datos?.Config || []

  // Un parámetro esperado que aún no existe en el Sheet se activa con un
  // clic (fila nueva en Config) — sin abrir la hoja a mano.
  async function activarClave(clave) {
    setCreandoClave(clave)
    try {
      await crearFila('Config', { clave, valor: '0', notas: 'supuesto — editable' })
    } finally {
      setCreandoClave(null)
    }
  }

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
                  if (!fila) {
                    if (!esAdmin) return null
                    return (
                      <div key={clave} className="flex items-center gap-2">
                        <span className="text-xs text-terciario flex-1">{clave}</span>
                        <button
                          className="boton-secundario !px-3 !py-1 text-xs"
                          onClick={() => activarClave(clave)}
                          disabled={creandoClave === clave}
                        >
                          {creandoClave === clave ? 'Creando…' : '+ activar'}
                        </button>
                      </div>
                    )
                  }
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

// --- El desglose "en cristiano" ------------------------------
// El panel lo pidió con 4 votos: el número gordo tocable que se
// explica en cuatro renglones, sin lenguaje de contador.
function DesgloseCristiano({ g, config, onCerrar }) {
  const v = g.valorPorAccion
  const acciones = configNum(config, 'acciones_emitidas', 0)
  const rendimiento = v.total > 0 ? (g.utilidadTotal / v.total) * 100 : null

  return (
    <div className="fixed inset-0 z-50 bg-noche/80 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <div className="tarjeta bg-elevada p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-cartel font-normal uppercase tracking-wide text-xl">¿Qué es este número?</h3>
        <div className="mt-4 space-y-3 text-sm leading-relaxed">
          <p className="text-marfil">
            El proyecto completo vale <b className="cifra">{moneda(v.total)}</b>, dividido en{' '}
            <b className="cifra">{acciones > 0 ? acciones.toLocaleString('es-MX') : '—'}</b> acciones:
            cada una vale <b className="cifra text-ambar">{v.porAccion === null ? '—' : moneda(v.porAccion)}</b>.
          </p>
          <div className="space-y-1.5">
            <p className="text-arena">Ese valor viene de tres lugares:</p>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-terracota shrink-0" /><span className="text-arena flex-1">El terreno y lo construido</span><span className="cifra text-marfil">{moneda(v.inmobiliario)}</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-oro shrink-0" /><span className="text-arena flex-1">Lo que deja operar los espacios</span><span className="cifra text-marfil">{moneda(v.operativo)}</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-salvia shrink-0" /><span className="text-arena flex-1">Las regalías de la música</span><span className="cifra text-marfil">{moneda(v.regalias)}</span></div>
          </div>
          <p className="text-arena">
            Con una acción eres dueño de un pedacito de todo eso: del recinto,
            de su operación y de su música.
          </p>
          {rendimiento !== null && (
            <p className="text-terciario text-xs leading-relaxed border-t border-linea pt-3">
              La utilidad anual equivale al <b className="cifra">{porcentaje(rendimiento)}</b> del
              valor del proyecto — además de tu parte del inmueble, que es patrimonio.
              Esto no es un pagaré: es ser socio de un pedazo de ciudad.
            </p>
          )}
        </div>
        <button className="boton-primario w-full mt-5 !py-2 text-sm" onClick={onCerrar}>Entendido</button>
      </div>
    </div>
  )
}

// --- El panel del VALOR POR ACCIÓN ---------------------------
function PanelValor({ g, onExplicar, ajuste, setAjuste }) {
  const v = g.valorPorAccion
  const total = Math.max(v.total, 1)
  const partes = [
    { nombre: 'Inmobiliario', valor: v.inmobiliario, color: 'bg-terracota' },
    { nombre: 'Operativo', valor: v.operativo, color: 'bg-oro' },
    { nombre: 'Regalías', valor: v.regalias, color: 'bg-salvia' },
  ]

  return (
    <div className="tarjeta bg-elevada border-t-2 border-t-ambar p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-arena">
        Valor por acción{(ajuste?.ocupacion || ajuste?.precio) ? <span className="text-ambar normal-case tracking-normal"> · ¿y si…?</span> : null}
      </div>
      <button
        className="cifra font-cartel font-normal text-4xl text-marfil mt-1 glow-ambar text-left"
        onClick={onExplicar}
        title="¿Qué significa este número?"
      >
        {v.porAccion === null ? '—' : moneda(v.porAccion)}
      </button>
      <button className="block text-terciario text-xs underline decoration-linea underline-offset-2" onClick={onExplicar}>
        ¿qué significa?
      </button>
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

      {setAjuste && <YSi ajuste={ajuste} setAjuste={setAjuste} />}

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
  const editable = modo !== 'demo' && puedeEditarRol(sesion?.rol)
  const esAdmin = modo !== 'demo' && sesion?.rol === 'admin'
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [explicando, setExplicando] = useState(false)
  const [ajuste, setAjuste] = useState({ ocupacion: 0, precio: 0 }) // ¿Y si…? — nunca se guarda

  const espacios = datos?.Espacios || []
  const config = mapaConfig(datos?.Config || [])
  const g = resumenGlobal({
    espacios,
    lineas: datos?.Finanzas_Lineas || [],
    factores: datos?.Factores || [],
    escenarios: datos?.Escenarios || [],
    config,
    ajuste,
  })

  // Hay regalías en el modelo → se enseña el reparto (mata la duda de
  // "¿regalías de quién?" que levantó el productor del panel).
  const hayRegalias = g.regaliasTotal > 0
  const split = {
    distrito: configNum(config, 'split_distrito', 30),
    artista: configNum(config, 'split_artista', 50),
    compositor: configNum(config, 'split_compositor', 20),
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-6 lg:items-start">
      <div className="space-y-4 pb-40 sm:pb-28 lg:pb-8">
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
          <BloqueEspacio key={e.id} espacio={e} editable={editable} ajuste={ajuste} />
        ))}

        {hayRegalias && (
          <section className="tarjeta p-4">
            <div className="text-xs uppercase tracking-wide text-terciario mb-2">
              Cómo se reparten las regalías
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-linea">
              <span className="bg-salvia" style={{ width: `${split.artista}%` }} />
              <span className="bg-oro" style={{ width: `${split.compositor}%` }} />
              <span className="bg-terracota" style={{ width: `${split.distrito}%` }} />
            </div>
            <div className="flex gap-4 flex-wrap mt-2 text-xs text-arena">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-salvia" /> artista {split.artista}%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-oro" /> compositor {split.compositor}%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-terracota" /> distrito {split.distrito}%</span>
            </div>
            <p className="text-terciario text-xs mt-2 leading-relaxed">
              El artista graba en la escuela-estudio y conserva la parte mayor;
              el distrito retiene su porcentaje por producir. Supuesto — editable
              en los parámetros (split_artista, split_compositor, split_distrito).
            </p>
          </section>
        )}

        <Parametros esAdmin={esAdmin} />
      </div>

      {/* Panel lateral siempre visible en pantalla ancha */}
      <div className="hidden lg:block sticky top-20">
        <PanelValor g={g} onExplicar={() => setExplicando(true)} ajuste={ajuste} setAjuste={setAjuste} />
      </div>

      {/* En teléfono: barra inferior fija, colapsada, que se expande */}
      <div className="lg:hidden fixed inset-x-0 bottom-14 sm:bottom-0 z-40">
        {panelAbierto && (
          <div className="mx-3 mb-2 max-h-[60dvh] overflow-y-auto rounded-2xl shadow-2xl">
            <PanelValor g={g} onExplicar={() => setExplicando(true)} ajuste={ajuste} setAjuste={setAjuste} />
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

      {explicando && <DesgloseCristiano g={g} config={config} onCerrar={() => setExplicando(false)} />}
    </div>
  )
}

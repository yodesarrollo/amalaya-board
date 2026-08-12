import { useState } from 'react'
import { Plus } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { resumenEspacio } from '../calc.js'
import { moneda } from '../formato.js'

// ============================================================
// Los factores ajustables de un espacio — el corazón del board.
//
// Cada factor es una fila de la pestaña Factores y se pinta según
// su tipo_control: slider, switch, numero, texto o seleccion (las
// opciones de una selección van en `unidad`, separadas por |).
// Mover un control actualiza la pantalla AL INSTANTE (optimista),
// recalcula las sumatorias del espacio, y escribe el valor al
// Sheet agrupado (debounce). El estado de guardado es HONESTO:
// "Guardando…" se sostiene hasta el ok real del servidor.
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

function num(v, porDefecto) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : porDefecto
}

function Control({ factor, editable }) {
  const { editarFila } = usarDatos()
  const tipo = String(factor.tipo_control || 'numero').toLowerCase()
  const cambiar = (valor) => editarFila('Factores', factor.id, { valor: String(valor) })

  if (tipo === 'slider') {
    const min = num(factor.min, 0)
    const max = num(factor.max, 100)
    const paso = num(factor.paso, 1)
    const v = num(factor.valor, min)
    return (
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="deslizador flex-1"
          min={min} max={max} step={paso} value={v}
          onChange={(e) => cambiar(e.target.value)}
          disabled={!editable}
        />
        <span className="cifra text-marfil text-sm w-16 text-right">
          {v}{factor.unidad ? ` ${factor.unidad}` : ''}
        </span>
      </div>
    )
  }

  if (tipo === 'switch') {
    const encendido = String(factor.valor).toLowerCase() === 'si'
    return (
      <button
        role="switch"
        aria-checked={encendido}
        disabled={!editable}
        onClick={() => cambiar(encendido ? 'no' : 'si')}
        className={`relative w-12 h-7 rounded-full transition-colors duration-micro ease-casa
          ${encendido ? 'bg-oro' : 'bg-linea'} disabled:opacity-40`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-marfil transition-transform duration-micro ease-casa
            ${encendido ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    )
  }

  if (tipo === 'seleccion') {
    const opciones = String(factor.unidad || '').split('|').map((s) => s.trim()).filter(Boolean)
    return (
      <select className="campo !py-2" value={factor.valor || ''} onChange={(e) => cambiar(e.target.value)} disabled={!editable}>
        <option value="">—</option>
        {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  if (tipo === 'texto') {
    return (
      <input className="campo !py-2" value={factor.valor || ''} onChange={(e) => cambiar(e.target.value)} disabled={!editable} />
    )
  }

  // numero (por defecto)
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="campo !py-2 cifra"
        value={factor.valor === '' || factor.valor === undefined ? '' : num(factor.valor, '')}
        min={factor.min !== '' ? num(factor.min, undefined) : undefined}
        max={factor.max !== '' ? num(factor.max, undefined) : undefined}
        step={factor.paso !== '' ? num(factor.paso, undefined) : undefined}
        onChange={(e) => cambiar(e.target.value)}
        disabled={!editable}
      />
      {factor.unidad && <span className="text-terciario text-xs whitespace-nowrap">{factor.unidad}</span>}
    </div>
  )
}

export default function Factores({ espacio }) {
  const { sesion, datos, modo, crearFila } = usarDatos()
  const editable = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)
  const [agregando, setAgregando] = useState(false)

  const factores = (datos?.Factores || [])
    .filter((f) => String(f.espacio_id) === String(espacio.id))
    .sort((a, b) => num(a.orden, 999) - num(b.orden, 999))

  // Sumatorias del espacio, recalculadas en vivo con cada movimiento.
  const r = resumenEspacio(espacio, datos?.Finanzas_Lineas || [], datos?.Factores || [], datos?.Escenarios || [])
  const hayLineas = (datos?.Finanzas_Lineas || []).some((l) => String(l.espacio_id) === String(espacio.id))

  return (
    <div className="space-y-4">
      {factores.length === 0 && (
        <p className="text-terciario text-sm leading-relaxed">
          Este espacio aún no tiene factores.{' '}
          {editable ? 'Agrega el primero — por ejemplo “Alumnos” como slider.' : ''}
        </p>
      )}

      {factores.map((f) => (
        <div key={f.id} className="tarjeta p-4">
          <div className="flex items-baseline justify-between gap-2 mb-2.5">
            <span className="text-sm text-marfil font-medium">{f.etiqueta}</span>
            <EstadoGuardado tab="Factores" id={f.id} />
          </div>
          <Control factor={f} editable={editable} />
          {f.ligado_a && (
            <p className="text-terciario text-xs mt-2">Mueve: {f.ligado_a}</p>
          )}
        </div>
      ))}

      {editable && !agregando && (
        <button className="boton-secundario w-full text-sm" onClick={() => setAgregando(true)}>
          <span className="flex items-center justify-center gap-1.5"><Plus size={14} /> Agregar factor</span>
        </button>
      )}
      {agregando && (
        <FormaNuevoFactor
          espacioId={espacio.id}
          orden={factores.length + 1}
          onCrear={crearFila}
          onCerrar={() => setAgregando(false)}
        />
      )}

      {hayLineas ? (
        <div className="tarjeta bg-elevada p-4 border-t-2 border-t-oro">
          <div className="text-xs uppercase tracking-wide text-terciario mb-2">Este espacio, al año</div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-arena">Ingreso</dt><dd className="cifra text-marfil">{moneda(r.ingreso)}</dd></div>
            <div className="flex justify-between"><dt className="text-arena">Costo</dt><dd className="cifra text-marfil">{moneda(r.costo)}</dd></div>
            <div className="flex justify-between border-t border-linea pt-1.5"><dt className="text-marfil font-medium">Utilidad</dt><dd className="cifra text-oro font-medium">{moneda(r.utilidad)}</dd></div>
          </dl>
          {r.errores.length > 0 && (
            <p className="text-xs mt-2 text-noche bg-oro/90 rounded px-2 py-1">
              {r.errores.length} línea(s) con fórmula rota: {r.errores[0].error}
            </p>
          )}
        </div>
      ) : (
        <p className="text-terciario text-xs">
          Las líneas de ingreso y costo que estos factores alimentan llegan con
          el motor financiero (Fase 4).
        </p>
      )}
    </div>
  )
}

function FormaNuevoFactor({ espacioId, orden, onCrear, onCerrar }) {
  const [etiqueta, setEtiqueta] = useState('')
  const [tipo, setTipo] = useState('slider')
  const [min, setMin] = useState('0')
  const [max, setMax] = useState('100')
  const [paso, setPaso] = useState('1')
  const [unidad, setUnidad] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(ev) {
    ev.preventDefault()
    if (!etiqueta.trim()) return
    setOcupado(true)
    setError(null)
    try {
      await onCrear('Factores', {
        espacio_id: espacioId,
        etiqueta: etiqueta.trim(),
        tipo_control: tipo,
        valor: tipo === 'switch' ? 'no' : tipo === 'slider' ? min : '',
        min, max, paso,
        unidad: unidad.trim(),
        ligado_a: '',
        orden: String(orden),
      })
      onCerrar()
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  const esRango = tipo === 'slider' || tipo === 'numero'
  return (
    <form className="tarjeta bg-elevada p-4 space-y-3" onSubmit={enviar}>
      <div className="text-sm text-marfil font-medium">Nuevo factor</div>
      <label className="block">
        <span className="text-xs text-arena">Etiqueta (así se usa en las fórmulas)</span>
        <input className="campo !py-2 mt-1" value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} placeholder="Ej. Alumnos" autoFocus disabled={ocupado} />
      </label>
      <label className="block">
        <span className="text-xs text-arena">Tipo de control</span>
        <select className="campo !py-2 mt-1" value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={ocupado}>
          <option value="slider">slider</option>
          <option value="numero">número</option>
          <option value="switch">switch (sí/no)</option>
          <option value="seleccion">selección</option>
          <option value="texto">texto</option>
        </select>
      </label>
      {esRango && (
        <div className="grid grid-cols-3 gap-2">
          <label className="block"><span className="text-xs text-arena">Mín</span><input className="campo !py-2 mt-1 cifra" type="number" value={min} onChange={(e) => setMin(e.target.value)} disabled={ocupado} /></label>
          <label className="block"><span className="text-xs text-arena">Máx</span><input className="campo !py-2 mt-1 cifra" type="number" value={max} onChange={(e) => setMax(e.target.value)} disabled={ocupado} /></label>
          <label className="block"><span className="text-xs text-arena">Paso</span><input className="campo !py-2 mt-1 cifra" type="number" value={paso} onChange={(e) => setPaso(e.target.value)} disabled={ocupado} /></label>
        </div>
      )}
      <label className="block">
        <span className="text-xs text-arena">
          {tipo === 'seleccion' ? 'Opciones (separadas por |)' : 'Unidad (opcional)'}
        </span>
        <input className="campo !py-2 mt-1" value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder={tipo === 'seleccion' ? 'renta|boletería|mixto' : 'Ej. alumnos, m², $/mes'} disabled={ocupado} />
      </label>
      {error && <p className="text-ladrillo text-xs" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className="boton-secundario flex-1 !py-2 text-sm" onClick={onCerrar} disabled={ocupado}>Cancelar</button>
        <button type="submit" className="boton-primario flex-1 !py-2 text-sm" disabled={ocupado || !etiqueta.trim()}>
          {ocupado ? 'Creando…' : 'Crear'}
        </button>
      </div>
    </form>
  )
}

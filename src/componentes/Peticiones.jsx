import { useState } from 'react'
import { X, ChevronRight, ListChecks } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { leerElementos, Cortina } from './Rutas.jsx'
import { peticionesDe } from '../moac.js'

// ============================================================
// Peticiones a la ciudad — lista agrupada por RUTA (sin barra de
// avance) y una ventana de detalle por petición: texto, estado,
// foto de hoy y render de la visión con la cortina antes/después.
// El recorrido 360 se queda como está.
//
// `publicas`: sin sesión (tracker público) los datos llegan del
// endpoint anónimo; con sesión, del estado del board.
// ============================================================

const ESTADO = {
  pendiente: { titulo: 'Pendiente de pedir', clase: 'text-oro border-oro' },
  gestionado: { titulo: 'Gestionado con el municipio', clase: 'text-arena border-arena' },
  logrado: { titulo: 'Logrado', clase: 'text-salvia border-salvia' },
}

export default function Peticiones({ onCerrar, publicas = null }) {
  const contexto = usarDatos()
  const rutas = publicas ? publicas.rutas : contexto?.datos?.Rutas || []
  const paradas = publicas ? publicas.paradas : contexto?.datos?.Paradas || []
  const tareas = publicas ? [] : contexto?.datos?.Tareas || []
  const [detalle, setDetalle] = useState(null)

  const todas = peticionesDe(paradas, rutas, leerElementos)
  const porRuta = rutas
    .map((r) => ({ ruta: r, peticiones: todas.filter((p) => String(p.ruta?.id) === String(r.id)) }))
    .filter((g) => g.peticiones.length)
  const sinRuta = todas.filter((p) => !p.ruta)
  if (sinRuta.length) porRuta.push({ ruta: { id: '', nombre: 'Sin ruta', color: '#9E8D78' }, peticiones: sinRuta })

  return (
    <div className="fixed inset-0 z-50 bg-noche/70 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <div className="tarjeta bg-elevada w-full max-w-lg max-h-[85dvh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-titulo text-2xl">Peticiones a la ciudad</h3>
            <p className="text-terciario text-sm mt-1">
              Lo que cada ruta le pide a la ciudad. Toca una petición para ver su detalle.
            </p>
          </div>
          <button className="text-arena hover:text-marfil p-2 -m-2 transition-colors duration-micro ease-casa" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {todas.length === 0 ? (
          <p className="text-terciario text-sm mt-6">
            Aún no hay peticiones. Se capturan en las paradas de cada ruta
            (banquetas, arbolado, alumbrado, bocinas, murales…).
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {porRuta.map(({ ruta, peticiones }) => (
              <section key={ruta.id || 'sin-ruta'} aria-label={ruta.nombre}>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-arena mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: ruta.color || '#C9A45C' }} />
                  {ruta.nombre} · <span className="cifra">{peticiones.length}</span>
                </div>
                <ul className="space-y-1.5">
                  {peticiones.map((p) => {
                    const acciones = tareas.filter((t) => String(t.peticion_id) === p.id).length
                    return (
                      <li key={p.id}>
                        <button className="tarjeta p-3 w-full flex items-center gap-3 text-left hover:border-oro/60" onClick={() => setDetalle(p)}>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-marfil">{p.texto}</div>
                            <div className="text-xs text-terciario truncate">
                              {p.parada.nombre}{acciones ? ` · ${acciones} acción${acciones === 1 ? '' : 'es'}` : ''}
                            </div>
                          </div>
                          <span className={`text-[11px] rounded-full border px-2 py-0.5 shrink-0 ${ESTADO[p.estado].clase}`}>{p.estado}</span>
                          <ChevronRight size={14} className="text-terciario shrink-0" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {detalle && <DetallePeticion peticion={detalle} tareas={tareas} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}

function DetallePeticion({ peticion, tareas, onCerrar }) {
  const acciones = tareas.filter((t) => String(t.peticion_id) === peticion.id)
  return (
    <div className="fixed inset-0 z-[60] bg-noche/80 flex items-end sm:items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); onCerrar() }}>
      <div className="tarjeta bg-elevada w-full max-w-xl max-h-[90dvh] overflow-y-auto p-5" role="dialog" aria-label="Detalle de la petición" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-terciario">
              <span className="w-2 h-2 rounded-full" style={{ background: peticion.ruta?.color || '#C9A45C' }} />
              {peticion.ruta?.nombre || 'Sin ruta'} · {peticion.parada.nombre}
            </div>
            <h4 className="font-titulo text-xl mt-1">{peticion.texto}</h4>
            <span className={`inline-block mt-1.5 text-[11px] rounded-full border px-2 py-0.5 ${ESTADO[peticion.estado].clase}`}>
              {ESTADO[peticion.estado].titulo}
            </span>
          </div>
          <button className="text-arena hover:text-marfil p-2 -m-2" onClick={onCerrar} aria-label="Cerrar detalle"><X size={18} /></button>
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-terciario mb-1.5">Hoy y la visión</div>
          <Cortina parada={peticion.parada} editable={false} onSubir={() => {}} />
        </div>

        {acciones.length > 0 && (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-terciario mb-1.5 flex items-center gap-1.5"><ListChecks size={12} /> Acciones del plan</div>
            <ul className="text-sm space-y-1">
              {acciones.map((t) => (
                <li key={t.id} className="text-arena">· {t.texto} <span className="text-terciario text-xs">{t.responsable ? `— ${t.responsable}` : ''}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

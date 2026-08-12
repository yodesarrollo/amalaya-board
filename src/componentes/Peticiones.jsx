import { X } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { leerElementos } from './Rutas.jsx'

// ============================================================
// Peticiones al municipio — la vista consolidada de todos los
// elementos deseados de todas las paradas, agrupados por estado.
// De aquí sale la lista con la que se toca la puerta del
// municipio, y el semáforo de lo que ya se logró.
// ============================================================

const GRUPOS = [
  { estado: 'pendiente', titulo: 'Pendientes de pedir', clase: 'text-oro border-oro' },
  { estado: 'gestionado', titulo: 'Gestionados con el municipio', clase: 'text-arena border-arena' },
  { estado: 'logrado', titulo: 'Logrados', clase: 'text-salvia border-salvia' },
]

export default function Peticiones({ onCerrar }) {
  const { datos } = usarDatos()
  const rutas = datos?.Rutas || []
  const paradas = datos?.Paradas || []

  // Aplanar: cada elemento con su parada y su ruta.
  const todos = paradas.flatMap((p) => {
    const ruta = rutas.find((r) => String(r.id) === String(p.ruta_id))
    return leerElementos(p).map((el) => ({
      texto: el.texto,
      estado: ['pendiente', 'gestionado', 'logrado'].includes(el.estado) ? el.estado : 'pendiente',
      parada: p.nombre,
      ruta: ruta?.nombre || '—',
      color: ruta?.color || '#C9A45C',
    }))
  })

  return (
    <div className="fixed inset-0 z-50 bg-noche/70 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <div
        className="tarjeta bg-elevada w-full max-w-lg max-h-[85dvh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-titulo text-2xl">Peticiones al municipio</h3>
            <p className="text-terciario text-sm mt-1">
              Todo lo que las rutas piden a la ciudad, con su estado. El estado
              se cambia en cada parada.
            </p>
          </div>
          <button className="text-arena hover:text-marfil p-2 -m-2 transition-colors duration-micro ease-casa" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {todos.length === 0 ? (
          <p className="text-terciario text-sm mt-6">
            Aún no hay elementos deseados. Se capturan en las paradas de cada
            ruta (banquetas, arbolado, alumbrado, bocinas, murales…).
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {GRUPOS.map((g) => {
              const filas = todos.filter((t) => t.estado === g.estado)
              if (filas.length === 0) return null
              return (
                <div key={g.estado}>
                  <div className={`text-xs uppercase tracking-wide mb-2 ${g.clase.split(' ')[0]}`}>
                    {g.titulo} · <span className="cifra">{filas.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {filas.map((t, i) => (
                      <div key={i} className="tarjeta p-3 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-marfil">{t.texto}</div>
                          <div className="text-xs text-terciario truncate">{t.ruta} · {t.parada}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

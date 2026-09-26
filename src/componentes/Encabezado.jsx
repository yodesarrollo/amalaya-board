import { useState } from 'react'
import { createPortal } from 'react-dom'
import { RefreshCw, LogOut, Settings, X } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { fechaHora } from '../formato.js'
import { NOMBRE_ROL } from '../roles.js'
import Usuarios from './Usuarios.jsx'

// Encabezado sobrio: sello, nombre, estado de sincronización,
// Actualizar y salir. La pastilla DEMOSTRACIÓN o "copia local"
// aparece junto al logo — discreta, nunca un banner.
export default function Encabezado() {
  const { sesion, modo, sincronizando, ultimaSync, errorSync, copiaTs, actualizar, salir } = usarDatos()
  // El engrane ⚙️ (solo admin) abre los accesos como ventana lateral.
  const [accesos, setAccesos] = useState(false)
  const esAdmin = modo !== 'demo' && sesion?.rol === 'admin'

  return (
    <header className="no-imprimir sticky top-0 z-40 bg-noche/95 backdrop-blur border-b border-linea">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/amalaya-board/sello.svg" alt="" className="w-8 h-8 rounded-lg" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-firma text-2xl leading-none">Amalaya</span>
          {modo === 'demo' && <span className="pastilla-demo">Demostración</span>}
          {/* Chinche #19: solo se ve si de verdad el servidor no contestó; dice de cuándo es lo que ves. */}
          {modo === 'copia' && errorSync && (
            <button
              onClick={actualizar}
              disabled={sincronizando}
              className="text-xs text-oro border border-oro/60 rounded-full px-2 py-0.5 whitespace-nowrap"
              title="El servidor no contestó. Toca para reintentar."
            >
              Sin conexión · copia de {haceCuanto(copiaTs)} · Reintentar
            </button>
          )}
        </div>

        <div className="flex-1" />

        {modo !== 'demo' && (
          <button
            onClick={actualizar}
            className="flex items-center gap-2 text-sm text-arena hover:text-marfil
                       transition-colors duration-micro ease-casa px-3 py-2 rounded-lg"
            disabled={sincronizando}
            title={ultimaSync ? `Última sincronización: ${fechaHora(ultimaSync)}` : 'Actualizar'}
          >
            <RefreshCw size={16} className={sincronizando ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{sincronizando ? 'Actualizando…' : 'Actualizar'}</span>
          </button>
        )}

        <div className="text-right hidden sm:block">
          <div className="text-sm text-marfil truncate max-w-[10rem]">{sesion?.nombre}</div>
          <div className="text-xs text-terciario">{NOMBRE_ROL[sesion?.rol] || sesion?.rol}</div>
        </div>

        {esAdmin && (
          <button
            onClick={() => setAccesos(true)}
            className="text-arena hover:text-marfil transition-colors duration-micro ease-casa p-2 rounded-lg"
            title="Accesos: quién entra y con qué rol"
            aria-label="Accesos"
          >
            <Settings size={16} />
          </button>
        )}

        <button
          onClick={salir}
          className="text-arena hover:text-marfil transition-colors duration-micro ease-casa p-2 rounded-lg"
          title="Salir"
        >
          <LogOut size={16} />
        </button>
      </div>
      {errorSync && modo !== 'demo' && (
        <div className="bg-superficie border-t border-linea">
          <p className="max-w-6xl mx-auto px-4 py-2 text-xs text-ladrillo">{errorSync}</p>
        </div>
      )}
      {/* Portal: el backdrop-blur del encabezado encerraría a un «fixed» */}
      {accesos && createPortal(
        <div className="fixed inset-0 z-50 bg-noche/70 flex justify-end" onClick={() => setAccesos(false)}>
          <aside
            className="h-full w-full max-w-xl bg-noche border-l border-linea overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Accesos"
          >
            <div className="sticky top-0 z-10 bg-noche/95 backdrop-blur border-b border-linea px-4 py-3 flex items-center">
              <span className="flex items-center gap-2 text-marfil"><Settings size={16} /> Accesos</span>
              <div className="flex-1" />
              <button className="text-arena hover:text-marfil p-2 rounded-lg flex items-center gap-1.5 text-sm" onClick={() => setAccesos(false)}>
                <X size={16} /> Cerrar
              </button>
            </div>
            <Usuarios />
          </aside>
        </div>,
        document.body,
      )}
    </header>
  )
}

function haceCuanto(ts) {
  if (!ts) return 'antes'
  const min = Math.max(0, Math.round((Date.now() - ts) / 60000))
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  return h < 48 ? `hace ${h} h` : `hace ${Math.round(h / 24)} días`
}

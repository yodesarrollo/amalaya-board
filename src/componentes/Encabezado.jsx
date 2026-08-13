import { RefreshCw, LogOut } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { fechaHora } from '../formato.js'

// Encabezado sobrio: sello, nombre, estado de sincronización,
// Actualizar y salir. La pastilla DEMOSTRACIÓN o "copia local"
// aparece junto al logo — discreta, nunca un banner.
export default function Encabezado() {
  const { sesion, modo, sincronizando, ultimaSync, errorSync, actualizar, salir } = usarDatos()

  return (
    <header className="no-imprimir sticky top-0 z-40 bg-noche/95 backdrop-blur border-b border-linea">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/amalaya-board/sello.svg" alt="" className="w-8 h-8 rounded-lg" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-firma text-2xl leading-none">Amalaya</span>
          {modo === 'demo' && <span className="pastilla-demo">Demostración</span>}
          {modo === 'copia' && (
            <span className="text-xs text-terciario border border-linea rounded-full px-2 py-0.5">
              copia local
            </span>
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
          <div className="text-xs text-terciario capitalize">{sesion?.rol}</div>
        </div>

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
    </header>
  )
}

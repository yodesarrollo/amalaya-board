import { useState } from 'react'
import { KeyRound, ClipboardList } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import LineaAmalaya from './LineaAmalaya.jsx'
import Peticiones from './Peticiones.jsx'
import { cargarPeticionesPublicas } from '../api.js'
import { BACKEND_LISTO } from '../config.js'

// La puerta de Amalaya — con la visión primero (petición del panel:
// "que el candado proteja los números, no la visión de ciudad").
// El código de acceso vive detrás de una liga chica; lo protagonista
// es VER el proyecto. El código se valida SIEMPRE en el servidor.
export default function Acceso() {
  const { entrar, verDemo } = usarDatos()
  const [codigo, setCodigo] = useState('')
  const [mostrarCodigo, setMostrarCodigo] = useState(false)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [peticiones, setPeticiones] = useState(null) // {rutas, paradas} públicas

  async function enviar(e) {
    e.preventDefault()
    const limpio = codigo.trim()
    if (!limpio) return
    setCargando(true)
    setError(null)
    try {
      await entrar(limpio)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function demo() {
    setCargando(true)
    setError(null)
    try {
      await verDemo()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function abrirPeticiones() {
    setCargando(true)
    setError(null)
    try {
      const r = await cargarPeticionesPublicas()
      setPeticiones({ rutas: r.rutas || [], paradas: r.paradas || [] })
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 50% 110%, rgba(201,164,92,0.16), transparent 60%),' +
          'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(184,92,56,0.10), transparent 60%)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-arena">
            Distrito de música y ciudad · Hermosillo
          </p>
          <h1 className="font-firma font-normal text-7xl mt-4 glow-ambar">Amalaya</h1>
          <p className="font-cartel uppercase tracking-[0.35em] text-oro text-xs mt-3">
            De Hermosillo para el mundo
          </p>
        </div>

        <LineaAmalaya cargando={cargando} className="mb-8" />

        {/* La visión primero: ver el proyecto sin pedir nada */}
        <button
          onClick={demo}
          className="boton-primario w-full font-cartel uppercase tracking-[0.15em] !font-normal"
          style={{ boxShadow: '0 0 32px rgba(255,184,77,0.30)' }}
          disabled={cargando}
        >
          {cargando ? 'Abriendo…' : 'Ver el proyecto'}
        </button>
        <p className="text-terciario text-xs text-center mt-2">
          Recorrido de demostración, con cifras de muestra.
        </p>

        {/* El código, detrás de su liga */}
        {!mostrarCodigo ? (
          <div className="flex items-center justify-center gap-5 mt-6">
            <button
              className="text-arena hover:text-marfil text-sm flex items-center gap-1.5 transition-colors duration-micro ease-casa"
              onClick={() => setMostrarCodigo(true)}
            >
              <KeyRound size={14} /> Tengo código de acceso
            </button>
            {BACKEND_LISTO && (
              <button
                className="text-arena hover:text-marfil text-sm flex items-center gap-1.5 transition-colors duration-micro ease-casa"
                onClick={abrirPeticiones}
                disabled={cargando}
              >
                <ClipboardList size={14} /> Peticiones a la ciudad
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={enviar} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-sm text-arena">Tu código de acceso</span>
              <input
                type="password"
                inputMode="text"
                autoComplete="off"
                className="campo mt-2 text-center tracking-[0.3em] text-lg"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={cargando}
                autoFocus
              />
            </label>
            {!BACKEND_LISTO && (
              <p className="text-terciario text-sm">
                El servidor aún no está conectado; solo está disponible la demostración.
              </p>
            )}
            <button
              type="submit"
              className="boton-secundario w-full"
              disabled={cargando || !codigo.trim() || !BACKEND_LISTO}
            >
              {cargando ? 'Entrando…' : 'Entrar con mi código'}
            </button>
          </form>
        )}

        {error && (
          <p className="text-ladrillo text-sm mt-4 text-center" role="alert">
            {error}
          </p>
        )}

        <p className="text-terciario text-xs mt-8 text-center leading-relaxed">
          Los números de Amalaya viven protegidos en Google y solo se entregan
          con un código válido. Tu código es personal: no lo compartas.
        </p>
      </div>

      {peticiones && <Peticiones publicas={peticiones} onCerrar={() => setPeticiones(null)} />}
    </div>
  )
}

import { useState } from 'react'
import { usarDatos } from '../datos.jsx'
import LineaAmalaya from './LineaAmalaya.jsx'
import { BACKEND_LISTO } from '../config.js'

// Pantalla de acceso: código personal. El código se valida SIEMPRE
// en el servidor; aquí no vive ninguna lista de códigos.
export default function Acceso() {
  const { entrar, verDemo } = usarDatos()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

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

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/amalaya-board/sello.svg"
            alt=""
            className="w-16 h-16 mx-auto mb-5 rounded-2xl"
          />
          <h1 className="text-4xl font-semibold tracking-tight">Amalaya</h1>
          <p className="text-arena mt-2">
            El board de control del polígono
          </p>
        </div>

        <LineaAmalaya cargando={cargando} className="mb-8" />

        <form onSubmit={enviar} className="space-y-4">
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

          {error && (
            <p className="text-ladrillo text-sm" role="alert">
              {error}
            </p>
          )}

          {!BACKEND_LISTO && (
            <p className="text-terciario text-sm">
              El servidor aún no está conectado (falta pegar la URL del Apps
              Script). Mientras tanto puedes ver la demostración.
            </p>
          )}

          <button
            type="submit"
            className="boton-primario w-full"
            disabled={cargando || !codigo.trim() || !BACKEND_LISTO}
          >
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={demo}
            className="boton-secundario w-full"
            disabled={cargando}
          >
            Ver demostración
          </button>
        </form>

        <p className="text-terciario text-xs mt-8 text-center leading-relaxed">
          Los números de Amalaya viven protegidos en Google y solo se entregan
          con un código válido. Tu código es personal: no lo compartas.
        </p>
      </div>
    </div>
  )
}

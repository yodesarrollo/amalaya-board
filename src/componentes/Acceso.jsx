import { useState } from 'react'
import { KeyRound, ClipboardList, Mail } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import BotonGoogle from './BotonGoogle.jsx'
import LineaAmalaya from './LineaAmalaya.jsx'
import Peticiones from './Peticiones.jsx'
import { apiCall, cargarPeticionesPublicas } from '../api.js'
import { BACKEND_LISTO } from '../config.js'

// La puerta de Amalaya (plan UX v2, fase 1). Tres formas de entrar, en
// este orden: Continuar con Google, mandarme mi liga por correo, y «tengo
// un código» chiquito abajo. «Peticiones a la ciudad» sigue pública.
// Todo se valida SIEMPRE en el servidor.
export default function Acceso() {
  const { entrar, entrarConGoogle } = usarDatos()
  const [codigo, setCodigo] = useState('')
  const [mostrarCodigo, setMostrarCodigo] = useState(false)
  const [correo, setCorreo] = useState('')
  const [correoEnviado, setCorreoEnviado] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [peticiones, setPeticiones] = useState(null) // {rutas, paradas} públicas

  async function con(fn) {
    setCargando(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const enviarCodigo = (e) => {
    e.preventDefault()
    const limpio = codigo.trim()
    if (limpio) con(() => entrar(limpio))
  }

  const pedirLiga = (e) => {
    e.preventDefault()
    if (!correo.trim()) return
    con(async () => {
      const r = await apiCall('ligaPorCorreo', { correo: correo.trim() })
      setCorreoEnviado(r.mensaje)
    })
  }

  const abrirPeticiones = () => con(async () => {
    const r = await cargarPeticionesPublicas()
    setPeticiones({ rutas: r.rutas || [], paradas: r.paradas || [] })
  })

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
            Tierra Sonora · Distrito Cultural y Musical
          </p>
          <h1 className="font-firma font-normal text-7xl mt-4 glow-ambar">Amalaya</h1>
          <p className="font-cartel uppercase tracking-[0.35em] text-oro text-xs mt-3">
            El corazón acústico de Hermosillo
          </p>
        </div>

        <LineaAmalaya cargando={cargando} className="mb-8" />

        {!BACKEND_LISTO ? (
          <p className="text-terciario text-sm text-center">El servidor aún no está conectado.</p>
        ) : (
          <div className="space-y-5">
            {/* 1 · Google */}
            <BotonGoogle deshabilitado={cargando} onToken={(t) => con(() => entrarConGoogle(t))} />

            {/* 2 · La liga por correo, estilo YOD OS */}
            {correoEnviado ? (
              <p className="text-salvia text-sm text-center leading-relaxed">{correoEnviado}</p>
            ) : (
              <form className="space-y-2" onSubmit={pedirLiga}>
                <label className="block text-xs text-arena text-center" htmlFor="correo-liga">
                  o mándame mi liga por correo
                </label>
                <div className="flex gap-2">
                  <input
                    id="correo-liga"
                    type="email"
                    className="campo !py-2 flex-1 text-sm"
                    placeholder="tu@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    disabled={cargando}
                  />
                  <button
                    type="submit"
                    className="boton-secundario !px-3 !py-2 text-sm"
                    disabled={cargando || !correo.trim()}
                  >
                    <span className="flex items-center gap-1.5"><Mail size={14} /> Mandar</span>
                  </button>
                </div>
              </form>
            )}

            {/* 3 · El código, chiquito abajo */}
            {!mostrarCodigo ? (
              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  className="text-terciario hover:text-arena text-xs flex items-center gap-1.5 transition-colors duration-micro ease-casa"
                  onClick={() => setMostrarCodigo(true)}
                >
                  <KeyRound size={12} /> Tengo un código
                </button>
                <button
                  className="text-terciario hover:text-arena text-xs flex items-center gap-1.5 transition-colors duration-micro ease-casa"
                  onClick={abrirPeticiones}
                  disabled={cargando}
                >
                  <ClipboardList size={12} /> Peticiones a la ciudad
                </button>
              </div>
            ) : (
              <form onSubmit={enviarCodigo} className="flex gap-2">
                <input
                  type="password"
                  inputMode="text"
                  autoComplete="off"
                  aria-label="Tu código de acceso"
                  placeholder="tu código"
                  className="campo !py-2 flex-1 text-center tracking-[0.3em]"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  disabled={cargando}
                  autoFocus
                />
                <button type="submit" className="boton-secundario !px-3 !py-2 text-sm" disabled={cargando || !codigo.trim()}>
                  {cargando ? 'Entrando…' : 'Entrar'}
                </button>
              </form>
            )}
          </div>
        )}

        {error && (
          <p className="text-ladrillo text-sm mt-4 text-center" role="alert">
            {error}
          </p>
        )}

        <p className="text-terciario text-xs mt-8 text-center leading-relaxed">
          Los números de Amalaya viven protegidos en Google y solo se entregan
          a quien tiene acceso. Tu liga y tu código son personales: no los compartas.
        </p>
      </div>

      {peticiones && <Peticiones publicas={peticiones} onCerrar={() => setPeticiones(null)} />}
    </div>
  )
}

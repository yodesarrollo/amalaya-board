import { useEffect, useRef, useState } from 'react'
import { apiCall } from '../api.js'

// «Continuar con Google» (Google Identity Services, propio de Amalaya).
// El client_id no vive en el código: lo entrega `ping` desde Config
// (clave google_client_id). Google devuelve un id_token y el SERVIDOR lo
// valida; aquí solo se pasa de mano.
const GSI = 'https://accounts.google.com/gsi/client'

function cargarGsi() {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolver, rechazar) => {
    const s = document.createElement('script')
    s.src = GSI
    s.async = true
    s.onload = () => resolver()
    s.onerror = () => rechazar(new Error('No se pudo cargar Google.'))
    document.head.appendChild(s)
  })
}

export default function BotonGoogle({ onToken, deshabilitado }) {
  const caja = useRef(null)
  const alToken = useRef(onToken)
  useEffect(() => { alToken.current = onToken }, [onToken])
  const [estado, setEstado] = useState('cargando') // cargando | listo | sin-config | error

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const r = await apiCall('ping')
        if (!r.google_client_id) { if (vivo) setEstado('sin-config'); return }
        await cargarGsi()
        if (!vivo || !caja.current) return
        window.google.accounts.id.initialize({
          client_id: r.google_client_id,
          callback: (resp) => alToken.current(resp.credential),
          ux_mode: 'popup',
        })
        window.google.accounts.id.renderButton(caja.current, {
          theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with',
          width: Math.min(caja.current.offsetWidth || 320, 400), locale: 'es',
        })
        setEstado('listo')
      } catch {
        if (vivo) setEstado('error')
      }
    })()
    return () => { vivo = false }
  }, [])

  return (
    <div className={deshabilitado ? 'opacity-50 pointer-events-none' : ''}>
      <div ref={caja} className="w-full flex justify-center min-h-[44px]" hidden={estado !== 'listo'} />
      {estado !== 'listo' && (
        <button type="button" className="boton-primario w-full" disabled>
          {estado === 'cargando' ? 'Preparando Google…' : 'Continuar con Google'}
        </button>
      )}
      {estado === 'sin-config' && (
        <p className="text-terciario text-xs text-center mt-2">La entrada con Google se activa pronto. Mientras, usa tu liga o tu código.</p>
      )}
      {estado === 'error' && (
        <p className="text-terciario text-xs text-center mt-2">Google no respondió. Usa tu liga o tu código.</p>
      )}
    </div>
  )
}

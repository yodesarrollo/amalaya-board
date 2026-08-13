import { useState } from 'react'
import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import LineaAmalaya from './componentes/LineaAmalaya.jsx'
import Mapa from './componentes/Mapa.jsx'
import Financiero from './componentes/Financiero.jsx'
import Reporte from './componentes/Reporte.jsx'

// Las secciones del board según el rol.
// El inversionista SOLO ve el Reporte (además, el servidor solo le
// entrega las pestañas que el Reporte necesita — la vista nada más
// refleja esa realidad).
function Principal() {
  const { sesion, datos, modo } = usarDatos()
  const esInversionista = sesion?.rol === 'inversionista'
  const [seccion, setSeccion] = useState('mapa')
  const hayFinanzas = Array.isArray(datos?.Finanzas_Lineas)

  if (esInversionista) {
    return (
      <main>
        <Reporte />
      </main>
    )
  }

  return (
    <main>
      <nav className="no-imprimir max-w-6xl mx-auto px-4 pt-3 flex gap-1" aria-label="Secciones">
        {[['mapa', 'Mapa'], ...(hayFinanzas ? [['finanzas', 'Finanzas']] : []), ['reporte', 'Reporte']].map(([s, titulo]) => (
          <button
            key={s}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-micro ease-casa
              ${seccion === s ? 'bg-superficie text-marfil border border-linea' : 'text-terciario hover:text-arena'}`}
            onClick={() => setSeccion(s)}
          >
            {titulo}
          </button>
        ))}
      </nav>
      {seccion === 'mapa' && <Mapa />}
      {seccion === 'finanzas' && <Financiero />}
      {seccion === 'reporte' && <Reporte />}
      {modo === 'demo' && seccion !== 'reporte' && (
        <p className="max-w-6xl mx-auto px-4 pb-8 text-terciario text-sm">
          Estás viendo la demostración: todos los nombres y cifras son
          inventados. Los datos reales solo se entregan con un código de acceso.
        </p>
      )}
    </main>
  )
}

export default function App() {
  const { sesion, arrancando } = usarDatos()

  if (arrancando) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-10">
        <div className="w-full max-w-xs">
          <LineaAmalaya cargando />
        </div>
      </div>
    )
  }

  if (!sesion) return <Acceso />

  return (
    <>
      <Encabezado />
      <Principal />
    </>
  )
}

import { useState } from 'react'
import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import LineaAmalaya from './componentes/LineaAmalaya.jsx'
import Mapa from './componentes/Mapa.jsx'
import Financiero from './componentes/Financiero.jsx'

// Las secciones del board. El mapa es la principal; Finanzas solo
// aparece si el servidor entregó las líneas al rol de la sesión.
function Principal() {
  const { datos, modo } = usarDatos()
  const [seccion, setSeccion] = useState('mapa')
  const hayFinanzas = Array.isArray(datos?.Finanzas_Lineas)

  return (
    <main>
      {hayFinanzas && (
        <nav className="max-w-6xl mx-auto px-4 pt-3 flex gap-1" aria-label="Secciones">
          {[['mapa', 'Mapa'], ['finanzas', 'Finanzas']].map(([s, titulo]) => (
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
      )}
      {seccion === 'mapa' ? <Mapa /> : <Financiero />}
      {modo === 'demo' && (
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

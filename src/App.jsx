import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import LineaAmalaya from './componentes/LineaAmalaya.jsx'
import Mapa from './componentes/Mapa.jsx'

// La pantalla principal es el mapa del polígono.
function Principal() {
  const { modo } = usarDatos()
  return (
    <main>
      <Mapa />
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

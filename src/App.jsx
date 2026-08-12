import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import LineaAmalaya from './componentes/LineaAmalaya.jsx'

// Fase 0: pantalla de acceso + bienvenida. El mapa llega en la Fase 1.
function Bienvenida() {
  const { sesion, datos, modo } = usarDatos()
  const espacios = datos?.Espacios || []

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-semibold tracking-tight">
        Bienvenido a Amalaya{sesion?.nombre && sesion.rol !== 'demo' ? `, ${sesion.nombre.split(' ')[0]}` : ''}
      </h2>
      <p className="text-arena mt-2 max-w-xl leading-relaxed">
        Este board es la cara de control del proyecto: todo lo que ves sale del
        Sheet maestro, y todo lo que muevas aquí queda escrito allá.
      </p>

      <LineaAmalaya className="my-8" />

      {espacios.length === 0 ? (
        <div className="tarjeta p-8 text-center">
          <p className="text-marfil font-medium">Aún no hay espacios.</p>
          <p className="text-terciario text-sm mt-1">
            El mapa interactivo llega en la siguiente fase; desde ahí se crean
            los espacios del polígono tocando <span className="text-oro">+</span>.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {espacios.map((e) => (
            <div key={e.id} className="tarjeta p-5">
              <div className="text-xs uppercase tracking-wide text-terciario">{e.tipo}</div>
              <div className="font-titulo text-xl mt-1">{e.nombre}</div>
              {e.m2 && <div className="cifra text-arena text-sm mt-2">{e.m2} m²</div>}
            </div>
          ))}
        </div>
      )}

      {modo === 'demo' && (
        <p className="text-terciario text-sm mt-8">
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
      <Bienvenida />
    </>
  )
}

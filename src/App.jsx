import { useState } from 'react'
import { Map as MapIcon, BarChart3, FileText, Users as UsersIcon, LifeBuoy } from 'lucide-react'
import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import LineaAmalaya from './componentes/LineaAmalaya.jsx'
import Mapa from './componentes/Mapa.jsx'
import Financiero from './componentes/Financiero.jsx'
import Reporte from './componentes/Reporte.jsx'
import Usuarios from './componentes/Usuarios.jsx'
import Ayuda from './componentes/Ayuda.jsx'

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

  const secciones = [
    ['mapa', 'Mapa', MapIcon],
    ...(hayFinanzas ? [['finanzas', 'Finanzas', BarChart3]] : []),
    ['reporte', 'Reporte', FileText],
    ...(sesion?.rol === 'admin' ? [['equipo', 'Equipo', UsersIcon]] : []),
    ['ayuda', 'Ayuda', LifeBuoy],
  ]

  return (
    <main className="pb-16 sm:pb-0">
      {/* Pantalla ancha: pestañas arriba, como siempre */}
      <nav className="no-imprimir hidden sm:flex max-w-6xl mx-auto px-4 pt-3 gap-1" aria-label="Secciones">
        {secciones.map(([s, titulo]) => (
          <button
            key={s}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors duration-micro ease-casa
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
      {seccion === 'equipo' && <Usuarios />}
      {seccion === 'ayuda' && <Ayuda />}
      {modo === 'demo' && seccion !== 'reporte' && (
        <p className="max-w-6xl mx-auto px-4 pb-8 text-terciario text-sm">
          Estás viendo la demostración: todos los nombres y cifras son
          inventados. Los datos reales solo se entregan con un código de acceso.
        </p>
      )}

      {/* Teléfono: barra de navegación abajo, al alcance del pulgar */}
      <nav
        className="no-imprimir sm:hidden fixed inset-x-0 bottom-0 z-40 bg-noche/95 backdrop-blur border-t border-linea flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Secciones"
      >
        {secciones.map(([s, titulo, Icono]) => (
          <button
            key={s}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-micro ease-casa
              ${seccion === s ? 'text-ambar' : 'text-terciario'}`}
            onClick={() => setSeccion(s)}
            aria-current={seccion === s ? 'page' : undefined}
          >
            <Icono size={20} />
            <span className="text-[10px] font-medium">{titulo}</span>
          </button>
        ))}
      </nav>
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

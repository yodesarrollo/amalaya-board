import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Map as MapIcon, BarChart3, FileText, LifeBuoy, ListChecks } from 'lucide-react'
import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import LineaAmalaya from './componentes/LineaAmalaya.jsx'
import Mapa from './componentes/Mapa.jsx'
import Financiero from './componentes/Financiero.jsx'
import Reporte from './componentes/Reporte.jsx'
import Ayuda from './componentes/Ayuda.jsx'
import PlanAccion from './componentes/PlanAccion.jsx'
import AyudaPantalla from './componentes/AyudaPantalla.jsx'
import { puedeEditarRol } from './roles.js'
import { BASE, APPS_SCRIPT_URL } from './config.js'
import { apiCall } from './api.js'

import { BIBLIOTECA_3D } from './modelos3d.js'
const Biblioteca3D = lazy(() => import('./componentes/Biblioteca3D.jsx'))

// La Chinche de Amalaya (pila propia, public/chinche.js): se carga solo con
// sesión y para los roles de trabajo; quien clava sale de la sesión.
function usarChinche(sesion, modo, seccion) {
  const seccionRef = useRef(seccion)
  const sesionRef = useRef(sesion)
  useEffect(() => { sesionRef.current = sesion }, [sesion])
  useEffect(() => { seccionRef.current = seccion }, [seccion])
  const activa = !!sesion && modo !== 'demo' && ['admin', 'master', 'editor', 'visor'].includes(sesion?.rol)
  useEffect(() => {
    if (!activa || window.YODChinche || document.getElementById('amalaya-chinche')) return
    const s = document.createElement('script')
    s.id = 'amalaya-chinche'
    s.src = `${BASE}chinche.js?v=f9`
    // Las pantallas sueltas (modelo 3D, recorrido) leen de aquí a qué servidor mandar.
    try { localStorage.setItem('amalaya_exec', APPS_SCRIPT_URL) } catch { /* modo privado */ }
    s.onload = () => window.YODChinche?.init({
      pantalla: 'amalaya', repo: 'amalaya-board',
      // Envío automático: cada chinche va sola al servidor (sin «Mandar a Claude»).
      enviar: (ch) => apiCall('chinche', { codigo: sesionRef.current?.codigo, chinche: ch }),
      quien: () => sesion?.nombre || '',
      seccion: () => seccionRef.current,
      vista: () => seccionRef.current,
    })
    document.body.appendChild(s)
  }, [activa]) // eslint-disable-line react-hooks/exhaustive-deps
  // Sin sesión (al salir) la pastilla 📌 se esconde.
  useEffect(() => {
    const p = document.querySelector('button[aria-label="Pendientes de cambio"]')
    if (p) p.style.display = activa ? '' : 'none'
  }, [activa])
}

// Las secciones del board según el rol.
// El inversionista SOLO ve el Reporte (además, el servidor solo le
// entrega las pestañas que el Reporte necesita — la vista nada más
// refleja esa realidad).
function Principal() {
  const { sesion, datos, modo } = usarDatos()
  const esInversionista = sesion?.rol === 'inversionista'
  const [seccion, setSeccion] = useState('mapa')
  usarChinche(sesion, modo, seccion)
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
    ...(BIBLIOTECA_3D ? [['modelos', 'Modelos 3D', MapIcon]] : []),
    ...(hayFinanzas ? [['finanzas', 'Finanzas', BarChart3]] : []),
    ['reporte', 'Reporte', FileText],
    ...(puedeEditarRol(sesion?.rol) && Array.isArray(datos?.Metas) ? [['plan', 'Plan', ListChecks]] : []),
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
        <div className="flex-1" />
        <AyudaPantalla seccion={seccion} />
      </nav>
      {/* En teléfono el «?» flota arriba a la derecha de la sección */}
      <div className="no-imprimir sm:hidden flex justify-end px-3 pt-2 -mb-2"><AyudaPantalla seccion={seccion} /></div>

      {seccion === 'mapa' && <Mapa />}
      {seccion === 'modelos' && BIBLIOTECA_3D && <Suspense fallback={<p className="p-4">Cargando biblioteca…</p>}><Biblioteca3D /></Suspense>}
      {seccion === 'finanzas' && <Financiero />}
      {seccion === 'reporte' && <Reporte />}
      {seccion === 'plan' && <PlanAccion />}
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

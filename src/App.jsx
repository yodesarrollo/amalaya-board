import { useEffect, useRef, lazy, Suspense } from 'react'
import { usarDatos } from './datos.jsx'
import Acceso from './componentes/Acceso.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import InicioPendiente from './componentes/InicioPendiente.jsx'
const Mapa = lazy(() => import('./componentes/Mapa.jsx'))
const Financiero = lazy(() => import('./componentes/Financiero.jsx'))
const Reporte = lazy(() => import('./componentes/Reporte.jsx'))
const Ayuda = lazy(() => import('./componentes/Ayuda.jsx'))
const PlanAccion = lazy(() => import('./componentes/PlanAccion.jsx'))
import AyudaPantalla from './componentes/AyudaPantalla.jsx'
import { BASE, APPS_SCRIPT_URL } from './config.js'
import { apiCall } from './api.js'
import { contextoChinche, repintarParaChinche } from './chinche-contexto.js'

import PortalShell, { PortalFrame } from './componentes/PortalShell.jsx'
import SistemaAmalaya from './componentes/SistemaAmalaya.jsx'
import { availableSections, resolveSection } from './portal-model.js'
import { usePortalNavigation } from './usePortalNavigation.js'
import './portal.css'
import './brand.css'

import { BIBLIOTECA_3D } from './modelos3d.js'
const Recintos = lazy(() => import('./componentes/Recintos.jsx'))
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
    s.src = `${BASE}chinche.js?v=secuencia-1`
    // Las pantallas sueltas (modelo 3D, recorrido) leen de aquí a qué servidor mandar.
    try { localStorage.setItem('amalaya_exec', APPS_SCRIPT_URL) } catch { /* modo privado */ }
    s.onload = () => window.YODChinche?.init({
      pantalla: 'amalaya', repo: 'amalaya-board',
      // Envío automático: cada chinche va sola al servidor (sin «Mandar a Claude»).
      identidad: async () => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(sesionRef.current?.codigo || '')))).map(x=>x.toString(16).padStart(2,'0')).join(''),
      enviar: (ch) => apiCall('chinche', { codigo: sesionRef.current?.codigo, chinche: ch }),
      quien: () => sesion?.nombre || '',
      // Mapa y visores dicen qué había bajo el toque (el DOM solo ve un lienzo).
      contexto: (toque) => contextoChinche(toque),
      repintar: (marco) => repintarParaChinche(marco),
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
  const [requested, navigate] = usePortalNavigation()
  const esInversionista = sesion?.rol === 'inversionista'
  const secciones = availableSections({role:sesion?.rol,data:datos,models:BIBLIOTECA_3D})
  const seccion = resolveSection(requested,secciones)
  usarChinche(sesion, modo, seccion)

  // Conservar el contrato: el inversionista sólo recibe la vista Reporte.
  if (esInversionista) return <><Encabezado /><main><Suspense fallback={<p className="p-6">Abriendo reporte…</p>}><Reporte /></Suspense></main></>

  return <>
    <Encabezado onInicio={()=>navigate('mapa')} />
    <PortalShell sections={secciones} section={seccion} onNavigate={navigate} help={<AyudaPantalla seccion={seccion} />}>
      <main id="portal-contenido" tabIndex="-1" className="portal-content">
        {seccion === 'mapa' && <Suspense fallback={<p className="p-6">Abriendo área…</p>}><Mapa /></Suspense>}
        {seccion === 'recintos' && <Suspense fallback={<p className="p-4">Cargando recintos…</p>}><Recintos /></Suspense>}
        {seccion === 'modelos' && BIBLIOTECA_3D && <Suspense fallback={<p className="p-4">Cargando biblioteca…</p>}><Biblioteca3D /></Suspense>}
        {seccion === 'finanzas' && <Suspense fallback={<p className="p-6">Abriendo área…</p>}><Financiero /></Suspense>}
        {seccion === 'reporte' && <Suspense fallback={<p className="p-6">Abriendo área…</p>}><Reporte /></Suspense>}
        {seccion === 'plan' && <Suspense fallback={<p className="p-6">Abriendo área…</p>}><PlanAccion /></Suspense>}
        {seccion === 'ayuda' && <Suspense fallback={<p className="p-6">Abriendo área…</p>}><Ayuda /></Suspense>}
        {['observatorio','seguimiento','capas'].includes(seccion) && <PortalFrame type={seccion} />}
        {seccion === 'sistema' && <SistemaAmalaya sections={secciones} onNavigate={navigate} />}
        {modo === 'demo' && seccion !== 'reporte' && !['observatorio','seguimiento','sistema','capas'].includes(seccion) && <p className="portal-demo-note">Demostración: los datos de negocio son ficticios y no se guardan cambios. El Observatorio y el seguimiento conservan sus fuentes públicas.</p>}
      </main>
    </PortalShell>
  </>
}

export default function App() {
  const { sesion, arrancando } = usarDatos()

  if (arrancando) return <InicioPendiente />

  if (!sesion) return <Acceso />

  return <Principal />
}

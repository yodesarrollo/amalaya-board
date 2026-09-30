import React from 'react'
import { createRoot } from 'react-dom/client'
import RecorridoPortal from './componentes/RecorridoPortal'
import './index.css'
createRoot(document.getElementById('root')).render(<><nav className="public-nav" aria-label="Navegación principal"><a href="./explorar.html" aria-label="Amalaya, inicio">Amalaya</a><a href="./">Acceso al tablero ↗</a></nav><main><RecorridoPortal /></main><footer className="public-footer"><span>AMALAYA · El corazón acústico de Hermosillo</span><span>Exploración pública · Proyecto en desarrollo · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></span></footer></>)

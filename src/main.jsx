import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { DatosProvider } from './datos.jsx'
import './index.css'

// Cinturón de seguridad: si algo truena, un mensaje en español
// en vez de una pantalla en blanco.
class Contencion extends React.Component {
  constructor(p) {
    super(p)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[Amalaya]', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh flex items-center justify-center px-6">
          <div className="tarjeta p-8 max-w-md text-center">
            <h2 className="font-titulo text-xl">Algo salió mal</h2>
            <p className="text-arena text-sm mt-2">
              Recarga la página. Si sigue pasando, avísale a Alejandro con una
              captura de esta pantalla.
            </p>
            <p className="text-terciario text-xs mt-4 break-all">
              {String(this.state.error?.message || this.state.error)}
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Contencion>
      <DatosProvider>
        <App />
      </DatosProvider>
    </Contencion>
  </React.StrictMode>
)

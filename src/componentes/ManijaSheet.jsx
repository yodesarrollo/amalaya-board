import { useRef } from 'react'

// La manija del sheet en teléfono: la pastilla de arriba que también
// cierra deslizando hacia abajo (el gesto que cualquier app decente tiene).
export default function ManijaSheet({ onCerrar }) {
  const inicio = useRef(null)
  return (
    <div
      className="sm:hidden sticky top-0 z-10 flex justify-center py-2 bg-elevada cursor-grab"
      style={{ touchAction: 'none' }}
      onPointerDown={(ev) => {
        ev.currentTarget.setPointerCapture(ev.pointerId)
        inicio.current = ev.clientY
      }}
      onPointerMove={(ev) => {
        if (inicio.current !== null && ev.clientY - inicio.current > 70) {
          inicio.current = null
          onCerrar()
        }
      }}
      onPointerUp={() => { inicio.current = null }}
      onPointerCancel={() => { inicio.current = null }}
      aria-hidden="true"
    >
      <span className="w-10 h-1.5 rounded-full bg-linea" />
    </div>
  )
}


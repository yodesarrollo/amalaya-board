import { useState } from 'react'
import { RefreshCw, ImageOff } from 'lucide-react'

// Imagen guardada en Drive, identificada por su fileId (el Sheet nunca
// guarda URLs de Drive: cambian de forma; el fileId es estable).
//
// Cadena de carga verificada:
//   1. lh3.googleusercontent.com/d/{id}={sz} — sirve bytes reales de
//      imagen y escala por parámetro (ahorra datos en teléfono).
//   2. drive.google.com/thumbnail?id={id}&sz={sz} — respaldo estable.
//   3. Placeholder con botón de reintento.
// Prohibido uc?export=view: roto desde 2024 (403 intermitentes).
export default function ImagenDrive({ fileId, sz = 'w800', alt = '', className = '' }) {
  const [paso, setPaso] = useState(0) // 0: lh3 · 1: thumbnail · 2: placeholder
  const [intento, setIntento] = useState(0)

  if (!fileId) return null

  if (paso >= 2) {
    return (
      <div className={`bg-superficie border border-linea rounded-xl flex flex-col items-center justify-center gap-2 p-4 ${className}`}>
        <ImageOff size={20} className="text-terciario" />
        <p className="text-terciario text-xs text-center">La foto no cargó.</p>
        <button
          className="text-oro text-xs flex items-center gap-1 hover:opacity-80 transition-opacity duration-micro ease-casa"
          onClick={() => { setPaso(0); setIntento(intento + 1) }}
        >
          <RefreshCw size={12} /> Reintentar
        </button>
      </div>
    )
  }

  const src = paso === 0
    ? `https://lh3.googleusercontent.com/d/${fileId}=${sz}?r=${intento}`
    : `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}&r=${intento}`

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setPaso(paso + 1)}
      draggable={false}
    />
  )
}

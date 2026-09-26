import { useState } from 'react'
import { createPortal } from 'react-dom'
import { usarDialogo } from '../usarDialogo.js'
import { HelpCircle, X } from 'lucide-react'
import { BASE } from '../config.js'

// ============================================================
// «?» por sección: explica SOLO la pantalla en que estás, con su GIF
// cuando lo hay (grabados con el simulador: npm run gifs).
// El Bato es la mascota: simple y opcional (se apaga con un toque y
// no vuelve; si estorba, se quita borrando <Bato />).
// ============================================================

export const AYUDA_PANTALLA = {
  mapa: {
    titulo: 'El mapa',
    lineas: [
      'Entra en 2D y se levanta en 3D; toca en cualquier parte para saltar la entrada.',
      'Las 5 rayitas de cada espacio son su avance: idea, negociación, proyecto, obra, operando.',
      '«Espacios» abre la lista con buscador; toca uno para volar hacia él y abrir su ficha.',
      '«Mover espacios» (editor en adelante): arrastra un rótulo a su lugar y se guarda al soltar.',
      '«Rutas» → elige una → «Trazar (toca el mapa)» y ve tocando el mapa punto por punto.',
    ],
    gifs: [['mover-espacio.gif', 'Mover un espacio'], ['trazar-ruta.gif', 'Trazar una ruta']],
  },
  finanzas: {
    titulo: 'Finanzas',
    lineas: [
      'Las tarjetas nacen cerradas: toca un espacio para ver sus líneas.',
      'El monto acepta un número o una fórmula con =; al escribir te sugiere los factores del espacio.',
      'Bajo cada línea va su supuesto; si falta, se marca con una línea punteada.',
      'Con 2 escenarios o más, «Comparar dos escenarios» los pone lado a lado.',
      '«¿Y si…?» (en el panel dorado) mueve ocupación y precios sin guardar nada.',
    ],
    gifs: [['escribir-formula.gif', 'Escribir una fórmula']],
  },
  reporte: {
    titulo: 'El Reporte',
    lineas: [
      'Es el plan de negocios en vivo; el índice de arriba te lleva a cada parte.',
      '«Qué parte de cada acción es cada espacio» reparte el valor por acción entre los espacios.',
      '«Vista previa» enseña cómo sale en papel antes de exportar a PDF.',
      'Admin y máster congelan versiones; el inversionista ve la última congelada.',
    ],
  },
  plan: {
    titulo: 'Plan de acción',
    lineas: [
      'Metas → objetivos → acciones. Cada acción lleva responsable, fecha y semáforo.',
      'Rojo: vencida · ámbar: vence esta semana · verde: a tiempo.',
      'Toda acción cierra un objetivo: el contador de arriba tiene que quedar en 0.',
      'Una acción se puede ligar a un espacio o a una petición a la ciudad.',
    ],
  },
  ayuda: {
    titulo: 'La ayuda',
    lineas: ['Aquí está la guía completa. En cada sección, el «?» explica solo esa pantalla.'],
  },
}

const LLAVE_BATO = 'amalaya_bato_off'
const batoApagado = () => { try { return localStorage.getItem(LLAVE_BATO) === 'si' } catch { return false } }

export function Bato({ tamano = 44 }) {
  // Un bato con sombrero y guitarra, en trazo simple de la paleta Amalaya.
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="15" rx="17" ry="4" fill="#C9A45C" />
      <path d="M15 15c1-7 17-7 18 0z" fill="#C9A45C" />
      <circle cx="24" cy="21" r="7" fill="#E8C9A0" />
      <circle cx="21.5" cy="20.5" r="1" fill="#141010" /><circle cx="26.5" cy="20.5" r="1" fill="#141010" />
      <path d="M21 24c2 1.5 4 1.5 6 0" stroke="#141010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M16 44c0-8 3-13 8-13s8 5 8 13z" fill="#B85C38" />
      <ellipse cx="31" cy="37" rx="5" ry="6" fill="#8F6E2E" /><rect x="33" y="27" width="2" height="9" rx="1" fill="#8F6E2E" transform="rotate(25 34 31)" />
      <circle cx="31" cy="37" r="1.6" fill="#141010" />
    </svg>
  )
}

export default function AyudaPantalla({ seccion }) {
  const [abierta, setAbierta] = useState(false)
  const refAyuda = usarDialogo(abierta, () => setAbierta(false))
  const [conBato, setConBato] = useState(() => !batoApagado())
  const a = AYUDA_PANTALLA[seccion]
  if (!a) return null
  return (
    <>
      <button
        className="text-terciario hover:text-arena p-1.5 rounded-full"
        onClick={() => setAbierta(true)}
        aria-label={`Ayuda de ${a.titulo}`}
        title={`¿Cómo funciona ${a.titulo.toLowerCase()}?`}
      >
        <HelpCircle size={16} />
      </button>
      {abierta && createPortal(
        <div className="fixed inset-0 z-[70] bg-noche/70 flex items-end sm:items-center justify-center p-4" onClick={() => setAbierta(false)}>
          <div className="tarjeta bg-elevada w-full max-w-md max-h-[85dvh] overflow-y-auto p-5" ref={refAyuda} role="dialog" aria-modal="true" aria-label={`Ayuda: ${a.titulo}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              {conBato && <Bato />}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-terciario">Ayuda de esta pantalla</div>
                <h3 className="font-titulo text-xl">{a.titulo}</h3>
              </div>
              <button className="text-arena hover:text-marfil p-1" onClick={() => setAbierta(false)} aria-label="Cerrar ayuda"><X size={18} /></button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {a.lineas.map((l, i) => (
                <li key={i} className="text-arena text-sm leading-relaxed pl-4 relative">
                  <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-oro" />{l}
                </li>
              ))}
            </ul>
            {(a.gifs || []).map(([archivo, titulo]) => (
              <figure key={archivo} className="mt-4">
                <img src={`${BASE}ayuda/${archivo}`} alt={titulo} loading="lazy" className="w-full rounded-lg border border-linea" />
                <figcaption className="text-terciario text-xs mt-1">{titulo}</figcaption>
              </figure>
            ))}
            {conBato && (
              <button className="text-terciario text-[11px] underline mt-4" onClick={() => { try { localStorage.setItem(LLAVE_BATO, 'si') } catch { /* nada */ } setConBato(false) }}>
                Quitar al Bato
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

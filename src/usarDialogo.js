import { useEffect, useRef } from 'react'

// UX-06 · foco accesible para paneles modales: al abrir, el foco entra al
// panel; Tab no se sale mientras está abierto; Esc cierra; al cerrar, el foco
// regresa al botón que lo abrió.
const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// «respaldo»: a dónde va el foco si el botón de origen ya no existe al cerrar.
export function usarDialogo(abierto, onCerrar, respaldo) {
  const ref = useRef(null)
  const cerrarRef = useRef(onCerrar)
  useEffect(() => { cerrarRef.current = onCerrar }, [onCerrar])
  useEffect(() => {
    if (!abierto) return
    const origen = document.activeElement
    const panel = ref.current
    const enfocables = () => [...(panel?.querySelectorAll(ENFOCABLES) || [])].filter((el) => el.offsetParent !== null || el === document.activeElement)
    const t = setTimeout(() => {
      if (panel && !panel.contains(document.activeElement)) (panel.querySelector('[data-foco-inicial]') || enfocables()[0] || panel).focus?.()
    }, 30)
    const teclas = (ev) => {
      if (ev.key === 'Escape') { ev.stopPropagation(); cerrarRef.current?.(); return }
      if (ev.key !== 'Tab' || !panel) return
      const lista = enfocables()
      if (!lista.length) return
      const primero = lista[0], ultimo = lista[lista.length - 1]
      if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus() }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus() }
      else if (!panel.contains(document.activeElement)) { ev.preventDefault(); primero.focus() }
    }
    document.addEventListener('keydown', teclas, true)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', teclas, true)
      if (origen && document.contains(origen) && origen !== document.body) origen.focus?.()
      else if (respaldo) document.querySelector(respaldo)?.focus?.()
    }
  }, [abierto])
  return ref
}

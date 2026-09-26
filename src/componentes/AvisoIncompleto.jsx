// UX-08: junto a cada total, qué le falta para ser una cifra completa.
// Nunca convierte un insumo faltante o una fórmula rota en un cero visual.
export default function AvisoIncompleto({ g, centrado = false, compacto = false }) {
  if (!g || g.completo) return null
  const n = g.errores.length
  const faltan = g.faltantes.map((f) => f.texto)
  return (
    <div className={`aviso-incompleto ${centrado ? 'text-center mx-auto' : ''}`} role="note" aria-label="Datos incompletos">
      <span className="etq">Datos incompletos</span>
      {!compacto && faltan.length > 0 && <span> · falta: {faltan.slice(0, 6).join(', ')}{faltan.length > 6 ? ` y ${faltan.length - 6} más` : ''}</span>}
      {n > 0 && (
        <span> · <a href="#errores-formulas" className="underline">{n === 1 ? '1 fórmula con error' : `${n} fórmulas con error`}</a> (no se suman como cero)</span>
      )}
    </div>
  )
}

// La lista de fórmulas rotas a la que lleva el enlace del aviso.
export function ListaErrores({ g }) {
  if (!g?.errores?.length) return null
  return (
    <div id="errores-formulas" className="tarjeta p-3 mt-3 border-ladrillo/50">
      <p className="text-sm text-marfil">Fórmulas con error</p>
      <ul className="text-xs text-arena mt-1 space-y-1">
        {g.errores.map((e, i) => (
          <li key={i}>{e.espacio?.nombre} · {e.linea?.concepto || e.linea?.id}: <span className="text-ladrillo">{e.error}</span></li>
        ))}
      </ul>
    </div>
  )
}

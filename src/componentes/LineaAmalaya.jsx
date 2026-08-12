// La línea Amalaya: el único grafismo musical de la interfaz.
// Una línea dorada de 1px que, cuando algo carga, ondula como
// forma de onda y se aplana al terminar. Dos paths con cross-fade
// (compatible con Safari/iOS; nunca se anima `d` por CSS).
export default function LineaAmalaya({ cargando = false, className = '' }) {
  return (
    <svg
      className={`linea-amalaya ${cargando ? 'cargando' : ''} ${className}`}
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="recta" d="M0 4 L100 4" />
      <path
        className="onda"
        d="M0 4 Q4 1 8 4 T16 4 Q20 7 24 4 T32 4 Q36 2 40 4 T48 4 Q52 6 56 4 T64 4 Q68 1 72 4 T80 4 Q84 6 88 4 T96 4 L100 4"
      />
    </svg>
  )
}

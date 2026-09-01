// ============================================================
// Glifos arquitectónicos de los tipos de espacio (iconografía
// propia del board — ver la lista negra del proyecto: nada de
// cactus/sombrero/mariachi ni notas musicales) + su letrero corto.
// Viven aparte para que el mapa y la ficha usen los mismos.
// ============================================================

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

function GlifoBase({ size = 22, children }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} {...trazo}>{children}</svg>
}
export const GLIFO_TIPO = {
  // Foro / venue: el proscenio (arco de escenario sobre el piso).
  venue: (p) => (
    <GlifoBase {...p}>
      <path d="M2.5 21h19" />
      <path d="M4.5 21V10a7.5 7.5 0 0 1 15 0v11" />
      <path d="M8 21v-7.5a4 4 0 0 1 8 0V21" />
    </GlifoBase>
  ),
  // Área comercial: local con toldo de tres ondas.
  comercial: (p) => (
    <GlifoBase {...p}>
      <path d="M4.5 9.5 6 4.5h12l1.5 5" />
      <path d="M4.5 9.5a2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 2.4 0" />
      <path d="M5.5 12.5V21h13v-8.5" />
      <path d="M10 21v-5h4v5" />
    </GlifoBase>
  ),
  // Uso mixto: dos torres traslapadas de distinta altura.
  mixto: (p) => (
    <GlifoBase {...p}>
      <path d="M2.5 21h19" />
      <path d="M4.5 21V10h6.5v11" />
      <path d="M11 21V3.5h8V21" />
      <path d="M14 7.5h2M14 11h2M14 14.5h2M7 13.5h1.5M7 17h1.5" />
    </GlifoBase>
  ),
  // Museo: pórtico con frontón y columnas.
  museo: (p) => (
    <GlifoBase {...p}>
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M4 21h16" />
      <path d="M6.5 21v-9M12 21v-9M17.5 21v-9" />
    </GlifoBase>
  ),
  // Escuela-estudio: libro abierto (formación).
  escuela: (p) => (
    <GlifoBase {...p}>
      <path d="M12 6.5C10 4.8 7 4.3 3.5 4.7V19c3.5-.4 6.5.1 8.5 1.8 2-1.7 5-2.2 8.5-1.8V4.7C17 4.3 14 4.8 12 6.5Z" />
      <path d="M12 6.5V20.8" />
    </GlifoBase>
  ),
  // Estudio de grabación: micrófono de cápsula.
  estudio: (p) => (
    <GlifoBase {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3.5M8.5 21.5h7" />
    </GlifoBase>
  ),
  // Estacionamiento multinivel: edificio de niveles con la P.
  estacionamiento: (p) => (
    <GlifoBase {...p}>
      <path d="M4 21V5.5h16V21M2.5 21h19" />
      <path d="M4 10h16M4 15.5h16" />
      <path d="M10.5 20.5v-3.7h2.2a1.6 1.6 0 0 1 0 3.2h-2.2" transform="translate(0,-1.2)" />
    </GlifoBase>
  ),
  // Departamento: fachada con ventanas y puerta.
  departamento: (p) => (
    <GlifoBase {...p}>
      <path d="M5 21V4.5h14V21M3.5 21h17" />
      <path d="M8.5 8h2.2M13.3 8h2.2M8.5 12h2.2M13.3 12h2.2" />
      <path d="M10.5 21v-4.5h3V21" />
    </GlifoBase>
  ),
  // Restaurante: cubierto y copa.
  restaurante: (p) => (
    <GlifoBase {...p}>
      <path d="M7 3.5v5a2 2 0 0 0 4 0v-5M9 3.5V21" />
      <path d="M15 3.5h4l-1 7h-2l-1-7ZM17 10.5V21" />
    </GlifoBase>
  ),
  // Otro: hito sencillo.
  otro: (p) => (
    <GlifoBase {...p}>
      <path d="M12 21V6" />
      <path d="M12 6l6 2.5L12 11" />
      <path d="M8.5 21h7" />
    </GlifoBase>
  ),
}

// Letrero corto de cada tipo (la 2ª línea del pin).
export const NOMBRE_TIPO = {
  venue: 'Foro', comercial: 'Comercial', mixto: 'Uso mixto', museo: 'Museo',
  escuela: 'Escuela', estudio: 'Estudio', estacionamiento: 'Estacionamiento',
  departamento: 'Departamento', restaurante: 'Restaurante', otro: '',
}

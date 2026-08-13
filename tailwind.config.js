/** @type {import('tailwindcss').Config} */

// Sistema de diseño "Desierto de noche" — TODOS los colores del board salen
// de estos tokens. Los contrastes están medidos contra WCAG 4.5:1 sobre el
// fondo #191411 (ver scripts/pruebas-careta.mjs, que los verifica en cada
// corrida). No agregar colores sueltos en los componentes.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fondos, de atrás hacia adelante
        noche: '#141010',      // fondo base: negro de estadio (estilo Cartel de Sonora)
        superficie: '#221B15', // tarjetas
        elevada: '#2C231C',    // paneles que flotan (fichas, panel financiero)
        linea: '#3A2F26',      // bordes y divisores

        // Texto
        marfil: '#F2EAD9',     // texto principal (12.9:1 sobre noche)
        arena: '#B7A890',      // texto secundario (7.2:1)
        terciario: '#9E8D78',  // texto de apoyo (pasa 4.5:1 sobre los TRES fondos)

        // Acentos del desierto
        oro: '#C9A45C',        // oro viejo: acentos, filetes
        ambar: '#FFB84D',      // ámbar neón: SOLO el dato estrella y el botón de entrar (un solo glow en todo el portal)
        orotinta: '#7A5E2A',   // oro para TEXTO sobre papel claro (el C9A45C no pasa contraste ahí)
        terracota: '#B85C38',  // solo texto grande (≥24px) o elementos no textuales
        salvia: '#8FA382',     // éxito / guardado
        ladrillo: '#E2705A',   // texto de error (el rojo oscuro #C1442E solo para bordes/fondos)

        // Papel (vista Reporte para imprimir)
        papel: '#FAF6EE',
        tinta: '#2B211A',
      },
      fontFamily: {
        titulo: ['Fraunces', 'Georgia', 'serif'],      // el documento: Reporte, fichas
        cartel: ['Anton', 'Impact', 'sans-serif'],      // señalética: secciones, zonas, la cifra estrella
        firma: ['"Pirata One"', 'Georgia', 'serif'],    // SOLO la palabra Amalaya
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        // La curva de la casa: salida suave, sin rebote. Se usa en TODO.
        casa: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        // Tres duraciones y nada más:
        micro: '180ms',  // hover, foco, switches
        panel: '420ms',  // paneles, pestañas, cortinas
        cine: '800ms',   // zoom del mapa, recorridos
      },
    },
  },
  plugins: [],
}

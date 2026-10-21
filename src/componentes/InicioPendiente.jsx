import LineaAmalaya from './LineaAmalaya.jsx'
import MarcaAmalaya from './MarcaAmalaya.jsx'

// El recorrido es público. La sesión, sus datos y sus herramientas siguen
// bloqueados por App mientras DatosProvider termina de comprobar el acceso.
export default function InicioPendiente() {
  return (
    <main className="portal-startup min-h-dvh flex items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-linea bg-superficie p-6 sm:p-9" aria-labelledby="inicio-pendiente-titulo">
        <MarcaAmalaya className="mb-8"/>
        <div role="status" aria-live="polite">
          <h1 id="inicio-pendiente-titulo" className="font-ui text-xl font-semibold text-marfil">Comprobando tu sesión…</h1>
          <p className="mt-3 mb-6 text-sm leading-relaxed text-arena">Estamos conectando tu espacio de trabajo.</p>
        </div>
        <LineaAmalaya cargando className="mb-8" />
        <a className="boton-primario inline-flex min-h-12 w-full items-center justify-center text-center text-sm" href="/amalaya-board/explorar.html?ligero=1&integrado=1">Abrir recorrido público →</a>
        <p className="mt-4 text-sm leading-relaxed text-arena">Puedes explorar Amalaya sin esperar a la comprobación.</p>
      </section>
    </main>
  )
}

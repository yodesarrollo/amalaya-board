import { Printer } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { moneda, metros2, fechaHora } from '../formato.js'
import { resumenGlobal, mapaConfig, normalizarId } from '../calc.js'
import { leerPuntos } from './Rutas.jsx'
import LineaAmalaya from './LineaAmalaya.jsx'

// ============================================================
// El Reporte — el plan de negocios limpio para banco e
// inversionista. En pantalla vive en el tema oscuro del board;
// al imprimir (Exportar a PDF) sale en papel claro con tinta
// (las reglas están en index.css bajo @media print).
//
// El rol `inversionista` SOLO ve esta vista: el servidor le
// entrega únicamente las pestañas que la alimentan.
// ============================================================

export default function Reporte() {
  const { datos, modo, ultimaSync } = usarDatos()
  const config = mapaConfig(datos?.Config || [])
  const espacios = datos?.Espacios || []
  const rutas = (datos?.Rutas || [])
  const paradas = datos?.Paradas || []
  const escenarios = datos?.Escenarios || []

  const g = resumenGlobal({
    espacios,
    lineas: datos?.Finanzas_Lineas || [],
    factores: datos?.Factores || [],
    escenarios,
    config,
  })
  const v = g.valorPorAccion
  const totalValor = Math.max(v.total, 1)

  const nombre = config[normalizarId('nombre_proyecto')] || 'Amalaya'
  const resumen = config[normalizarId('resumen_proyecto')] || ''
  const hoy = new Date()

  return (
    <div className="reporte max-w-3xl mx-auto px-5 py-8">
      {/* Botón de exportar (no sale en el PDF) */}
      <div className="no-imprimir flex justify-end mb-4">
        <button className="boton-primario !px-4 !py-2 text-sm" onClick={() => window.print()}>
          <span className="flex items-center gap-2"><Printer size={15} /> Exportar a PDF</span>
        </button>
      </div>

      {/* Portada */}
      <header className="text-center imp-seccion">
        <div className="text-xs uppercase tracking-[0.35em] text-arena">Plan de negocios</div>
        <h1 className="font-titulo text-5xl mt-3 tracking-tight">{nombre}</h1>
        <p className="text-terciario text-sm mt-2">
          Polígono de actuación concertada · Centro de Hermosillo, Sonora
        </p>
        <LineaAmalaya className="my-6 max-w-xs mx-auto" />
        <p className="text-terciario text-xs">
          {hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          {modo === 'demo' ? ' · DEMOSTRACIÓN — cifras inventadas' : ' · documento en vivo: se genera con los datos del momento'}
        </p>
      </header>

      {/* Resumen */}
      {resumen ? (
        <section className="mt-10 imp-seccion">
          <h2 className="font-titulo text-2xl mb-3">El proyecto</h2>
          <p className="text-arena leading-relaxed whitespace-pre-line">{resumen}</p>
        </section>
      ) : (
        <section className="mt-10 imp-seccion no-imprimir">
          <div className="tarjeta p-4">
            <p className="text-terciario text-sm">
              El texto de presentación del proyecto se captura en el Sheet:
              pestaña <b>Config</b>, clave <b>resumen_proyecto</b>. Mientras esté
              vacío, el PDF sale sin esta sección.
            </p>
          </div>
        </section>
      )}

      {/* El dato estrella */}
      <section className="mt-10 imp-seccion">
        <div className="tarjeta bg-elevada border-t-2 border-t-oro p-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-arena">Valor por acción</div>
          <div className="cifra text-5xl mt-2 font-medium imp-oro text-marfil">
            {v.porAccion === null ? '—' : moneda(v.porAccion)}
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden mt-5 bg-linea imp-barra max-w-md mx-auto">
            <div className="bg-terracota" style={{ width: `${(v.inmobiliario / totalValor) * 100}%` }} />
            <div className="bg-oro" style={{ width: `${(v.operativo / totalValor) * 100}%` }} />
            <div className="bg-salvia" style={{ width: `${(v.regalias / totalValor) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto text-sm">
            <div><div className="text-terciario text-xs">Inmobiliario</div><div className="cifra">{moneda(v.inmobiliario)}</div></div>
            <div><div className="text-terciario text-xs">Operativo</div><div className="cifra">{moneda(v.operativo)}</div></div>
            <div><div className="text-terciario text-xs">Regalías</div><div className="cifra">{moneda(v.regalias)}</div></div>
          </div>
          <p className="text-terciario text-xs mt-4 leading-relaxed max-w-md mx-auto">
            Cada acción combina el metro cuadrado inmobiliario, la utilidad de
            operar los espacios y las regalías de los artistas grabados en la
            escuela-estudio.
          </p>
        </div>
      </section>

      {/* Cifras clave */}
      <section className="mt-8 imp-seccion">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['Valor del proyecto', moneda(v.total)],
            ['Costo de construcción', moneda(g.costoConstruccion)],
            ['Utilidad anual', moneda(g.utilidadTotal)],
            ['Recuperación', g.aniosRecuperacion === null ? '—' : `${g.aniosRecuperacion.toFixed(1)} años`],
          ].map(([titulo, valor]) => (
            <div key={titulo} className="tarjeta p-4">
              <div className="text-xs text-terciario">{titulo}</div>
              <div className="cifra text-marfil text-lg mt-1">{valor}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Espacios */}
      <section className="mt-10 imp-seccion imp-salto">
        <h2 className="font-titulo text-2xl mb-3">Los espacios</h2>
        {espacios.length === 0 ? (
          <p className="text-terciario text-sm">Aún no hay espacios capturados.</p>
        ) : (
          <div className="space-y-2">
            {espacios.map((e) => {
              const r = g.porEspacio.find((x) => x.espacio.id === e.id)
              return (
                <div key={e.id} className="tarjeta p-4 flex items-baseline gap-3 flex-wrap">
                  <div className="flex-1 min-w-[10rem]">
                    <span className="text-xs uppercase tracking-wide text-terciario mr-2">{e.tipo}</span>
                    <span className="font-titulo text-lg">{e.nombre}</span>
                    {e.descripcion && <p className="text-arena text-sm mt-1 leading-relaxed">{e.descripcion}</p>}
                  </div>
                  <div className="text-right">
                    <div className="cifra text-sm text-marfil">{e.m2 ? metros2(e.m2) : '—'}</div>
                    <div className="text-xs text-terciario capitalize">{e.estado_desarrollo || 'idea'}</div>
                  </div>
                  <div className="text-right w-36">
                    <div className="text-xs text-terciario">utilidad anual</div>
                    <div className="cifra text-sm imp-oro text-oro">{r ? moneda(r.utilidad) : '—'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Escenarios activos */}
      {escenarios.length > 0 && (
        <section className="mt-8 imp-seccion">
          <h2 className="font-titulo text-2xl mb-3">Escenarios del modelo</h2>
          <div className="space-y-1.5">
            {escenarios.map((esc) => {
              const espacio = espacios.find((e) => String(e.id) === String(esc.espacio_id))
              const activo = normalizarId(esc.activo) === 'si'
              return (
                <div key={esc.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activo ? 'bg-salvia' : 'bg-linea'}`} />
                  <span className="text-marfil">{esc.nombre}</span>
                  <span className="text-terciario text-xs">
                    {espacio ? espacio.nombre : ''} · {activo ? 'considerado en las cifras' : 'alternativa'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Rutas */}
      <section className="mt-10 imp-seccion">
        <h2 className="font-titulo text-2xl mb-3">Las rutas temáticas</h2>
        {rutas.length === 0 ? (
          <p className="text-terciario text-sm">Aún no hay rutas trazadas.</p>
        ) : (
          <div className="space-y-2">
            {rutas.map((r) => {
              const numParadas = paradas.filter((p) => String(p.ruta_id) === String(r.id)).length
              return (
                <div key={r.id} className="tarjeta p-4 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0 imp-barra" style={{ background: r.color || '#C9A45C' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-marfil font-medium">{r.nombre}</div>
                    <div className="text-terciario text-xs">
                      {r.homenaje_a ? `Homenaje a ${r.homenaje_a}` : ''}
                      {r.artista_mural ? ` · mural de ${r.artista_mural}` : ''}
                    </div>
                  </div>
                  <div className="text-right text-xs text-terciario shrink-0">
                    <div className="cifra text-marfil text-sm">{numParadas}</div>
                    parada{numParadas === 1 ? '' : 's'}
                    {leerPuntos(r).length > 1 ? '' : ' · sin trazo'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p className="text-terciario text-xs mt-3 leading-relaxed">
          Las rutas conectan los espacios sobre las calles del polígono, cada
          una en homenaje a una figura de la música o el arte, con murales de
          artistas sonorenses y mejoras urbanas gestionadas con el municipio.
        </p>
      </section>

      {/* Pie */}
      <footer className="mt-12 pt-4 border-t border-linea text-center">
        <p className="text-terciario text-xs">
          {nombre} · board de control ·{' '}
          {ultimaSync ? `datos sincronizados ${fechaHora(ultimaSync)}` : 'datos del momento'}
        </p>
      </footer>
    </div>
  )
}

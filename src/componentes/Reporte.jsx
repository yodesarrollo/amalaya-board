import { useState } from 'react'
import { Printer, Snowflake, Eye, X, FileText } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { moneda, metros2, fechaHora } from '../formato.js'
import { resumenGlobal, mapaConfig, normalizarId, m2Construidos, lineasVigentes } from '../calc.js'
import { leerPuntos } from './Rutas.jsx'
import { puedeCongelarRol } from '../roles.js'
import ImagenDrive from './ImagenDrive.jsx'
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

// Índice del reporte (anclas).
const INDICE = [
  ['r-proyecto', 'El proyecto'],
  ['r-valor', 'Valor por acción'],
  ['r-por-espacio', 'Qué parte de cada acción es cada espacio'],
  ['r-espacios', 'Los espacios'],
  ['r-rutas', 'Las rutas temáticas'],
  ['r-supuestos', 'Supuestos y fuentes'],
]

const COLORES_ESPACIO = ['#B85C38', '#C9A45C', '#8FA382', '#8FB8D9', '#D98FA3', '#E8923A', '#9E8D78', '#E9D36A']

export default function Reporte() {
  const { sesion, datos: datosVivos, modo, ultimaSync, congelada, apiAccion, actualizar } = usarDatos()
  const sesionEsAdmin = modo !== 'demo' && sesion?.rol === 'admin'
  const puedeCongelar = modo !== 'demo' && puedeCongelarRol(sesion?.rol)
  const [viendo, setViendo] = useState(null)   // {version, datos} al abrir una versión congelada
  const [papel, setPapel] = useState(false)     // vista previa del PDF
  const datos = viendo?.datos || datosVivos
  const versionMostrada = viendo?.version || congelada
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
    <div className={`reporte max-w-3xl mx-auto px-5 py-8 ${papel ? 'modo-papel' : ''}`}>
      {/* Botones (no salen en el PDF) */}
      <div className="no-imprimir flex items-center justify-end gap-2 mb-4">
        {puedeCongelar && <Versiones viendo={viendo} setViendo={setViendo} apiAccion={apiAccion} actualizar={actualizar} versiones={datosVivos?.Versiones || []} cifras={cifrasDe(g)} />}
        <button className="text-xs text-arena hover:text-marfil flex items-center gap-1.5 px-2 py-1.5" onClick={() => setPapel(!papel)} aria-pressed={papel}>
          <Eye size={13} /> {papel ? 'Salir de la vista previa' : 'Vista previa'}
        </button>
        <button className="boton-primario !px-4 !py-2 text-sm" onClick={() => window.print()}>
          <span className="flex items-center gap-2"><Printer size={15} /> Exportar a PDF</span>
        </button>
      </div>

      {/* Antifallos: la versión congelada trae sus cifras; si el motor de hoy
          da otro número, se enseña el congelado y se avisa la diferencia. */}
      {versionMostrada?.cifras && Math.abs((versionMostrada.cifras.porAccion ?? 0) - (v.porAccion ?? 0)) > 0.5 && (
        <p className="text-xs text-center text-oro border border-oro/60 rounded-lg py-1.5 mb-4" role="status">
          Al congelarse, el valor por acción era <b className="cifra">{moneda(versionMostrada.cifras.porAccion)}</b>; con el cálculo de hoy sale <b className="cifra">{moneda(v.porAccion)}</b>. Vale lo congelado.
        </p>
      )}
      {versionMostrada && (
        <p className="text-xs text-center text-arena border border-linea rounded-lg py-1.5 mb-4">
          <Snowflake size={12} className="inline -mt-0.5 mr-1" />
          Versión congelada · {versionMostrada.nombre} · {fechaHora(new Date(versionMostrada.fecha))}
          {viendo && <button className="ml-2 underline print:hidden" onClick={() => setViendo(null)}>volver a la versión en vivo</button>}
        </p>
      )}

      {/* Portada (en papel, la firma cae a Fraunces: sobriedad de documento) */}
      <header className="text-center imp-seccion">
        <div className="text-xs uppercase tracking-[0.35em] text-arena">Plan de negocios</div>
        <h1 className="font-firma font-normal print:font-titulo text-6xl print:text-5xl mt-3">{nombre}</h1>
        <p className="text-terciario text-sm mt-2">
          Polígono de actuación concertada · Centro de Hermosillo, Sonora
        </p>
        <LineaAmalaya className="my-6 max-w-xs mx-auto" />
        <p className="text-terciario text-xs">
          {hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          {modo === 'demo' ? ' · DEMOSTRACIÓN — cifras inventadas' : versionMostrada ? ' · versión congelada' : ' · documento en vivo: se genera con los datos del momento'}
        </p>
      </header>

      {/* Índice */}
      <nav className="mt-8 imp-seccion" aria-label="Índice del reporte">
        <div className="text-xs uppercase tracking-[0.25em] text-terciario mb-2">Índice</div>
        <ol className="text-sm space-y-1 list-decimal list-inside text-arena">
          {INDICE.map(([id, t]) => <li key={id}><a className="hover:text-marfil" href={`#${id}`}>{t}</a></li>)}
        </ol>
      </nav>

      {/* Resumen */}
      {resumen ? (
        <section id="r-proyecto" className="mt-10 imp-seccion">
          <h2 className="font-titulo text-2xl mb-3">El proyecto</h2>
          <p className="text-arena leading-relaxed whitespace-pre-line">{resumen}</p>
        </section>
      ) : sesionEsAdmin && (
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

      {/* Artistas de la casa: el gancho emocional del proyecto */}
      {(() => {
        const caras = (datos?.Archivos || []).filter((a) => String(a.tipo) === 'cara' && a.file_id && a.nombre)
        if (caras.length === 0) return null
        return (
          <section className="mt-10 imp-seccion">
            <h2 className="font-titulo text-2xl mb-4 text-center">Artistas de la casa</h2>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
              {caras.map((c) => {
                const esp = espacios.find((e) => String(e.id) === String(c.espacio_id))
                return (
                  <figure key={c.id} className="text-center w-24">
                    <span className="block w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-oro imp-barra bg-noche">
                      <ImagenDrive fileId={c.file_id} sz="w200" alt={c.nombre} className="w-full h-full object-cover" />
                    </span>
                    <figcaption className="mt-1.5">
                      <div className="text-marfil text-xs font-medium leading-tight">{c.nombre}</div>
                      {esp && <div className="text-terciario text-[10px] leading-tight">{esp.nombre}</div>}
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* El dato estrella */}
      <section id="r-valor" className="mt-10 imp-seccion">
        <div className="tarjeta bg-elevada border-t-2 border-t-ambar p-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-arena">Valor por acción</div>
          <div className="cifra font-cartel font-normal print:font-titulo text-5xl mt-2 imp-oro text-marfil glow-ambar">
            {versionMostrada?.cifras?.porAccion != null ? moneda(versionMostrada.cifras.porAccion) : v.porAccion === null ? '—' : moneda(v.porAccion)}
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

      {/* Valor por acción desglosado por espacio */}
      <section id="r-por-espacio" className="mt-10 imp-seccion">
        <h2 className="font-titulo text-2xl mb-1">Qué parte de cada acción es cada espacio</h2>
        <p className="text-terciario text-xs mb-3">Cada acción vale {v.porAccion === null ? '—' : moneda(v.porAccion)}; así se reparte entre los espacios.</p>
        {v.porAccion === null ? (
          <p className="text-terciario text-sm">Falta capturar acciones_emitidas para repartir la acción.</p>
        ) : (
          <>
            <div className="flex h-4 rounded-full overflow-hidden bg-linea imp-barra" role="img" aria-label="Valor por acción por espacio">
              {g.porEspacio.filter((x) => x.valor > 0).map((x, i) => (
                <div key={x.espacio.id} title={`${x.espacio.nombre}: ${moneda(x.porAccion)}`} style={{ width: `${(x.valor / totalValor) * 100}%`, background: COLORES_ESPACIO[i % COLORES_ESPACIO.length] }} />
              ))}
            </div>
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="text-xs text-terciario text-left">
                  <th className="font-normal py-1">Espacio</th>
                  <th className="font-normal py-1 text-right">Inmobiliario</th>
                  <th className="font-normal py-1 text-right">Operativo</th>
                  <th className="font-normal py-1 text-right">Regalías</th>
                  <th className="font-normal py-1 text-right">Por acción</th>
                  <th className="font-normal py-1 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {g.porEspacio.filter((x) => x.valor !== 0).map((x, i) => (
                  <tr key={x.espacio.id} className="border-t border-linea">
                    <td className="py-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2 imp-barra" style={{ background: COLORES_ESPACIO[i % COLORES_ESPACIO.length] }} />{x.espacio.nombre}</td>
                    <td className="cifra text-right text-arena">{moneda(x.inmobiliario / (v.total / v.porAccion))}</td>
                    <td className="cifra text-right text-arena">{moneda(x.operativo / (v.total / v.porAccion))}</td>
                    <td className="cifra text-right text-arena">{moneda(x.regaliasValor / (v.total / v.porAccion))}</td>
                    <td className="cifra text-right text-marfil imp-oro">{moneda(x.porAccion)}</td>
                    <td className="cifra text-right text-terciario">{((x.valor / totalValor) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="border-t border-linea font-medium">
                  <td className="py-1.5">Total</td><td /><td /><td />
                  <td className="cifra text-right text-oro imp-oro">{moneda(v.porAccion)}</td>
                  <td className="cifra text-right text-terciario">100%</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* Espacios */}
      <section id="r-espacios" className="mt-10 imp-seccion imp-salto">
        <h2 className="font-titulo text-2xl mb-3">Los espacios</h2>
        {espacios.length === 0 ? (
          <p className="text-terciario text-sm">Aún no hay espacios capturados.</p>
        ) : (
          <div className="space-y-2">
            {espacios.map((e) => {
              const r = g.porEspacio.find((x) => x.espacio.id === e.id)
              const { m2c, cos, pisos } = m2Construidos(e, datos?.Factores || [])
              const construidoDistinto = (cos !== null || pisos !== null) && Math.round(m2c) !== Math.round(Number(e.m2) || 0)
              // Los supuestos de las líneas vigentes: la letra chica que
              // responde el «¿de dónde sale?» del inversionista.
              const vigentes = lineasVigentes(
                (datos?.Finanzas_Lineas || []).filter((l) => String(l.espacio_id) === String(e.id)),
                escenarios.filter((x) => String(x.espacio_id) === String(e.id))
              )
              const supuestos = vigentes
                .filter((l) => String(l.supuesto || '').trim())
                .map((l) => `${l.concepto}: ${String(l.supuesto).trim()}`)
              return (
                <div key={e.id} className="tarjeta p-4">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <div className="flex-1 min-w-[10rem]">
                      <span className="text-xs uppercase tracking-wide text-terciario mr-2">{e.tipo}</span>
                      <span className="font-titulo text-lg">{e.nombre}</span>
                      {e.descripcion && <p className="text-arena text-sm mt-1 leading-relaxed">{e.descripcion}</p>}
                    </div>
                    <div className="text-right">
                      <div className="cifra text-sm text-marfil">{e.m2 ? metros2(e.m2) : '—'}</div>
                      {construidoDistinto && (
                        <div className="text-xs text-terciario">≈ {metros2(Math.round(m2c))} construidos</div>
                      )}
                      <div className="text-xs text-terciario capitalize">{e.estado_desarrollo || 'idea'}</div>
                    </div>
                    <div className="text-right w-36">
                      {r && (r.ingreso !== 0 || r.costo !== 0) && (
                        <div className="text-xs text-terciario leading-relaxed">
                          <div>ingreso <span className="cifra text-marfil">{moneda(r.ingreso)}</span></div>
                          <div>costo <span className="cifra text-marfil">{moneda(r.costo)}</span></div>
                        </div>
                      )}
                      <div className="text-xs text-terciario">utilidad anual</div>
                      <div className="cifra text-sm imp-oro text-oro">{r ? moneda(r.utilidad) : '—'}</div>
                    </div>
                  </div>
                  {supuestos.length > 0 && (
                    <p className="text-terciario text-[11px] mt-2 leading-relaxed border-t border-linea pt-2">
                      Supuestos: {supuestos.join(' · ')}
                    </p>
                  )}
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
      <section id="r-rutas" className="mt-10 imp-seccion">
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
                    {leerPuntos(r).length > 1 ? 'ruta peatonal trazada' : 'por trazar'}
                    {numParadas > 0 ? ` · ${numParadas} punto${numParadas === 1 ? '' : 's'} de interés` : ''}
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

      {/* Supuestos y fuentes */}
      <SupuestosYFuentes datos={datos} espacios={espacios} escenarios={escenarios} />

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

// ------------------------------------------------------------
// Supuestos y fuentes: de dónde sale cada número.
// ------------------------------------------------------------
function SupuestosYFuentes({ datos, espacios, escenarios }) {
  const parametros = (datos?.Config || []).filter((c) => /supuesto/i.test(String(c.notas || '')) && String(c.valor ?? '').trim() !== '' && !/^(mapa_geo|google_client_id|resumen_proyecto|nombre_proyecto)$/.test(String(c.clave)))
  const lineas = lineasVigentes(datos?.Finanzas_Lineas || [], escenarios)
  const porEspacio = espacios.map((e) => ({
    e,
    items: lineas.filter((l) => String(l.espacio_id) === String(e.id)).map((l) => ({ concepto: l.concepto, supuesto: String(l.supuesto || '').trim() })),
  })).filter((x) => x.items.length)
  const fuentes = (datos?.Conocimientos || []).filter((c) => String(c.fuente || '').trim())
  return (
    <section id="r-supuestos" className="mt-10 imp-seccion">
      <h2 className="font-titulo text-2xl mb-3">Supuestos y fuentes</h2>
      {porEspacio.length > 0 && (
        <div className="space-y-2">
          {porEspacio.map(({ e, items }) => (
            <div key={e.id} className="text-xs">
              <div className="text-marfil font-medium">{e.nombre}</div>
              <ul className="text-arena leading-relaxed">
                {items.map((it, i) => (
                  <li key={i}>· {it.concepto}: {it.supuesto || <span className="text-terciario italic">sin supuesto escrito</span>}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {parametros.length > 0 && (
        <div className="mt-4 text-xs">
          <div className="text-marfil font-medium mb-1">Parámetros del modelo (supuestos — editables)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-arena">
            {parametros.map((c) => <div key={c.clave} className="flex justify-between border-b border-linea py-0.5"><span>{c.clave}</span><span className="cifra">{String(c.valor)}</span></div>)}
          </div>
        </div>
      )}
      {fuentes.length > 0 && (
        <div className="mt-4 text-xs">
          <div className="text-marfil font-medium mb-1">Fuentes</div>
          <ul className="text-arena leading-relaxed">
            {fuentes.map((c) => <li key={c.id}>· {c.texto} — <span className="text-terciario">{c.fuente}</span></li>)}
          </ul>
        </div>
      )}
      <p className="text-terciario text-[11px] mt-4 leading-relaxed">
        Todas las cifras son proyecciones calculadas con estos supuestos; no son una promesa de rendimiento.
      </p>
    </section>
  )
}

// ------------------------------------------------------------
// Versiones congeladas (solo admin y máster). Congelar guarda en
// Drive una foto de los datos del Reporte; el inversionista ve la
// última congelada.
// ------------------------------------------------------------
// Las cifras que se congelan junto con los datos (antifallos).
function cifrasDe(g) {
  const v = g.valorPorAccion
  return {
    motor: 2, porAccion: v.porAccion, total: v.total, inmobiliario: v.inmobiliario, operativo: v.operativo, regalias: v.regalias,
    utilidadTotal: g.utilidadTotal, costoConstruccion: g.costoConstruccion,
    porEspacio: g.porEspacio.map((x) => ({ id: x.espacio.id, nombre: x.espacio.nombre, utilidad: x.utilidad, porAccion: x.porAccion })),
  }
}

function Versiones({ viendo, setViendo, apiAccion, actualizar, versiones, cifras }) {
  const [abierto, setAbierto] = useState(false)
  const [ocupado, setOcupado] = useState(null)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)

  async function congelar() {
    if (!window.confirm('¿Congelar el reporte tal como está ahora? El inversionista verá esta versión.')) return
    setOcupado('congelar'); setError(null)
    try {
      const r = await apiAccion('congelarReporte', { cifras })
      setAviso(`Versión ${r.fila.id} congelada.`)
      await actualizar()
    } catch (e) { setError(e.message) } finally { setOcupado(null) }
  }
  async function ver(v) {
    setOcupado(v.id); setError(null)
    try {
      const r = await apiAccion('verVersion', { id: v.id })
      setViendo({ version: r.version, datos: r.datos })
      setAbierto(false)
    } catch (e) { setError(e.message) } finally { setOcupado(null) }
  }
  return (
    <div className="relative">
      <button className="text-xs text-arena hover:text-marfil flex items-center gap-1.5 px-2 py-1.5" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
        <Snowflake size={13} /> Versiones{versiones.length ? ` (${versiones.length})` : ''}
      </button>
      {abierto && (
        <div className="absolute right-0 top-full mt-1 z-30 w-72 rounded-xl border border-linea shadow-2xl p-3 text-sm" style={{ background: '#1C1613' }}>
          <div className="flex items-center mb-2">
            <span className="text-marfil flex-1">Versiones congeladas</span>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar"><X size={14} /></button>
          </div>
          <button className="boton-secundario w-full !py-1.5 text-xs" onClick={congelar} disabled={ocupado === 'congelar'}>
            <span className="flex items-center justify-center gap-1.5"><Snowflake size={12} /> {ocupado === 'congelar' ? 'Congelando…' : 'Congelar esta versión'}</span>
          </button>
          {aviso && <p className="text-salvia text-xs mt-2">{aviso}</p>}
          {error && <p className="text-ladrillo text-xs mt-2" role="alert">{error}</p>}
          <ul className="mt-2 space-y-1 max-h-60 overflow-y-auto">
            {[...versiones].reverse().map((v) => (
              <li key={v.id}>
                <button className={`w-full text-left text-xs px-2 py-1.5 rounded flex items-center gap-2 hover:bg-oro/10 ${viendo?.version?.id === v.id ? 'text-ambar' : 'text-arena'}`} onClick={() => ver(v)} disabled={ocupado === v.id}>
                  <FileText size={12} /> <span className="flex-1 truncate">{v.id} · {fechaHora(new Date(v.fecha))}</span>
                  <span className="text-terciario">{v.usuario}</span>
                </button>
              </li>
            ))}
            {versiones.length === 0 && <li className="text-terciario text-xs">Aún no hay versiones congeladas.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

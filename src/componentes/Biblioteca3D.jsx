import { useEffect, useState } from 'react'
import { BASE } from '../config.js'
import { urlActivo } from '../modelos3d.js'

const VISTAS = ['iso_01', 'iso_02', 'iso_03', 'iso_04', 'alzado_A', 'alzado_B', 'alzado_C', 'alzado_D', 'azotea']
const TITULOS = ['Isométrico 1', 'Isométrico 2', 'Isométrico 3', 'Isométrico 4', 'Fachada A', 'Fachada B', 'Fachada C', 'Fachada D', 'Azoteas']

// Piloto de solo lectura: no llama Apps Script, no sube datos ni modifica cifras.
export default function Biblioteca3D({ moduloId = null }) {
  const [catalogo, setCatalogo] = useState(null)
  const [seleccion, setSeleccion] = useState(moduloId || '01')
  const [error, setError] = useState('')
  const [vista, setVista] = useState('3d')
  useEffect(() => { if (moduloId) setSeleccion(moduloId) }, [moduloId])
  useEffect(() => {
    const abort = new AbortController()
    fetch(urlActivo(BASE, 'manifest.json'), { signal: abort.signal })
      .then((r) => { if (!r.ok) throw new Error('No se encontró el catálogo 3D.'); return r.json() })
      .then((j) => {
        if (j.version !== 1 || !Array.isArray(j.modulos) || !j.modulos.every((m) => /^[0-9]{2}$/.test(m.id))) throw new Error('El catálogo no tiene el formato esperado.')
        setCatalogo(j)
      })
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message) })
    return () => abort.abort()
  }, [])
  if (error) return <p className="tarjeta p-4 text-ladrillo" role="alert">{error}</p>
  if (!catalogo) return <p className="p-4 text-arena" role="status">Cargando modelos…</p>
  const m = catalogo.modulos.find((item) => item.id === seleccion)
  if (!m) return <p className="p-4 text-arena">El módulo asignado no existe en esta versión del catálogo.</p>
  const link = (path) => urlActivo(BASE, path)
  const folder = `modulos/${m.id}/`
  return (
    <section className="max-w-6xl mx-auto p-4 space-y-4" aria-label="Biblioteca de modelos 3D">
      <div>
        <h2 className="font-titulo text-2xl">Volúmenes de Amalaya</h2>
        <p className="text-sm text-arena mt-2">Modelos conceptuales. Dimensiones relativas y fachadas interpretadas; orientación geográfica pendiente.</p>
      </div>
      {!moduloId && <label className="block text-sm text-arena">Módulo
        <select className="campo mt-1" value={seleccion} onChange={(e) => { setSeleccion(e.target.value); setVista('3d') }}>
          {catalogo.modulos.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.nombre}</option>)}
        </select>
      </label>}
      <p className="text-sm text-terciario">{m.nota}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="boton-secundario" aria-pressed={vista === '3d'} onClick={() => setVista('3d')}>Girar modelo</button>
        <button type="button" className="boton-secundario" aria-pressed={vista === 'vistas'} onClick={() => setVista('vistas')}>Fachadas y azoteas</button>
        <a className="boton-secundario" href={link(m.glb)} download>Descargar GLB</a>
        <a className="boton-secundario" href={link(m.obj)} download>OBJ</a>
        <a className="boton-secundario" href={link(m.mtl)} download>Materiales MTL</a>
      </div>
      {vista === '3d' ? <div>
        <iframe key={m.id} src={`${link('Visor_3D.html')}?modulo=${encodeURIComponent(m.id)}`} title={`Modelo 3D · ${m.nombre}`} className="w-full border border-linea rounded-xl bg-white" style={{ height: 'min(740px,80vh)', minHeight: 420 }} />
        <p className="text-xs text-terciario mt-2">Arrastra para girar y usa los botones de 90°. Si tu equipo no muestra 3D, abre las vistas PNG.</p>
      </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {VISTAS.map((v, i) => <article key={v} className="tarjeta p-3">
          <img src={link(folder + v + '.png')} alt={`${TITULOS[i]} · ${m.nombre}`} width="700" height="700" className="w-full h-auto rounded bg-white" />
          <h3 className="text-sm mt-2 text-marfil">{TITULOS[i]}</h3>
          <div className="flex gap-4 text-xs mt-2 text-oro"><a download href={link(folder + v + '.png')}>PNG</a><a download href={link(folder + v + '.svg')}>SVG para calcar</a></div>
        </article>)}
      </div>}
      <div className="flex flex-wrap gap-4 text-sm text-oro">
        <a href={link(m.lamina)} target="_blank" rel="noreferrer">Lámina de este módulo</a>
        <a href={link('Amalaya_3D.zip')} download>Todos los módulos</a>
        <a href={link('Amalaya_Territorio.zip')} download>Mapas, máscaras y entorno</a>
      </div>
    </section>
  )
}

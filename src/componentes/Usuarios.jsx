import { useState } from 'react'
import { Plus, KeyRound, Download, Copy, Check, Moon, Link as LinkIcon, Unlink, Share2 } from 'lucide-react'
import { usarDatos } from '../datos.jsx'

// ============================================================
// El equipo (solo admin): alta de usuarios, activar/desactivar,
// y generar códigos de acceso.
//
// Los códigos NUNCA viajan en claro al navegador: el servidor
// los manda enmascarados (••••1234). Un código nuevo se genera
// EN el servidor y se muestra UNA sola vez, aquí, para que el
// admin se lo pase a la persona por el canal que prefiera.
// ============================================================

const ROLES = ['admin', 'editor', 'visor', 'inversionista']

export default function Usuarios() {
  const { datos, modo, crearFila, editarFila, apiAccion } = usarDatos()
  const usuarios = datos?.Usuarios || []
  const [creando, setCreando] = useState(false)
  const [codigoNuevo, setCodigoNuevo] = useState(null) // {nombre, codigo} — se muestra una vez
  const [ocupado, setOcupado] = useState(null)
  const [error, setError] = useState(null)
  const [respaldo, setRespaldo] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const esDemo = modo === 'demo'

  async function generarCodigo(u) {
    setOcupado(u.id)
    setError(null)
    try {
      const r = await apiAccion('nuevoCodigo', { usuario_id: u.id })
      setCodigoNuevo({ tipo: 'código', nombre: u.nombre, valor: r.codigo })
      setCopiado(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(null)
    }
  }

  async function generarLiga(u) {
    setOcupado(u.id)
    setError(null)
    try {
      const r = await apiAccion('generarLiga', { usuario_id: u.id })
      setCodigoNuevo({ tipo: 'liga', nombre: u.nombre, valor: r.liga })
      setCopiado(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(null)
    }
  }

  async function revocarLiga(u) {
    setOcupado(u.id)
    setError(null)
    try {
      await apiAccion('revocarLiga', { usuario_id: u.id })
      setRespaldo(`La liga de ${u.nombre} quedó revocada.`)
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(null)
    }
  }

  async function respaldar() {
    setOcupado('respaldo')
    setError(null)
    setRespaldo(null)
    try {
      const r = await apiAccion('respaldoAhora')
      setRespaldo(`Respaldo guardado en Drive → AMALAYA → Respaldos: ${r.respaldo}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(null)
    }
  }

  async function activarNocturno() {
    setOcupado('nocturno')
    setError(null)
    setRespaldo(null)
    try {
      const r = await apiAccion('instalarRespaldo')
      setRespaldo(r.ya_existia
        ? 'El respaldo nocturno ya estaba activo (cada noche ~3 am).'
        : 'Respaldo nocturno activado: cada noche ~3 am a Drive → AMALAYA → Respaldos.')
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-cartel font-normal uppercase tracking-wide text-2xl flex-1">El equipo</h2>
        <button className="boton-secundario !px-3 !py-2 text-sm" onClick={activarNocturno} disabled={esDemo || ocupado === 'nocturno'} title="Activa el respaldo automático de cada noche">
          <span className="flex items-center gap-1.5">
            <Moon size={14} /> {ocupado === 'nocturno' ? 'Activando…' : 'Nocturno'}
          </span>
        </button>
        <button className="boton-secundario !px-3 !py-2 text-sm" onClick={respaldar} disabled={esDemo || ocupado === 'respaldo'}>
          <span className="flex items-center gap-1.5">
            <Download size={14} /> {ocupado === 'respaldo' ? 'Respaldando…' : 'Respaldo'}
          </span>
        </button>
        <button className="boton-primario !px-3 !py-2 text-sm" onClick={() => setCreando(true)} disabled={esDemo}>
          <span className="flex items-center gap-1.5"><Plus size={14} /> Persona</span>
        </button>
      </div>

      {respaldo && <p className="text-salvia text-sm">{respaldo}</p>}
      {error && <p className="text-ladrillo text-sm" role="alert">{error}</p>}

      {usuarios.length === 0 && (
        <p className="text-terciario text-sm">
          {esDemo ? 'En la demostración no se administran personas.' : 'Sin personas registradas.'}
        </p>
      )}

      {usuarios.map((u) => {
        const activo = String(u.activo).toLowerCase() === 'si'
        const conLiga = String(u.tiene_liga).toLowerCase() === 'si'
        return (
          <div key={u.id} className="tarjeta p-4 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[10rem]">
              <div className="text-marfil font-medium">{u.nombre}</div>
              <div className="text-terciario text-xs">
                {u.rol} {u.correo ? `· ${u.correo}` : ''} · código <span className="cifra">{u.codigo_enmascarado || '—'}</span>
                {' · '}
                <span className={conLiga ? 'text-salvia' : ''}>{conLiga ? 'liga activa' : 'sin liga'}</span>
              </div>
            </div>
            <button
              className="boton-secundario !px-2.5 !py-1.5 text-xs"
              onClick={() => generarCodigo(u)}
              disabled={esDemo || ocupado === u.id}
              title="Código nuevo (el anterior deja de servir)"
              aria-label={`Código nuevo para ${u.nombre}`}
            >
              <KeyRound size={13} />
            </button>
            <button
              className="boton-secundario !px-2.5 !py-1.5 text-xs"
              onClick={() => generarLiga(u)}
              disabled={esDemo || ocupado === u.id}
              title={conLiga ? 'Generar liga nueva (la anterior deja de servir)' : 'Generar su liga de acceso'}
              aria-label={`Liga de acceso para ${u.nombre}`}
            >
              <LinkIcon size={13} />
            </button>
            {conLiga && (
              <button
                className="boton-secundario !px-2.5 !py-1.5 text-xs"
                onClick={() => revocarLiga(u)}
                disabled={esDemo || ocupado === u.id}
                title="Revocar su liga (su código sigue funcionando)"
                aria-label={`Revocar la liga de ${u.nombre}`}
              >
                <Unlink size={13} />
              </button>
            )}
            <button
              role="switch"
              aria-checked={activo}
              disabled={esDemo}
              onClick={() => editarFila('Usuarios', u.id, { activo: activo ? 'no' : 'si' })}
              className={`relative w-12 h-7 rounded-full transition-colors duration-micro ease-casa
                ${activo ? 'bg-salvia' : 'bg-linea'}`}
              title={activo ? 'Activo — pícale para cortarle el acceso' : 'Inactivo — pícale para reactivar'}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-marfil transition-transform duration-micro ease-casa
                ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )
      })}

      <p className="text-terciario text-xs leading-relaxed">
        Desactivar a alguien le corta el acceso en su siguiente conexión: el
        servidor revalida el código en cada llamada. Los códigos completos no
        se pueden ver aquí — solo generar nuevos.
      </p>

      {/* La credencial nueva (código o liga), mostrada UNA vez */}
      {codigoNuevo && (
        <div className="fixed inset-0 z-50 bg-noche/80 flex items-center justify-center p-4" onClick={() => setCodigoNuevo(null)}>
          <div className="tarjeta bg-elevada p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-titulo text-xl">
              {codigoNuevo.tipo === 'liga' ? 'Liga de acceso para' : 'Código para'} {codigoNuevo.nombre}
            </h3>
            <div className={`cifra text-oro mt-4 select-all break-all ${codigoNuevo.tipo === 'liga' ? 'text-sm' : 'text-3xl tracking-[0.2em]'}`}>
              {codigoNuevo.valor}
            </div>
            <p className="text-terciario text-xs mt-3 leading-relaxed">
              Se muestra solo esta vez. {codigoNuevo.tipo === 'liga'
                ? 'Mándasela por el canal que prefieras: con picarle, entra directo.'
                : 'Pásaselo por el canal que prefieras; después aquí solo se verá enmascarado.'}
            </p>
            <div className="flex gap-2 mt-5">
              <button
                className="boton-secundario flex-1 !py-2 text-sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(codigoNuevo.valor)
                    setCopiado(true)
                  } catch { /* sin permiso de portapapeles: se selecciona a mano */ }
                }}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? 'Copiado' : 'Copiar'}
                </span>
              </button>
              {codigoNuevo.tipo === 'liga' && typeof navigator.share === 'function' && (
                <button
                  className="boton-secundario flex-1 !py-2 text-sm"
                  onClick={() => navigator.share({ title: 'Tu acceso a Amalaya', url: codigoNuevo.valor }).catch(() => {})}
                >
                  <span className="flex items-center justify-center gap-1.5"><Share2 size={14} /> Compartir</span>
                </button>
              )}
              <button className="boton-primario flex-1 !py-2 text-sm" onClick={() => setCodigoNuevo(null)}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {creando && (
        <FormaNuevaPersona
          onCrear={async (fila) => {
            const nueva = await crearFila('Usuarios', fila)
            setCreando(false)
            return nueva
          }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </div>
  )
}

function FormaNuevaPersona({ onCrear, onCerrar }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [rol, setRol] = useState('editor')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(ev) {
    ev.preventDefault()
    if (!nombre.trim()) return
    setOcupado(true)
    setError(null)
    try {
      await onCrear({
        nombre: nombre.trim(),
        correo: correo.trim(),
        rol,
        codigo_acceso: '',   // sin código hasta que el admin genere uno
        activo: 'si',
      })
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-noche/70 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <form className="tarjeta bg-elevada p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h3 className="font-titulo text-xl">Nueva persona</h3>
        <p className="text-terciario text-sm mt-1">
          Al crearla no tiene código: genera uno con "Código nuevo" y pásaselo.
        </p>
        <label className="block mt-4">
          <span className="text-sm text-arena">Nombre</span>
          <input className="campo mt-1.5" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus disabled={ocupado} />
        </label>
        <label className="block mt-3">
          <span className="text-sm text-arena">Correo (opcional)</span>
          <input className="campo mt-1.5" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} disabled={ocupado} />
        </label>
        <label className="block mt-3">
          <span className="text-sm text-arena">Rol</span>
          <select className="campo mt-1.5" value={rol} onChange={(e) => setRol(e.target.value)} disabled={ocupado}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <p className="text-terciario text-xs mt-2 leading-relaxed">
          admin: todo · editor: espacios, rutas, finanzas y tareas · visor: solo
          lectura · inversionista: solo el Reporte
        </p>
        {error && <p className="text-ladrillo text-sm mt-3" role="alert">{error}</p>}
        <div className="flex gap-2 mt-5">
          <button type="button" className="boton-secundario flex-1" onClick={onCerrar} disabled={ocupado}>Cancelar</button>
          <button type="submit" className="boton-primario flex-1" disabled={ocupado || !nombre.trim()}>
            {ocupado ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}

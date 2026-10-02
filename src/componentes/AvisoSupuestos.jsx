import { haySupuestosFinancieros } from '../confianza.js'

export default function AvisoSupuestos({ datos }) {
  if (!haySupuestosFinancieros(datos)) return null
  return (
    <p className="text-xs text-arena border border-oro/50 rounded-lg p-3 my-3" role="note">
      <strong className="text-marfil">Proyección con supuestos.</strong>{' '}
      El valor por acción depende de estimaciones; requiere validar sus insumos antes de presentarlo como definitivo.
    </p>
  )
}

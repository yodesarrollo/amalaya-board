// Fotos del levantamiento: almacenamiento local separado de los datos públicos.
export const MAX_FOTOS = 4
export function validarFoto(file) {
  if (!file || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) throw new Error('Elige una foto JPG, PNG, WebP o HEIC.')
  if (file.size > 20 * 1024 * 1024) throw new Error('Cada foto debe pesar menos de 20 MB.')
}
export async function prepararFoto(file) {
  validarFoto(file)
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    try { await img.decode() } catch { throw new Error('Este navegador no puede abrir esa foto. Elige JPG o toma una foto con la cámara.') }
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(img, 0, 0, canvas.width, canvas.height)
    // Re-encode: limita peso y elimina EXIF/GPS del archivo compartido.
    const data = canvas.toDataURL('image/jpeg', .82)
    if (!data.startsWith('data:image/jpeg;base64,') || data.length > 4 * 1024 * 1024) throw new Error('No se pudo preparar la foto. Prueba con una imagen más pequeña.')
    return { id: crypto.randomUUID(), data, state: 'pending' }
  } finally { URL.revokeObjectURL(url) }
}
export async function fotoStore(key, value) {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open('amalaya-3d-fotos', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('borradores')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error('No se pudo abrir el borrador local.'))
  })
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('borradores', value === undefined ? 'readonly' : 'readwrite')
      const store = tx.objectStore('borradores')
      const req = value === undefined ? store.get(key) : store.put(value, key)
      tx.oncomplete = () => resolve(req.result)
      tx.onerror = tx.onabort = () => reject(new Error('No se pudo guardar el borrador de fotos en este navegador.'))
    })
  } finally { db.close() }
}
export function uploadPayload(cell, photo, codigo) {
  return { codigo, privado: true, espacio_id: `levantamiento-${cell.key}`, nombre: `${cell.buildingId}-${cell.task}-${photo.id}.jpg`, mime: 'image/jpeg', base64: photo.data.split(',')[1] }
}
export function adjuntarFotos(payload, photos) {
  const refs = photos.map(p => ({ file_id: p.file_id, nombre: p.nombre }))
  if (refs.some(p => !p.file_id)) throw new Error('Todavía falta confirmar alguna foto.')
  payload.elemento.valores.fotos = refs
  // El puente publica texto en GitHub: IDs, nombres y fotos quedan sólo en detalle privado.
  if (refs.length) payload.texto += `\nFotos privadas adjuntas: ${refs.length}. Consultar el detalle de esta indicación en Amalaya.`
  return payload
}

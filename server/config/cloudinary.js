import { v2 as cloudinary } from 'cloudinary'

let configured = false

export default function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    configured = true
  }
  return cloudinary
}

// Carpeta donde se guardan los archivos subidos (se conserva el nombre original para no romper URLs)
export const UPLOAD_FOLDER = 'roxy-nails'

// Límites de los videos de la galería
export const VIDEO_LIMITS = { maxSeconds: 60, maxBytes: 50 * 1024 * 1024 }

// Extrae tipo de recurso y public_id de una URL de nuestro Cloudinary, o null si no lo es
export function parseCloudinaryUrl(url) {
  const m = String(url || '').match(/res\.cloudinary\.com\/([^/]+)\/(image|video)\/upload\/(?:[^/]*,[^/]*\/)*(?:v\d+\/)?(.+)\.\w+$/)
  if (!m || m[1] !== process.env.CLOUDINARY_CLOUD_NAME) return null
  return { resourceType: m[2], publicId: m[3] }
}

// Borra de Cloudinary las imágenes o videos indicados por URL (ignora los que no son de nuestro Cloudinary).
// Un fallo solo se registra: no debe impedir el borrado del documento.
export async function destroyImages(...urls) {
  for (const url of urls.flat().filter(Boolean)) {
    const parsed = parseCloudinaryUrl(url)
    if (!parsed) continue
    try { await getCloudinary().uploader.destroy(parsed.publicId, { resource_type: parsed.resourceType }) }
    catch (err) { console.error('No se pudo borrar de Cloudinary:', err.message) }
  }
}

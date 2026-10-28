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

// Borra de Cloudinary las imágenes indicadas por URL (ignora las que no son de Cloudinary).
// Un fallo solo se registra: no debe impedir el borrado del documento.
export async function destroyImages(...urls) {
  for (const url of urls.flat().filter(Boolean)) {
    const publicId = url.match(/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)\.\w+$/)?.[1]
    if (!publicId) continue
    try { await getCloudinary().uploader.destroy(publicId) }
    catch (err) { console.error('No se pudo borrar de Cloudinary:', err.message) }
  }
}

import { Router } from 'express'
import { uploadImage } from '../controllers/upload.controller.js'
import getCloudinary, { UPLOAD_FOLDER } from '../config/cloudinary.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

// POST /upload — subida a través de la API (limitada a ~4,5 MB en Vercel). Se conserva por compatibilidad.
router.post('/', protect, adminOnly, upload.single('image'), uploadImage)

// GET /upload/signature — admin: firma para subir directamente del navegador a Cloudinary
// (sin pasar por Vercel, así no aplica su límite de 4,5 MB; necesario para videos)
router.get('/signature', protect, adminOnly, (_req, res) => {
  const cloudinary = getCloudinary()
  const timestamp = Math.round(Date.now() / 1000)
  const params = { folder: UPLOAD_FOLDER, timestamp }
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)
  res.json({
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  })
})

export default router

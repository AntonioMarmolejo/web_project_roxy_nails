import { Router } from 'express'
import GalleryImage from '../models/GalleryImage.js'
import getCloudinary, { destroyImages, parseCloudinaryUrl, VIDEO_LIMITS } from '../config/cloudinary.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

// GET /gallery — público: solo activas
router.get('/', async (_req, res, next) => {
  try {
    const images = await GalleryImage.find({ active: true }).sort('-createdAt')
    res.json(images)
  } catch (err) { next(err) }
})

// GET /gallery/all — admin: todas (incluye inactivas)
router.get('/all', protect, adminOnly, async (_req, res, next) => {
  try {
    const images = await GalleryImage.find({}).sort('-createdAt')
    res.json(images)
  } catch (err) { next(err) }
})

// Valida el medio. Para videos comprueba en Cloudinary que existan y cumplan los límites;
// si no los cumplen, los borra para no dejar archivos huérfanos. Devuelve { error } o { duration }.
const checkMedia = async ({ image, mediaType }) => {
  if (mediaType !== 'video') return {}
  const parsed = parseCloudinaryUrl(image)
  if (!parsed || parsed.resourceType !== 'video') return { error: 'El video debe subirse desde el formulario del panel.' }
  let info
  // media_metadata: sin esta opción Cloudinary no devuelve la duración
  try { info = await getCloudinary().api.resource(parsed.publicId, { resource_type: 'video', media_metadata: true }) }
  catch { return { error: 'No se encontró el video en Cloudinary.' } }
  // Algunos WebM no traen duración: entonces solo se aplica el límite de peso
  const hasDuration = Number.isFinite(info.duration)
  const tooLong = hasDuration && info.duration > VIDEO_LIMITS.maxSeconds + 0.5
  const tooBig = info.bytes > VIDEO_LIMITS.maxBytes
  if (tooLong || tooBig) {
    await destroyImages(image)
    return { error: tooLong ? `El video dura ${Math.round(info.duration)} s; el máximo es ${VIDEO_LIMITS.maxSeconds} s.` : 'El video supera los 50 MB.' }
  }
  return { duration: hasDuration ? Math.round(info.duration) : null }
}

const pick = (body) => {
  const data = {}
  for (const f of ['image', 'category', 'mediaType', 'active']) if (f in body) data[f] = body[f]
  return data
}

// POST /gallery — admin: crear (foto o video)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const data = pick(req.body)
    const { error, duration } = await checkMedia(data)
    if (error) return res.status(400).json({ message: error })
    if (duration !== undefined) data.duration = duration
    const image = await GalleryImage.create(data)
    res.status(201).json(image)
  } catch (err) { next(err) }
})

// PUT /gallery/:id — admin: editar
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const data = pick(req.body)
    if ('image' in data || 'mediaType' in data) {
      const current = await GalleryImage.findById(req.params.id)
      if (!current) return res.status(404).json({ message: 'Imagen no encontrada.' })
      const merged = { image: data.image ?? current.image, mediaType: data.mediaType ?? current.mediaType }
      if (merged.image !== current.image || merged.mediaType !== current.mediaType) {
        const { error, duration } = await checkMedia(merged)
        if (error) return res.status(400).json({ message: error })
        data.duration = duration ?? null
      }
    }
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    if (!image) return res.status(404).json({ message: 'Imagen no encontrada.' })
    res.json(image)
  } catch (err) { next(err) }
})

// DELETE /gallery/:id — admin: toggle active (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const image = await GalleryImage.findById(req.params.id)
    if (!image) return res.status(404).json({ message: 'Imagen no encontrada.' })
    image.active = !image.active
    await image.save()
    res.json(image)
  } catch (err) { next(err) }
})

// DELETE /gallery/:id/permanent — admin: borrado definitivo (BD + Cloudinary)
router.delete('/:id/permanent', protect, adminOnly, async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id)
    if (!image) return res.status(404).json({ message: 'Imagen no encontrada.' })
    await destroyImages(image.image)
    res.json({ message: image.mediaType === 'video' ? 'Video eliminado.' : 'Imagen eliminada.' })
  } catch (err) { next(err) }
})

// PATCH /gallery/:id/like — público: sumar/restar like
router.patch('/:id/like', async (req, res, next) => {
  try {
    const image = await GalleryImage.findById(req.params.id)
    if (!image) return res.status(404).json({ message: 'Imagen no encontrada.' })
    const delta = req.body?.delta === -1 ? -1 : 1
    image.likes = Math.max(0, image.likes + delta)
    await image.save()
    res.json(image)
  } catch (err) { next(err) }
})

export default router

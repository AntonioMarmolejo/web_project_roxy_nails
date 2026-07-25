import { Router } from 'express'
import GalleryImage from '../models/GalleryImage.js'
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

// POST /gallery — admin: crear
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const image = await GalleryImage.create(req.body)
    res.status(201).json(image)
  } catch (err) { next(err) }
})

// PUT /gallery/:id — admin: editar
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
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

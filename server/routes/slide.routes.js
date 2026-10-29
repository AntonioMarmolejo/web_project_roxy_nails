import { Router } from 'express'
import mongoose from 'mongoose'
import HeroSlide from '../models/HeroSlide.js'
import Service from '../models/Service.js'
import Product from '../models/Product.js'
import Workshop from '../models/Workshop.js'
import GalleryImage from '../models/GalleryImage.js'
import { destroyImages } from '../config/cloudinary.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()
const FIELDS = ['tag', 'title', 'highlight', 'subtitle', 'image',
  'primaryLabel', 'primaryLink', 'secondaryLabel', 'secondaryLink', 'active']
const SORT = { order: 1, createdAt: 1 }

const pick = (body) => {
  const data = {}
  for (const f of FIELDS) if (f in body) data[f] = body[f]
  return data
}

// Errores de validación del modelo → 400 con el primer mensaje
const handle = (fn) => async (req, res, next) => {
  try { await fn(req, res) }
  catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message })
    next(err)
  }
}

// Borra la imagen de Cloudinary solo si nada más del sitio la usa
// (en el admin se puede pegar la URL de una foto que ya está en un servicio o en la galería)
async function destroyIfUnused(url, slideId) {
  if (!url) return
  const [slide, service, product, workshop, gallery] = await Promise.all([
    HeroSlide.exists({ image: url, _id: { $ne: slideId } }),
    Service.exists({ image: url }),
    Product.exists({ images: url }),
    Workshop.exists({ image: url }),
    GalleryImage.exists({ image: url }),
  ])
  if (!(slide || service || product || workshop || gallery)) await destroyImages(url)
}

const findSlide = async (req, res) => {
  const slide = mongoose.isValidObjectId(req.params.id) && await HeroSlide.findById(req.params.id)
  if (!slide) res.status(404).json({ message: 'Diapositiva no encontrada' })
  return slide
}

// GET /slides — público: diapositivas activas en orden
router.get('/', handle(async (_req, res) => {
  res.json(await HeroSlide.find({ active: true }).sort(SORT))
}))

// GET /slides/all — admin: todas, incluidas las desactivadas
router.get('/all', protect, adminOnly, handle(async (_req, res) => {
  res.json(await HeroSlide.find().sort(SORT))
}))

// POST /slides — admin: nueva diapositiva (va al final)
router.post('/', protect, adminOnly, handle(async (req, res) => {
  const last = await HeroSlide.findOne().sort({ order: -1 })
  const slide = await HeroSlide.create({ ...pick(req.body), order: (last?.order ?? -1) + 1 })
  res.status(201).json(slide)
}))

// PUT /slides/order — admin: nuevo orden { ids: [...] }
router.put('/order', protect, adminOnly, handle(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : []
  if (!ids.length || !ids.every(id => mongoose.isValidObjectId(id))) {
    return res.status(400).json({ message: 'Orden no válido' })
  }
  await HeroSlide.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })))
  res.json(await HeroSlide.find().sort(SORT))
}))

// PUT /slides/:id — admin: editar (si cambia la imagen, la anterior se borra de Cloudinary si nada más la usa)
router.put('/:id', protect, adminOnly, handle(async (req, res) => {
  const slide = await findSlide(req, res)
  if (!slide) return
  const oldImage = slide.image
  slide.set(pick(req.body))
  await slide.save()
  if (slide.image !== oldImage) await destroyIfUnused(oldImage, slide._id)
  res.json(slide)
}))

// PATCH /slides/:id/toggle — admin: activar / desactivar
router.patch('/:id/toggle', protect, adminOnly, handle(async (req, res) => {
  const slide = await findSlide(req, res)
  if (!slide) return
  slide.active = !slide.active
  await slide.save()
  res.json(slide)
}))

// DELETE /slides/:id — admin: eliminar definitivamente (su imagen se borra de Cloudinary si nada más la usa)
router.delete('/:id', protect, adminOnly, handle(async (req, res) => {
  const slide = await findSlide(req, res)
  if (!slide) return
  await slide.deleteOne()
  await destroyIfUnused(slide.image, slide._id)
  res.json({ message: 'Diapositiva eliminada.' })
}))

export default router

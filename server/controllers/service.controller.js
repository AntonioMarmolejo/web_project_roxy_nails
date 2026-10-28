import Service, { SERVICE_CATEGORIES } from '../models/Service.js'
import Booking from '../models/Booking.js'
import { destroyImages } from '../config/cloudinary.js'

// Normaliza y valida precio/duración (vacío → null) y categoría. Devuelve un mensaje de error o null.
const sanitize = (body, { isNew }) => {
  for (const field of ['price', 'duration']) {
    if (!(field in body)) continue
    const v = body[field]
    if (v === '' || v === null || v === undefined) { body[field] = null; continue }
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0) return `${field === 'price' ? 'El precio' : 'La duración'} debe ser un número mayor o igual a 0`
    body[field] = n
  }
  if (isNew && !body.category) return 'La categoría es obligatoria'
  if ('category' in body && !SERVICE_CATEGORIES.includes(body.category)) {
    return `Categoría no válida. Usa: ${SERVICE_CATEGORIES.join(', ')}`
  }
  return null
}

export const getServices = async (_req, res, next) => {
  try {
    const services = await Service.find({ active: true })
    res.json(services)
  } catch (err) { next(err) }
}

// GET /services/all — admin: incluye los ocultos
export const getAllServices = async (_req, res, next) => {
  try {
    const services = await Service.find({}).sort({ active: -1, category: 1, name: 1 })
    res.json(services)
  } catch (err) { next(err) }
}

export const createService = async (req, res, next) => {
  try {
    const error = sanitize(req.body, { isNew: true })
    if (error) return res.status(400).json({ message: error })
    const service = await Service.create(req.body)
    res.status(201).json(service)
  } catch (err) { next(err) }
}

export const updateService = async (req, res, next) => {
  try {
    // Al editar un servicio antiguo sin tocar su categoría, se conserva la que tenía
    if ('category' in req.body) {
      const current = await Service.findById(req.params.id).select('category')
      if (current && current.category === req.body.category) delete req.body.category
    }
    const error = sanitize(req.body, { isNew: false })
    if (error) return res.status(400).json({ message: error })
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' })
    res.json(service)
  } catch (err) { next(err) }
}

export const deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { active: false })
    res.json({ message: 'Servicio desactivado' })
  } catch (err) { next(err) }
}

// Borrado definitivo: se bloquea si hay citas por atender, porque las reservas no guardan copia del servicio
export const deleteServicePermanent = async (req, res, next) => {
  try {
    const pending = await Booking.countDocuments({ service: req.params.id, status: { $in: ['pending', 'confirmed'] } })
    if (pending) {
      return res.status(409).json({ message: `Este servicio tiene ${pending} cita(s) pendiente(s) o confirmada(s). Atiéndelas o cancélalas antes de eliminarlo, o desactívalo.` })
    }
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' })
    await destroyImages(service.image)
    res.json({ message: 'Servicio eliminado' })
  } catch (err) { next(err) }
}

import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import { destroyImages } from '../config/cloudinary.js'

export const getServices = async (_req, res, next) => {
  try {
    const services = await Service.find({ active: true })
    res.json(services)
  } catch (err) { next(err) }
}

export const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body)
    res.status(201).json(service)
  } catch (err) { next(err) }
}

export const updateService = async (req, res, next) => {
  try {
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

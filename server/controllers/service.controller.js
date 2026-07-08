import Service from '../models/Service.js'

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

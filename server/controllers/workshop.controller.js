import Workshop from '../models/Workshop.js'
import WorkshopEnrollment from '../models/WorkshopEnrollment.js'

// Adjunta spotsLeft a cada taller contando inscripciones activas (no canceladas)
const withSpotsLeft = async (workshops) => {
    const ids = workshops.map(w => w._id)
    const counts = await WorkshopEnrollment.aggregate([
        { $match: { workshop: { $in: ids }, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$workshop', count: { $sum: 1 } } },
    ])
    const byId = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))
    return workshops.map(w => ({
        ...w.toObject(),
        spotsLeft: w.spots - (byId[w._id.toString()] || 0),
    }))
}

// GET /workshops — público: activos y próximos
export const getWorkshops = async (_req, res, next) => {
    try {
        const workshops = await Workshop.find({ active: true, date: { $gte: new Date() } }).sort('date')
        res.json(await withSpotsLeft(workshops))
    } catch (err) { next(err) }
}

// GET /workshops/all — admin: todos
export const getAllWorkshops = async (_req, res, next) => {
    try {
        const workshops = await Workshop.find({}).sort('date')
        res.json(await withSpotsLeft(workshops))
    } catch (err) { next(err) }
}

// GET /workshops/:id — detalle público (para checkout)
export const getWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
        if (!workshop || !workshop.active) return res.status(404).json({ message: 'Taller no encontrado' })
        const [withSpots] = await withSpotsLeft([workshop])
        res.json(withSpots)
    } catch (err) { next(err) }
}

// POST /workshops — admin: crear
export const createWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.create(req.body)
        res.status(201).json(workshop)
    } catch (err) { next(err) }
}

// PUT /workshops/:id — admin: editar
export const updateWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!workshop) return res.status(404).json({ message: 'Taller no encontrado' })
        res.json(workshop)
    } catch (err) { next(err) }
}

// DELETE /workshops/:id — admin: toggle active (soft delete)
export const toggleWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
        if (!workshop) return res.status(404).json({ message: 'Taller no encontrado' })
        workshop.active = !workshop.active
        await workshop.save()
        res.json(workshop)
    } catch (err) { next(err) }
}

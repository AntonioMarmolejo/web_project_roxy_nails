import WorkshopEnrollment from '../models/WorkshopEnrollment.js'
import Workshop from '../models/Workshop.js'

// POST /enrollments — inscribirse a un taller (guest OK)
export const createEnrollment = async (req, res, next) => {
    try {
        const { workshop: workshopId, client, notes, paymentMethod } = req.body

        const workshop = await Workshop.findById(workshopId)
        if (!workshop || !workshop.active)
            return res.status(400).json({ message: 'Taller no disponible.' })
        if (workshop.date < new Date())
            return res.status(400).json({ message: 'Este taller ya no admite inscripciones.' })

        const enrolledCount = await WorkshopEnrollment.countDocuments({
            workshop: workshop._id,
            status: { $ne: 'cancelled' },
        })
        if (enrolledCount >= workshop.spots)
            return res.status(400).json({ message: 'No quedan cupos disponibles.' })

        const enrollment = await WorkshopEnrollment.create({
            workshop: workshop._id,
            title: workshop.title,
            date: workshop.date,
            price: workshop.price,
            client,
            notes,
            paymentMethod: paymentMethod || 'cod',
            createdBy: req.user?._id,
        })

        res.status(201).json(enrollment)
    } catch (err) { next(err) }
}

// GET /enrollments/my — inscripciones del usuario logueado
export const getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await WorkshopEnrollment.find({ createdBy: req.user._id }).sort('-createdAt')
        res.json(enrollments)
    } catch (err) { next(err) }
}

// GET /enrollments — admin: todas
export const getAllEnrollments = async (req, res, next) => {
    try {
        const filter = {}
        if (req.query.status) filter.status = req.query.status
        const enrollments = await WorkshopEnrollment.find(filter).sort('-createdAt')
        res.json(enrollments)
    } catch (err) { next(err) }
}

// PATCH /enrollments/:id — admin actualiza status
export const updateEnrollmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const enrollment = await WorkshopEnrollment.findByIdAndUpdate(req.params.id, { status }, { new: true })
        if (!enrollment) return res.status(404).json({ message: 'Inscripción no encontrada.' })
        res.json(enrollment)
    } catch (err) { next(err) }
}

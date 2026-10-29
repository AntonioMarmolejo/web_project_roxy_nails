import mongoose from 'mongoose'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import { BOOKING_SLOTS, BOOKING_CAPACITY, BOOKING_TIMEZONE } from '../config/booking.js'
import { sendBookingConfirmation, mailEnabled } from '../utils/mailer.js'

export const getBookings = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    const bookings = await Booking.find(filter)
      .populate('service', 'name duration price')
      .sort('-createdAt')
    res.json(bookings)
  } catch (err) { next(err) }
}

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ createdBy: req.user._id })
      .populate('service', 'name duration price')
      .sort('-date')
    res.json(bookings)
  } catch (err) { next(err) }
}

// ─── Disponibilidad ──────────────────────────────────────────────

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed']
const SLOT_TAKEN = 'Esa hora acaba de ser reservada por otra persona. Por favor elige otra.'

// Fecha "AAAA-MM-DD" válida, o null. Las citas se guardan a las 00:00 UTC de ese día.
function parseDay(value) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCMonth() === +m[2] - 1 ? d.toISOString().slice(0, 10) : null
}

const dayFilter = (day) => {
  const start = new Date(`${day}T00:00:00.000Z`)
  return { $gte: start, $lt: new Date(start.getTime() + 864e5) }
}

const todayAtShop = () => new Date().toLocaleDateString('en-CA', { timeZone: BOOKING_TIMEZONE })

// Citas no canceladas en esa fecha y hora (sin contar la indicada)
const countTaken = (day, timeSlot, exceptId) => Booking.countDocuments({
  date: dayFilter(day), timeSlot, status: { $ne: 'cancelled' },
  ...(exceptId && { _id: { $ne: exceptId } }),
})

// Intenta ocupar un lugar libre de esa hora. write(slotKey) guarda la cita con ese lugar;
// si otra cita lo tomó a la vez, el índice único lo rechaza y se prueba el siguiente.
// Devuelve lo que devuelva write, o null si la hora está llena.
async function takeSeat(day, timeSlot, exceptId, write) {
  if (await countTaken(day, timeSlot, exceptId) >= BOOKING_CAPACITY) return null
  await Booking.init()   // asegura que el índice único exista antes de confiar en él
  for (let seat = 1; seat <= BOOKING_CAPACITY; seat++) {
    try { return await write(`${day}|${timeSlot}|${seat}`) }
    catch (err) { if (err.code !== 11000) throw err }
  }
  return null
}

export const getAvailableSlots = async (req, res, next) => {
  try {
    const day = parseDay(req.query.date)
    if (!day) return res.status(400).json({ message: 'Fecha no válida' })

    const taken = await Booking.find({ date: dayFilter(day), status: { $ne: 'cancelled' } }).select('timeSlot')
    const count = {}
    taken.forEach(b => { count[b.timeSlot] = (count[b.timeSlot] || 0) + 1 })
    const isFull = (s) => (count[s] || 0) >= BOOKING_CAPACITY

    res.json({
      date: day,
      available: BOOKING_SLOTS.filter(s => !isFull(s)),
      booked:    BOOKING_SLOTS.filter(isFull),
    })
  } catch (err) { next(err) }
}

export const createBooking = async (req, res, next) => {
  try {
    const { client, service, timeSlot, notes } = req.body
    const day = parseDay(req.body.date)

    if (!day) return res.status(400).json({ message: 'Fecha no válida' })
    if (day < todayAtShop()) return res.status(400).json({ message: 'No se puede reservar en una fecha pasada' })
    if (new Date(`${day}T00:00:00Z`).getUTCDay() === 0) return res.status(400).json({ message: 'No atendemos los domingos' })
    if (!BOOKING_SLOTS.includes(timeSlot)) return res.status(400).json({ message: 'Horario no válido' })
    if (!mongoose.isValidObjectId(service) || !(await Service.exists({ _id: service, active: true }))) {
      return res.status(400).json({ message: 'El servicio elegido no está disponible' })
    }

    const booking = await takeSeat(day, timeSlot, null, (slotKey) => Booking.create({
      client, service, timeSlot, notes, slotKey,
      date: new Date(`${day}T00:00:00Z`),
      ...(req.user && { createdBy: req.user._id }),
    }))
    if (!booking) return res.status(409).json({ message: SLOT_TAKEN })

    await booking.populate('service', 'name price')

    if (booking.client.email && mailEnabled()) {
      sendBookingConfirmation({
        to:          booking.client.email,
        name:        booking.client.name,
        serviceName: booking.service.name,
        date:        booking.date,
        timeSlot:    booking.timeSlot,
      }).catch(err => console.warn('Email no enviado:', err.message))
    }

    const { slotKey, ...json } = booking.toObject()
    res.status(201).json(json)
  } catch (err) { next(err) }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Estado no válido' })

    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Cita no encontrada' })

    if (status === 'cancelled') {
      // Libera el lugar para que otra persona pueda reservar esa hora
      await Booking.updateOne({ _id: booking._id }, { $set: { status }, $unset: { slotKey: 1 } })
    } else if (booking.status === 'cancelled') {
      // Reactivar una cita cancelada: solo si su hora sigue teniendo lugar
      const day = booking.date.toISOString().slice(0, 10)
      const ok = await takeSeat(day, booking.timeSlot, booking._id,
        (slotKey) => Booking.updateOne({ _id: booking._id }, { $set: { status, slotKey } }))
      if (!ok) return res.status(409).json({ message: 'Esa hora ya está ocupada por otra cita. No se puede reactivar.' })
    } else {
      await Booking.updateOne({ _id: booking._id }, { $set: { status } })
    }

    res.json(await Booking.findById(booking._id).populate('service', 'name duration price'))
  } catch (err) { next(err) }
}

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, createdBy: req.user._id })
    if (!booking) return res.status(404).json({ message: 'Cita no encontrada' })
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'No se puede cancelar esta cita' })
    }
    booking.status = 'cancelled'
    booking.slotKey = undefined   // libera el lugar
    await booking.save()
    res.json(booking)
  } catch (err) { next(err) }
}

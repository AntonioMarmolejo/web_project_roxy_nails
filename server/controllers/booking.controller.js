import mongoose from 'mongoose'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import { BOOKING_SLOTS, BOOKING_CAPACITY, BOOKING_TIMEZONE, coveredSlots } from '../config/booking.js'
import { sendBookingReceived, sendBookingConfirmed, mailEnabled } from '../utils/mailer.js'

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
const MAIL_TIMEOUT_MS = 8000

// Envía un correo de la cita y espera el resultado (en Vercel, un envío "en segundo plano" puede
// quedarse sin salir al terminar la función). Destinatario: el correo del formulario o, si no lo
// puso, el de su cuenta. Devuelve true si se envió; un fallo solo se registra.
async function emailBooking(send, booking) {
  const to = booking.client?.email || booking.createdBy?.email
  if (!to || !mailEnabled()) return false
  try {
    await Promise.race([
      send({ to, name: booking.client.name, serviceName: booking.service?.name, date: booking.date, timeSlot: booking.timeSlot }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('tiempo de espera agotado')), MAIL_TIMEOUT_MS)),
    ])
    return true
  } catch (err) {
    console.warn('Email no enviado:', err.message)
    return false
  }
}
const PAYMENT_METHODS = ['local', 'qr_deuna', 'qr_bdp', 'transfer']
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

// Cuántas citas no canceladas ocupan cada hora de ese día (sin contar la indicada).
// Las citas anteriores a este cambio no tienen slotKeys: se calculan con la duración de su servicio.
async function occupancy(day, exceptId) {
  const bookings = await Booking.find({
    date: dayFilter(day), status: { $ne: 'cancelled' },
    ...(exceptId && { _id: { $ne: exceptId } }),
  }).select('timeSlot slotKeys service').populate('service', 'duration')

  const count = {}
  for (const b of bookings) {
    const hours = b.slotKeys?.length
      ? b.slotKeys.map(k => k.split('|')[1])
      : coveredSlots(b.timeSlot, b.service?.duration) || [b.timeSlot]
    hours.forEach(h => { count[h] = (count[h] || 0) + 1 })
  }
  return count
}

const fits = (count, hours) => hours.every(h => (count[h] || 0) < BOOKING_CAPACITY)

// Intenta ocupar las horas indicadas con una misma trabajadora. write(slotKeys) guarda la cita;
// si otra cita tomó alguna de esas horas a la vez, el índice único lo rechaza y se prueba
// con la siguiente. Devuelve lo que devuelva write, o null si no hay lugar.
async function takeSeat(day, hours, exceptId, write) {
  if (!fits(await occupancy(day, exceptId), hours)) return null
  await Booking.init()   // asegura que el índice único exista antes de confiar en él
  for (let seat = 1; seat <= BOOKING_CAPACITY; seat++) {
    try { return await write(hours.map(h => `${day}|${h}|${seat}`)) }
    catch (err) { if (err.code !== 11000) throw err }
  }
  return null
}

// GET /bookings/slots?date=AAAA-MM-DD&service=<id> — horas en las que puede empezar ese servicio
export const getAvailableSlots = async (req, res, next) => {
  try {
    const day = parseDay(req.query.date)
    if (!day) return res.status(400).json({ message: 'Fecha no válida' })

    const svc = mongoose.isValidObjectId(req.query.service)
      ? await Service.findById(req.query.service).select('duration')
      : null
    const count = await occupancy(day)
    const canStart = (s) => {
      const hours = coveredSlots(s, svc?.duration)
      return Boolean(hours) && fits(count, hours)
    }

    res.json({
      date: day,
      available: BOOKING_SLOTS.filter(canStart),
      booked:    BOOKING_SLOTS.filter(s => !canStart(s)),
    })
  } catch (err) { next(err) }
}

export const createBooking = async (req, res, next) => {
  try {
    const { client, service, timeSlot, notes, paymentMethod = 'local' } = req.body
    const day = parseDay(req.body.date)

    if (!day) return res.status(400).json({ message: 'Fecha no válida' })
    if (day < todayAtShop()) return res.status(400).json({ message: 'No se puede reservar en una fecha pasada' })
    if (new Date(`${day}T00:00:00Z`).getUTCDay() === 0) return res.status(400).json({ message: 'No atendemos los domingos' })
    if (!BOOKING_SLOTS.includes(timeSlot)) return res.status(400).json({ message: 'Horario no válido' })
    if (!PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ message: 'Método de pago no válido' })
    const svc = mongoose.isValidObjectId(service) && await Service.findOne({ _id: service, active: true }).select('duration price')
    if (!svc) return res.status(400).json({ message: 'El servicio elegido no está disponible' })
    // Sin precio fijo no se sabe cuánto pagar: se paga en el local
    if (paymentMethod !== 'local' && svc.price == null) {
      return res.status(400).json({ message: 'Este servicio no tiene precio fijo: el pago se hace en el local' })
    }

    const hours = coveredSlots(timeSlot, svc.duration)
    if (!hours) {
      return res.status(400).json({ message: 'Este servicio no alcanza a terminar antes del almuerzo o del cierre. Elige una hora más temprana.' })
    }

    const booking = await takeSeat(day, hours, null, (slotKeys) => Booking.create({
      client, service, timeSlot, notes, paymentMethod, slotKeys,
      date: new Date(`${day}T00:00:00Z`),
      ...(req.user && { createdBy: req.user._id }),
    }))
    if (!booking) return res.status(409).json({ message: SLOT_TAKEN })

    await booking.populate([{ path: 'service', select: 'name price' }, { path: 'createdBy', select: 'email' }])
    const emailSent = await emailBooking(sendBookingReceived, booking)

    const { slotKeys, ...json } = booking.toObject()
    res.status(201).json({ ...json, createdBy: booking.createdBy?._id, emailSent })
  } catch (err) { next(err) }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Estado no válido' })

    const booking = await Booking.findById(req.params.id).populate('service', 'duration')
    if (!booking) return res.status(404).json({ message: 'Cita no encontrada' })

    if (status === 'cancelled') {
      // Libera sus horas para que otra persona pueda reservarlas
      await Booking.updateOne({ _id: booking._id }, { $set: { status }, $unset: { slotKeys: 1 } })
    } else if (booking.status === 'cancelled') {
      // Reactivar una cita cancelada: solo si sus horas siguen libres
      const day = booking.date.toISOString().slice(0, 10)
      const hours = coveredSlots(booking.timeSlot, booking.service?.duration) || [booking.timeSlot]
      const ok = await takeSeat(day, hours, booking._id,
        (slotKeys) => Booking.updateOne({ _id: booking._id }, { $set: { status, slotKeys } }))
      if (!ok) return res.status(409).json({ message: 'Esa hora ya está ocupada por otra cita. No se puede reactivar.' })
    } else {
      await Booking.updateOne({ _id: booking._id }, { $set: { status } })
    }

    const updated = await Booking.findById(booking._id).populate('service', 'name duration price')

    // Al confirmarla, avisar al cliente por correo (el aviso por WhatsApp lo envía el local desde el panel)
    let emailSent = false
    if (status === 'confirmed' && booking.status !== 'confirmed') {
      await updated.populate('createdBy', 'email')
      emailSent = await emailBooking(sendBookingConfirmed, updated)
      updated.depopulate('createdBy')
    }

    res.json({ ...updated.toObject(), emailSent })
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
    booking.slotKeys = undefined   // libera sus horas
    await booking.save()
    res.json(booking)
  } catch (err) { next(err) }
}

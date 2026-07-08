import Booking from '../models/Booking.js'
import { sendBookingConfirmation } from '../utils/mailer.js'

const mailEnabled = () =>
  process.env.MAIL_USER && !process.env.MAIL_USER.includes('tu_correo')

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

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query
    const start = new Date(date); start.setHours(0, 0, 0, 0)
    const end   = new Date(date); end.setHours(23, 59, 59, 999)

    const booked = await Booking.find({
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    }).select('timeSlot')

    const allSlots    = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00']
    const bookedSlots = booked.map(b => b.timeSlot)

    res.json({ date, available: allSlots.filter(s => !bookedSlots.includes(s)), booked: bookedSlots })
  } catch (err) { next(err) }
}

export const createBooking = async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (req.user) body.createdBy = req.user._id

    const booking = await Booking.create(body)
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

    res.status(201).json(booking)
  } catch (err) { next(err) }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('service', 'name duration price')
    if (!booking) return res.status(404).json({ message: 'Cita no encontrada' })
    res.json(booking)
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
    await booking.save()
    res.json(booking)
  } catch (err) { next(err) }
}

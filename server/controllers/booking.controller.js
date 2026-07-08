import Booking from '../models/Booking.js'

export const getBookings = async (_req, res, next) => {
  try {
    const bookings = await Booking.find().populate('service', 'name duration price').sort('-createdAt')
    res.json(bookings)
  } catch (err) { next(err) }
}

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const booked = await Booking.find({
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).select('timeSlot')

    const allSlots = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00']
    const bookedSlots = booked.map(b => b.timeSlot)
    const available = allSlots.filter(s => !bookedSlots.includes(s))

    res.json({ date, available, booked: bookedSlots })
  } catch (err) { next(err) }
}

export const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body)
    await booking.populate('service', 'name price')
    res.status(201).json(booking)
  } catch (err) { next(err) }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!booking) return res.status(404).json({ message: 'Cita no encontrada' })
    res.json(booking)
  } catch (err) { next(err) }
}

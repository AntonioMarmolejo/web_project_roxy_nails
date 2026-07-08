import { Router } from 'express'
import { getBookings, getAvailableSlots, createBooking, updateBookingStatus } from '../controllers/booking.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/slots',    getAvailableSlots)       // público — ver disponibilidad
router.post('/',        createBooking)            // público — agendar cita
router.get('/',         protect, adminOnly, getBookings)
router.patch('/:id',    protect, adminOnly, updateBookingStatus)

export default router

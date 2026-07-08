import { Router } from 'express'
import {
  getBookings, getMyBookings,
  getAvailableSlots, createBooking,
  updateBookingStatus, cancelBooking,
} from '../controllers/booking.controller.js'
import { protect, adminOnly, optionalProtect } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/slots',         getAvailableSlots)
router.get('/my',            protect, getMyBookings)
router.post('/',             optionalProtect, createBooking)
router.get('/',              protect, adminOnly, getBookings)
router.patch('/:id/cancel',  protect, cancelBooking)
router.patch('/:id',         protect, adminOnly, updateBookingStatus)

export default router

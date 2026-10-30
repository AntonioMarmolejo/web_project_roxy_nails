import { Router } from 'express'
import {
  getBookings, getMyBookings,
  getAvailableSlots, createBooking,
  updateBookingStatus, cancelBooking,
  getBookingByCode, getTodayQueue, getPublicQueue, markArrived, callBooking,
} from '../controllers/booking.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/slots',         getAvailableSlots)
router.get('/my',            protect, getMyBookings)
router.get('/queue/public',  getPublicQueue)                    // pantalla de turnos del local
router.get('/queue',         protect, adminOnly, getTodayQueue)
router.get('/code/:code',    protect, adminOnly, getBookingByCode)
router.post('/',             protect, createBooking)          // exige cuenta
router.get('/',              protect, adminOnly, getBookings)
router.patch('/:id/cancel',  protect, cancelBooking)
router.patch('/:id/arrive',  protect, adminOnly, markArrived)
router.patch('/:id/call',    protect, adminOnly, callBooking)
router.patch('/:id',         protect, adminOnly, updateBookingStatus)

export default router

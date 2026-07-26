import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  register, login, getMe,
  updateProfile, changePassword,
  forgotPassword, resetPassword,
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// Límite de intentos para rutas sensibles a fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register',        authLimiter, register)
router.post('/login',           authLimiter, login)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', authLimiter, resetPassword)
router.get('/me',               protect, getMe)
router.put('/profile',          protect, updateProfile)
router.put('/change-password',  protect, changePassword)

export default router

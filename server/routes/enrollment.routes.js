import { Router } from 'express'
import { protect, adminOnly, optionalProtect } from '../middleware/auth.middleware.js'
import {
    createEnrollment,
    getMyEnrollments,
    getAllEnrollments,
    updateEnrollmentStatus,
} from '../controllers/enrollment.controller.js'

const router = Router()

router.post('/', optionalProtect, createEnrollment)          // inscribirse (guest OK)
router.get('/my', protect, getMyEnrollments)                 // historial del usuario
router.get('/', protect, adminOnly, getAllEnrollments)        // admin: todas las inscripciones
router.patch('/:id', protect, adminOnly, updateEnrollmentStatus) // admin: cambiar status

export default router

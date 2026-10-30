import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import {
    createEnrollment,
    getMyEnrollments,
    getAllEnrollments,
    updateEnrollmentStatus,
} from '../controllers/enrollment.controller.js'

const router = Router()

router.post('/', protect, createEnrollment)                 // inscribirse (exige cuenta)
router.get('/my', protect, getMyEnrollments)                 // historial del usuario
router.get('/', protect, adminOnly, getAllEnrollments)        // admin: todas las inscripciones
router.patch('/:id', protect, adminOnly, updateEnrollmentStatus) // admin: cambiar status

export default router

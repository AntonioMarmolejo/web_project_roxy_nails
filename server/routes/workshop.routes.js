import { Router } from 'express'
import {
    getWorkshops, getAllWorkshops, getWorkshop,
    createWorkshop, updateWorkshop, toggleWorkshop,
} from '../controllers/workshop.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/all',    protect, adminOnly, getAllWorkshops) // admin: todos (incluye inactivos)
router.get('/',       getWorkshops)                        // público: activos y próximos
router.get('/:id',    getWorkshop)                          // público: detalle
router.post('/',      protect, adminOnly, createWorkshop)
router.put('/:id',    protect, adminOnly, updateWorkshop)
router.delete('/:id', protect, adminOnly, toggleWorkshop)

export default router

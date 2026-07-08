import { Router } from 'express'
import { getServices, createService, updateService, deleteService } from '../controllers/service.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/',         getServices)
router.post('/',        protect, adminOnly, createService)
router.put('/:id',      protect, adminOnly, updateService)
router.delete('/:id',   protect, adminOnly, deleteService)

export default router

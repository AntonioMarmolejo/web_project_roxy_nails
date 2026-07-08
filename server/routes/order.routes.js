import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { optionalProtect }   from '../middleware/auth.middleware.js'
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js'

const router = Router()

router.post('/',     optionalProtect, createOrder)        // crear pedido (guest OK)
router.get('/my',    protect, getMyOrders)                // historial del usuario
router.get('/',      protect, adminOnly, getAllOrders)     // admin: todos los pedidos
router.patch('/:id', protect, adminOnly, updateOrderStatus) // admin: cambiar status

export default router

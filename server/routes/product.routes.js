import { Router } from 'express'
import Product from '../models/Product.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find({ active: true })
    res.json(products)
  } catch (err) { next(err) }
})

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) { next(err) }
})

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(product)
  } catch (err) { next(err) }
})

export default router

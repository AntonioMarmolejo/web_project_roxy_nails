import { Router } from 'express'
import Product from '../models/Product.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

// GET /products — público: solo activos
router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find({ active: true }).sort('-createdAt')
    res.json(products)
  } catch (err) { next(err) }
})

// GET /products/all — admin: todos (incluye inactivos)
router.get('/all', protect, adminOnly, async (_req, res, next) => {
  try {
    const products = await Product.find({}).sort('-createdAt')
    res.json(products)
  } catch (err) { next(err) }
})

// POST /products — admin: crear
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) { next(err) }
})

// PUT /products/:id — admin: editar
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' })
    res.json(product)
  } catch (err) { next(err) }
})

// DELETE /products/:id — admin: toggle active (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' })
    product.active = !product.active
    await product.save()
    res.json(product)
  } catch (err) { next(err) }
})

export default router

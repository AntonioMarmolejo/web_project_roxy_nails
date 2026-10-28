import { Router } from 'express'
import Banner from '../models/Banner.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()
const FIELDS = ['active', 'emoji', 'highlight', 'message', 'linkText', 'linkTo', 'startsAt', 'endsAt']

const getOrDefault = async () => (await Banner.findOne({ key: 'home' })) || new Banner({ key: 'home' })

// GET /banner — público: el banner solo si debe mostrarse ahora (activo y dentro de fechas)
router.get('/', async (_req, res, next) => {
  try {
    const banner = await getOrDefault()
    if (!banner.isVisible()) return res.json({ visible: false })
    const { emoji, highlight, message, linkText, linkTo } = banner
    res.json({ visible: true, emoji, highlight, message, linkText, linkTo })
  } catch (err) { next(err) }
})

// GET /banner/admin — admin: configuración completa
router.get('/admin', protect, adminOnly, async (_req, res, next) => {
  try {
    const banner = await getOrDefault()
    res.json({ ...banner.toObject(), visibleNow: banner.isVisible() })
  } catch (err) { next(err) }
})

// PUT /banner — admin: guardar configuración
router.put('/', protect, adminOnly, async (req, res, next) => {
  try {
    const data = {}
    for (const f of FIELDS) if (f in req.body) data[f] = req.body[f]
    for (const f of ['startsAt', 'endsAt']) {
      if (!(f in data)) continue
      if (data[f] === '' || data[f] === null) { data[f] = null; continue }
      const d = new Date(data[f])
      if (isNaN(d)) return res.status(400).json({ message: 'Fecha no válida' })
      data[f] = d
    }
    if (data.startsAt && data.endsAt && data.startsAt > data.endsAt) {
      return res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la de fin' })
    }
    if (data.linkTo && !/^(\/|https:\/\/)/.test(data.linkTo)) {
      return res.status(400).json({ message: 'El enlace debe ser una ruta del sitio (/agendar) o una URL que empiece por https://' })
    }
    const current = await getOrDefault()
    const willBeActive = data.active ?? current.active
    const highlight = data.highlight ?? current.highlight
    const message = data.message ?? current.message
    if (willBeActive && !(highlight || message)) {
      return res.status(400).json({ message: 'Escribe un texto destacado o un mensaje antes de activar el banner' })
    }
    const banner = await Banner.findOneAndUpdate({ key: 'home' }, { $set: data },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true })
    res.json({ ...banner.toObject(), visibleNow: banner.isVisible() })
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message })
    next(err)
  }
})

export default router

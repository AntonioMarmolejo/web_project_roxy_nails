import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoSanitize from 'express-mongo-sanitize'

import authRoutes       from './routes/auth.routes.js'
import serviceRoutes    from './routes/service.routes.js'
import bookingRoutes    from './routes/booking.routes.js'
import productRoutes    from './routes/product.routes.js'
import orderRoutes      from './routes/order.routes.js'
import workshopRoutes   from './routes/workshop.routes.js'
import enrollmentRoutes from './routes/enrollment.routes.js'
import uploadRoutes     from './routes/upload.routes.js'
import galleryRoutes    from './routes/gallery.routes.js'
import bannerRoutes     from './routes/banner.routes.js'
import slideRoutes      from './routes/slide.routes.js'
import { brand }        from './config/brand.js'

dotenv.config()

const app = express()

// Detrás del proxy de Vercel/Railway: usa la IP real del cliente (necesario para el rate limit)
app.set('trust proxy', 1)

// Middlewares globales
// CLIENT_URL admite varios orígenes separados por comas (p. ej. dominio con y sin www)
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean)
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize()) // evita inyección de operadores Mongo ($gt, $ne...) desde body/query/params

// Rutas
app.use('/api/v1/auth',        authRoutes)
app.use('/api/v1/services',    serviceRoutes)
app.use('/api/v1/bookings',    bookingRoutes)
app.use('/api/v1/products',    productRoutes)
app.use('/api/v1/orders',      orderRoutes)
app.use('/api/v1/workshops',   workshopRoutes)
app.use('/api/v1/enrollments', enrollmentRoutes)
app.use('/api/v1/upload',      uploadRoutes)
app.use('/api/v1/gallery',     galleryRoutes)
app.use('/api/v1/banner',      bannerRoutes)
app.use('/api/v1/slides',      slideRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', app: `${brand.name} API` }))

// Manejador de errores global
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'La imagen supera el tamaño máximo permitido (5MB)' })
  }
  // Datos inválidos (validación o tipos de Mongoose): 400 con un mensaje legible
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0]
    const msg = first?.kind === 'user defined' || first?.kind === 'maxlength' || first?.kind === 'min' ? first.message : 'Datos no válidos. Revisa el formulario.'
    return res.status(400).json({ message: msg })
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Datos no válidos. Revisa el formulario.' })
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' })
})

export default app

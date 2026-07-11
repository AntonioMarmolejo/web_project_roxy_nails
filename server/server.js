import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import authRoutes       from './routes/auth.routes.js'
import serviceRoutes    from './routes/service.routes.js'
import bookingRoutes    from './routes/booking.routes.js'
import productRoutes    from './routes/product.routes.js'
import orderRoutes      from './routes/order.routes.js'
import workshopRoutes   from './routes/workshop.routes.js'
import enrollmentRoutes from './routes/enrollment.routes.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// Middlewares globales
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/v1/auth',        authRoutes)
app.use('/api/v1/services',    serviceRoutes)
app.use('/api/v1/bookings',    bookingRoutes)
app.use('/api/v1/products',    productRoutes)
app.use('/api/v1/orders',      orderRoutes)
app.use('/api/v1/workshops',   workshopRoutes)
app.use('/api/v1/enrollments', enrollmentRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', app: 'Roxy Nails API' }))

// Manejador de errores global
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' })
})

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
})

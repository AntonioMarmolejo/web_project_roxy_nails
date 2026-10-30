import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'

dotenv.config()

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI)
})
afterAll(async () => { await mongoose.disconnect() })

// Agendar, comprar e inscribirse a un taller exigen cuenta (antes se aceptaban visitantes)
describe('Acciones que exigen cuenta', () => {
    it.each([
        ['agendar una cita', '/api/v1/bookings'],
        ['hacer un pedido en la tienda', '/api/v1/orders'],
        ['inscribirse a un taller', '/api/v1/enrollments'],
    ])('sin sesión no se puede %s', async (_name, url) => {
        const res = await request(app).post(url).send({ client: { name: 'Visitante', phone: '0999999999', email: 'v@test.local' } })
        expect(res.status).toBe(401)
    })
})

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import Booking from '../models/Booking.js'

dotenv.config()

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI)
})
afterEach(() => vi.restoreAllMocks())
afterAll(async () => { await mongoose.disconnect() })

const failWith = (name, message) => {
    vi.spyOn(Booking, 'find').mockImplementation(() => {
        const err = new Error(message)
        err.name = name
        throw err
    })
    return request(app).get('/api/v1/bookings/slots').query({ date: '2099-03-03' })
}

describe('Errores del servidor', () => {
    it('un corte de conexión con la base responde 503 con un mensaje claro', async () => {
        const res = await failWith('MongoNetworkTimeoutError', "Socket 'secureConnect' timed out after 209230ms (connectTimeoutMS: 30000)")
        expect(res.status).toBe(503)
        expect(res.body.message).toMatch(/Intenta de nuevo/)
        expect(res.body.message).not.toMatch(/secureConnect/)
    })

    it('también cuando Mongoose envuelve el error', async () => {
        const res = await failWith('MongooseServerSelectionError', 'connection timed out')
        expect(res.status).toBe(503)
    })

    it('un error inesperado nunca muestra detalles técnicos', async () => {
        const res = await failWith('TypeError', "Cannot read properties of undefined (reading 'x')")
        expect(res.status).toBe(500)
        expect(res.body.message).toBe('Ocurrió un error inesperado. Intenta de nuevo.')
    })
})

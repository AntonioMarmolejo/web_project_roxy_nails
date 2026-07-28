import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'

dotenv.config()

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI)
    }
})

afterAll(async () => {
    await mongoose.disconnect()
})

describe('Rutas públicas', () => {
    it('GET /api/v1/services responde con un arreglo', async () => {
        const res = await request(app).get('/api/v1/services')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    it('GET /api/v1/gallery responde con un arreglo', async () => {
        const res = await request(app).get('/api/v1/gallery')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    it('GET /api/v1/workshops responde con un arreglo', async () => {
        const res = await request(app).get('/api/v1/workshops')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })
})

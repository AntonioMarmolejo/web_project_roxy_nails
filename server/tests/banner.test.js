import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import Banner from '../models/Banner.js'

dotenv.config()

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI)
    }
})

afterAll(async () => {
    await mongoose.disconnect()
})

describe('Banner del inicio — rutas', () => {
    it('GET /api/v1/banner responde con el indicador visible', async () => {
        const res = await request(app).get('/api/v1/banner')
        expect(res.status).toBe(200)
        expect(typeof res.body.visible).toBe('boolean')
    })

    it('PUT /api/v1/banner sin token responde 401', async () => {
        const res = await request(app).put('/api/v1/banner').send({ active: true, highlight: 'x' })
        expect(res.status).toBe(401)
    })

    it('GET /api/v1/banner/admin sin token responde 401', async () => {
        const res = await request(app).get('/api/v1/banner/admin')
        expect(res.status).toBe(401)
    })
})

describe('Banner del inicio — visibilidad', () => {
    const now = new Date('2026-07-15T12:00:00Z')
    const make = (fields) => new Banner({ active: true, highlight: 'Julio: 20% OFF', ...fields })

    it('se muestra si está activo, con texto y sin fechas', () => {
        expect(make().isVisible(now)).toBe(true)
    })

    it('no se muestra si está desactivado o sin texto', () => {
        expect(make({ active: false }).isVisible(now)).toBe(false)
        expect(make({ highlight: '', message: '' }).isVisible(now)).toBe(false)
    })

    it('respeta las fechas de inicio y fin', () => {
        expect(make({ startsAt: new Date('2026-07-20') }).isVisible(now)).toBe(false)
        expect(make({ endsAt: new Date('2026-07-10') }).isVisible(now)).toBe(false)
        expect(make({ startsAt: new Date('2026-07-01'), endsAt: new Date('2026-07-31') }).isVisible(now)).toBe(true)
    })
})

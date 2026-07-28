import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

describe('Seguridad — inyección NoSQL en login', () => {
    it('rechaza operadores Mongo ($gt) en email/password con un 400 limpio', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: { $gt: '' }, password: { $gt: '' } })
        expect(res.status).toBe(400)
        expect(res.body.message).toBeDefined()
    })

    it('rechaza credenciales vacías', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({})
        expect(res.status).toBe(400)
    })
})

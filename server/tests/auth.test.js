import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import User from '../models/User.js'

dotenv.config()

const TEST_EMAIL = `vitest.${Date.now()}@example.com`

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI)
    }
})

afterAll(async () => {
    await User.deleteOne({ email: TEST_EMAIL })
    await mongoose.disconnect()
})

describe('Auth — registro y login', () => {
    it('registra un usuario nuevo', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            name: 'Vitest Tester', email: TEST_EMAIL, password: 'password123',
        })
        expect(res.status).toBe(201)
        expect(res.body.token).toBeDefined()
    })

    it('rechaza un registro duplicado con el mismo correo', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            name: 'Otra vez', email: TEST_EMAIL, password: 'password123',
        })
        expect(res.status).toBe(409)
    })

    it('inicia sesión con las credenciales correctas', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: TEST_EMAIL, password: 'password123',
        })
        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
    })

    it('rechaza una contraseña incorrecta', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: TEST_EMAIL, password: 'contraseña-equivocada',
        })
        expect(res.status).toBe(401)
    })
})

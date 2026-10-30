import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Google simulado: la "credencial" es un JSON con los datos que devolvería Google al verificarla
vi.mock('google-auth-library', () => ({
    OAuth2Client: class {
        async verifyIdToken({ idToken, audience }) {
            if (audience !== 'test-client-id.apps.googleusercontent.com') throw new Error('audience')
            let payload
            try { payload = JSON.parse(idToken) } catch { throw new Error('token inválido') }
            return { getPayload: () => payload }
        }
    },
}))

process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com'
const { default: app } = await import('../app.js')
const { default: User } = await import('../models/User.js')

const NEW_EMAIL = 'google.nuevo@test.local'
const EXISTING_EMAIL = 'google.existente@test.local'
const cred = (p) => JSON.stringify({ email_verified: true, ...p })
const google = (credential) => request(app).post('/api/v1/auth/google').send({ credential })

const cleanup = () => User.deleteMany({ email: { $in: [NEW_EMAIL, EXISTING_EMAIL] } })

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI)
    await cleanup()
})
afterAll(async () => {
    await cleanup()
    await mongoose.disconnect()
})

describe('Inicio de sesión con Google', () => {
    it('la página obtiene el ID de cliente para mostrar el botón', async () => {
        const res = await request(app).get('/api/v1/auth/google/config')
        expect(res.body.clientId).toBe('test-client-id.apps.googleusercontent.com')
    })

    it('la primera vez crea la cuenta con el nombre y correo de Google', async () => {
        const res = await google(cred({ sub: 'g-111', email: 'Google.Nuevo@test.local', name: 'Ana Google' }))
        expect(res.status).toBe(201)
        expect(res.body.isNew).toBe(true)
        expect(res.body.token).toBeDefined()
        expect(res.body.user).toMatchObject({ name: 'Ana Google', email: NEW_EMAIL, role: 'client' })
    })

    it('las siguientes veces entra a la misma cuenta', async () => {
        const res = await google(cred({ sub: 'g-111', email: NEW_EMAIL, name: 'Ana Google' }))
        expect(res.status).toBe(200)
        expect(res.body.isNew).toBe(false)
        expect(await User.countDocuments({ email: NEW_EMAIL })).toBe(1)
    })

    it('una cuenta solo de Google no puede entrar con contraseña, pero recibe un mensaje claro', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ email: NEW_EMAIL, password: 'loquesea123' })
        expect(res.status).toBe(401)
        expect(res.body.message).toMatch(/Google/)
    })

    it('si ya tenía cuenta con ese correo, la vincula y conserva su contraseña', async () => {
        await request(app).post('/api/v1/auth/register').send({ name: 'Luis', email: EXISTING_EMAIL, password: 'clave123' })
        const res = await google(cred({ sub: 'g-222', email: EXISTING_EMAIL, name: 'Luis G' }))
        expect(res.status).toBe(200)
        expect(res.body.user.name).toBe('Luis')
        const pass = await request(app).post('/api/v1/auth/login').send({ email: EXISTING_EMAIL, password: 'clave123' })
        expect(pass.status).toBe(200)
    })

    it('rechaza credenciales falsas y correos sin verificar', async () => {
        expect((await google('esto-no-es-un-token')).status).toBe(401)
        expect((await google(cred({ sub: 'g-333', email: 'x@test.local', email_verified: false }))).status).toBe(401)
        expect((await google('')).status).toBe(400)
    })
})

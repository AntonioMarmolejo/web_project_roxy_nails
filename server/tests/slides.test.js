import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import app from '../app.js'
import HeroSlide from '../models/HeroSlide.js'
import User from '../models/User.js'

dotenv.config()

// Cloudinary simulado: las pruebas nunca borran nada de verdad
const { destroyImages } = vi.hoisted(() => ({ destroyImages: vi.fn() }))
vi.mock('../config/cloudinary.js', async (importOriginal) => ({ ...(await importOriginal()), destroyImages }))

const PREFIX = '[prueba-slides]'
const ADMIN_EMAIL = 'test-slides-admin@test.local'
let auth

const valid = (overrides = {}) => ({
    tag: '✨ Promo',
    title: `${PREFIX} Corte clásico con estilo`,
    highlight: 'clásico',
    subtitle: 'Texto de prueba',
    image: 'https://example.com/foto.jpg',
    primaryLabel: 'Agendar', primaryLink: '/agendar',
    ...overrides,
})

const cleanup = async () => {
    await HeroSlide.deleteMany({ title: { $regex: '^\\[prueba-slides\\]' } })
    await User.deleteOne({ email: ADMIN_EMAIL })
}

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI)
    await cleanup()
    const admin = await User.create({ name: 'Admin prueba', email: ADMIN_EMAIL, password: 'x1234567', role: 'admin' })
    auth = { Authorization: `Bearer ${jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '10m' })}` }
})

afterAll(async () => {
    await cleanup()
    await mongoose.disconnect()
})

describe('Diapositivas del inicio', () => {
    let a, b

    it('crear, editar o borrar exige ser admin', async () => {
        expect((await request(app).post('/api/v1/slides').send(valid())).status).toBe(401)
        expect((await request(app).get('/api/v1/slides/all')).status).toBe(401)
    })

    it('el admin crea diapositivas y quedan al final, en orden', async () => {
        const r1 = await request(app).post('/api/v1/slides').set(auth).send(valid())
        const r2 = await request(app).post('/api/v1/slides').set(auth).send(valid({ title: `${PREFIX} Segunda`, highlight: '' }))
        expect(r1.status).toBe(201)
        expect(r2.status).toBe(201)
        expect(r2.body.order).toBe(r1.body.order + 1)
        a = r1.body; b = r2.body
    })

    it('valida los datos con mensajes claros', async () => {
        const post = (o) => request(app).post('/api/v1/slides').set(auth).send(valid(o))
        expect((await post({ title: '' })).body.message).toMatch(/título es obligatorio/)
        expect((await post({ image: '' })).body.message).toMatch(/imagen es obligatoria/)
        expect((await post({ highlight: 'barba' })).body.message).toMatch(/dentro del título/)
        expect((await post({ primaryLink: '' })).body.message).toMatch(/a dónde lleva/)
        expect((await post({ primaryLink: 'javascript:alert(1)' })).status).toBe(400)
        expect((await post({ secondaryLink: '/tienda' })).body.message).toMatch(/texto del segundo botón/)
    })

    it('la portada solo muestra las activas, y desactivar/activar funciona', async () => {
        const ids = async () => (await request(app).get('/api/v1/slides')).body.map(s => s._id)
        expect(await ids()).toContain(a._id)

        const off = await request(app).patch(`/api/v1/slides/${a._id}/toggle`).set(auth)
        expect(off.body.active).toBe(false)
        expect(await ids()).not.toContain(a._id)

        await request(app).patch(`/api/v1/slides/${a._id}/toggle`).set(auth)
        expect(await ids()).toContain(a._id)
    })

    it('se puede editar y cambiar el orden', async () => {
        const edit = await request(app).put(`/api/v1/slides/${a._id}`).set(auth).send({ subtitle: 'Nuevo texto' })
        expect(edit.status).toBe(200)
        expect(edit.body.subtitle).toBe('Nuevo texto')

        const reorder = await request(app).put('/api/v1/slides/order').set(auth).send({ ids: [b._id, a._id] })
        expect(reorder.status).toBe(200)
        const mine = reorder.body.filter(s => [a._id, b._id].includes(s._id)).map(s => s._id)
        expect(mine).toEqual([b._id, a._id])
    })

    it('se puede eliminar definitivamente', async () => {
        const del = await request(app).delete(`/api/v1/slides/${b._id}`).set(auth)
        expect(del.status).toBe(200)
        expect(await HeroSlide.findById(b._id)).toBeNull()
        expect((await request(app).delete(`/api/v1/slides/${b._id}`).set(auth)).status).toBe(404)
    })

    it('al eliminar, la imagen solo se borra de Cloudinary si nada más la usa', async () => {
        const img = 'https://res.cloudinary.com/demo/image/upload/v1/roxy-nails/compartida.jpg'
        const one = await request(app).post('/api/v1/slides').set(auth).send(valid({ image: img }))
        const two = await request(app).post('/api/v1/slides').set(auth).send(valid({ image: img }))
        destroyImages.mockClear()

        await request(app).delete(`/api/v1/slides/${one.body._id}`).set(auth)
        expect(destroyImages).not.toHaveBeenCalled()          // la otra diapositiva aún la usa

        await request(app).delete(`/api/v1/slides/${two.body._id}`).set(auth)
        expect(destroyImages).toHaveBeenCalledWith(img)       // ya nadie la usa
    })
})

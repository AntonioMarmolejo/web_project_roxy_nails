import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import app from '../app.js'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import User from '../models/User.js'

dotenv.config()

const NAME = 'Cliente cola (prueba)'
const ADMIN_EMAIL = 'test-queue-admin@test.local'
let admin, booking, code

// "Hoy" en la zona horaria del local, igual que el servidor
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Galapagos' })

const cleanup = async () => {
    await Booking.deleteMany({ 'client.name': NAME })
    await Service.deleteMany({ name: 'Servicio cola (prueba)' })
    await User.deleteOne({ email: ADMIN_EMAIL })
}

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI)
    await cleanup()
    const service = await Service.create({ name: 'Servicio cola (prueba)', category: 'capilar', duration: 60 })
    const user = await User.create({ name: 'Admin cola', email: ADMIN_EMAIL, password: 'x1234567', role: 'admin' })
    admin = { Authorization: `Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' })}` }
    // Creada directamente (hoy puede ser domingo, y por la API no se puede agendar en domingo)
    booking = await Booking.create({
        client: { name: NAME, phone: '0999999999' }, service: service._id,
        date: new Date(`${today}T00:00:00Z`), timeSlot: '18:00', status: 'pending',
    })
    code = String(booking._id).slice(-6).toUpperCase()
})

afterAll(async () => {
    await cleanup()
    await mongoose.disconnect()
})

const publicQueue = async () => (await request(app).get('/api/v1/bookings/queue/public')).body
const inList = (list, c) => list.find(x => x.code === c)

describe('Turnos — código de reserva', () => {
    it('el admin encuentra la cita por su código (en mayúsculas o minúsculas)', async () => {
        const res = await request(app).get(`/api/v1/bookings/code/${code.toLowerCase()}`).set(admin)
        expect(res.status).toBe(200)
        expect(res.body._id).toBe(String(booking._id))
        expect(res.body.service.name).toBe('Servicio cola (prueba)')
    })

    it('las citas nuevas se buscan por su código propio', async () => {
        const withCode = await Booking.create({
            client: { name: NAME, phone: '0999999999' }, service: booking.service,
            date: new Date(`${today}T00:00:00Z`), timeSlot: '17:00', status: 'pending', code: 'K7M2QX',
        })
        const res = await request(app).get('/api/v1/bookings/code/k7m2qx').set(admin)
        expect(res.status).toBe(200)
        expect(res.body._id).toBe(String(withCode._id))
    })

    it('códigos inválidos o inexistentes dan un mensaje claro', async () => {
        expect((await request(app).get('/api/v1/bookings/code/XYZ').set(admin)).status).toBe(400)
        const missing = await request(app).get('/api/v1/bookings/code/000000').set(admin)
        expect(missing.status).toBe(404)
        expect(missing.body.message).toMatch(/000000/)
    })

    it('buscar por código y ver la cola del admin exige ser admin', async () => {
        expect((await request(app).get(`/api/v1/bookings/code/${code}`)).status).toBe(401)
        expect((await request(app).get('/api/v1/bookings/queue')).status).toBe(401)
    })
})

describe('Turnos — sala de espera y pantalla del local', () => {
    it('la cola del admin incluye las citas de hoy, también las pendientes', async () => {
        const res = await request(app).get('/api/v1/bookings/queue').set(admin)
        expect(res.status).toBe(200)
        expect(res.body.date).toBe(today)
        expect(res.body.bookings.some(b => b._id === String(booking._id))).toBe(true)
    })

    it('la pantalla pública solo muestra citas confirmadas y nunca datos personales', async () => {
        expect(inList((await publicQueue()).next, code)).toBeUndefined()   // aún pendiente

        await request(app).patch(`/api/v1/bookings/${booking._id}`).set(admin).send({ status: 'confirmed' })
        const q = await publicQueue()
        const item = inList(q.next, code)
        expect(item).toMatchObject({ code, timeSlot: '18:00', arrived: false })
        expect(JSON.stringify(q)).not.toMatch(/Cliente cola|0999999999/)
    })

    it('registrar la llegada la marca como presente (y se puede deshacer)', async () => {
        const res = await request(app).patch(`/api/v1/bookings/${booking._id}/arrive`).set(admin)
        expect(res.status).toBe(200)
        expect(res.body.arrivedAt).toBeTruthy()
        expect(inList((await publicQueue()).next, code).arrived).toBe(true)

        const undo = await request(app).patch(`/api/v1/bookings/${booking._id}/arrive`).set(admin)
        expect(undo.body.arrivedAt).toBeNull()
        await request(app).patch(`/api/v1/bookings/${booking._id}/arrive`).set(admin)
    })

    it('al llamarla pasa a "Atendiendo"; al marcarla atendida sale de la pantalla', async () => {
        const call = await request(app).patch(`/api/v1/bookings/${booking._id}/call`).set(admin)
        expect(call.status).toBe(200)
        let q = await publicQueue()
        expect(inList(q.serving, code)).toBeTruthy()
        expect(inList(q.next, code)).toBeUndefined()

        await request(app).patch(`/api/v1/bookings/${booking._id}`).set(admin).send({ status: 'completed' })
        q = await publicQueue()
        expect(inList(q.serving, code)).toBeUndefined()
        expect(inList(q.next, code)).toBeUndefined()
        // Una cita atendida ya no se puede volver a llamar ni registrar
        expect((await request(app).patch(`/api/v1/bookings/${booking._id}/call`).set(admin)).status).toBe(400)
        expect((await request(app).patch(`/api/v1/bookings/${booking._id}/arrive`).set(admin)).status).toBe(400)
    })
})

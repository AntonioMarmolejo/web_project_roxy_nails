import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import app from '../app.js'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import User from '../models/User.js'

dotenv.config()

// Correos simulados: las pruebas nunca envían correos de verdad
const mail = vi.hoisted(() => ({
    sendBookingReceived: vi.fn(async () => {}),
    sendBookingConfirmed: vi.fn(async () => {}),
}))
vi.mock('../utils/mailer.js', async (importOriginal) => ({ ...(await importOriginal()), ...mail, mailEnabled: () => true }))

// Fechas lejanas para no chocar con citas reales de la base local
const DAY = '2099-03-03'      // martes
const SUNDAY = '2099-03-01'
const DAY2 = '2099-03-04'     // miércoles, para las pruebas de duración
const ADMIN_EMAIL = 'test-booking-admin@test.local'
const CLIENT_EMAIL = 'test-booking-client@test.local'

let service
let alisado   // dura 120 minutos
let adminToken
let clientAuth   // las citas exigen cuenta: se reservan como un cliente

const book = (overrides = {}) => request(app).post('/api/v1/bookings').set(clientAuth).send({
    client: { name: 'Prueba', phone: '0999999999' },
    service: service._id,
    date: DAY,
    timeSlot: '09:00',
    ...overrides,
})

const cleanup = async () => {
    await Booking.deleteMany({ date: { $gte: new Date('2099-01-01'), $lt: new Date('2100-01-01') } })
    await Service.deleteMany({ name: /de prueba \(citas\)$/ })
    await User.deleteMany({ email: { $in: [ADMIN_EMAIL, CLIENT_EMAIL] } })
}

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI)
    }
    await cleanup()
    service = await Service.create({ name: 'Servicio de prueba (citas)', category: 'capilar' })
    alisado = await Service.create({ name: 'Alisado de prueba (citas)', category: 'capilar', duration: 120, price: 55 })
    const admin = await User.create({ name: 'Admin prueba', email: ADMIN_EMAIL, password: 'x1234567', role: 'admin' })
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '10m' })
    const client = await User.create({ name: 'Cliente prueba', email: CLIENT_EMAIL, password: 'x1234567' })
    clientAuth = { Authorization: `Bearer ${jwt.sign({ id: client._id }, process.env.JWT_SECRET, { expiresIn: '10m' })}` }
})

afterAll(async () => {
    await cleanup()
    await mongoose.disconnect()
})

describe('Citas — una sola cita por hora', () => {
    it('sin iniciar sesión no se puede agendar', async () => {
        const res = await request(app).post('/api/v1/bookings').send({
            client: { name: 'Prueba', phone: '0999999999' }, service: service._id, date: DAY, timeSlot: '09:00',
        })
        expect(res.status).toBe(401)
    })

    it('un día vacío tiene todas las horas libres', async () => {
        const res = await request(app).get('/api/v1/bookings/slots').query({ date: DAY })
        expect(res.status).toBe(200)
        expect(res.body.available).toHaveLength(9)
        expect(res.body.booked).toEqual([])
    })

    it('reserva una hora libre', async () => {
        const res = await book()
        expect(res.status).toBe(201)
        expect(res.body.timeSlot).toBe('09:00')
        expect(res.body.slotKey).toBeUndefined()
    })

    it('rechaza otra cita en la misma hora con 409', async () => {
        const res = await book()
        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/reservada/)
    })

    it('si varias personas reservan a la vez, solo una lo consigue', async () => {
        const results = await Promise.all([1, 2, 3, 4].map(() => book({ timeSlot: '10:00' })))
        const codes = results.map(r => r.status).sort()
        expect(codes).toEqual([201, 409, 409, 409])
        expect(await Booking.countDocuments({ timeSlot: '10:00', date: new Date(`${DAY}T00:00:00Z`) })).toBe(1)
    })

    it('las horas ocupadas aparecen como no disponibles', async () => {
        const res = await request(app).get('/api/v1/bookings/slots').query({ date: DAY })
        expect(res.body.booked).toEqual(['09:00', '10:00'])
        expect(res.body.available).not.toContain('09:00')
    })

    it('al cancelar se libera la hora, y no se puede reactivar si otra persona la tomó', async () => {
        const first = await Booking.findOne({ timeSlot: '09:00', date: new Date(`${DAY}T00:00:00Z`) })
        const auth = { Authorization: `Bearer ${adminToken}` }

        const cancel = await request(app).patch(`/api/v1/bookings/${first._id}`).set(auth).send({ status: 'cancelled' })
        expect(cancel.status).toBe(200)

        expect((await book()).status).toBe(201)   // otra persona toma las 09:00

        const reactivate = await request(app).patch(`/api/v1/bookings/${first._id}`).set(auth).send({ status: 'confirmed' })
        expect(reactivate.status).toBe(409)
    })

    it('cuando el cliente cancela su propia cita, la hora queda libre', async () => {
        const auth = { Authorization: `Bearer ${adminToken}` }
        const mine = await book({ timeSlot: '14:00' }).set(auth)
        expect(mine.status).toBe(201)

        const cancel = await request(app).patch(`/api/v1/bookings/${mine.body._id}/cancel`).set(auth)
        expect(cancel.status).toBe(200)
        expect((await book({ timeSlot: '14:00' })).status).toBe(201)
    })

    it('rechaza horas, fechas y servicios no válidos', async () => {
        expect((await book({ timeSlot: '13:00' })).status).toBe(400)
        expect((await book({ timeSlot: '07:30' })).status).toBe(400)
        expect((await book({ date: SUNDAY })).status).toBe(400)
        expect((await book({ date: '2020-01-07' })).status).toBe(400)
        expect((await book({ date: 'mañana' })).status).toBe(400)
        expect((await book({ service: new mongoose.Types.ObjectId() })).status).toBe(400)
    })

    it('no deja que el cliente fije el estado ni el lugar de la cita', async () => {
        const res = await book({ timeSlot: '11:00', status: 'confirmed', slotKey: `${DAY}|12:00|1` })
        expect(res.status).toBe(201)
        expect(res.body.status).toBe('pending')
        expect((await book({ timeSlot: '12:00' })).status).toBe(201)
    })
})

describe('Citas — según lo que dura cada servicio', () => {
    const slotsFor = (svc) => request(app).get('/api/v1/bookings/slots').query({ date: DAY2, service: String(svc._id) })

    it('un servicio de 2 horas no puede empezar a las 12:00 (almuerzo) ni a las 18:00 (cierre)', async () => {
        const res = await slotsFor(alisado)
        expect(res.body.available).toEqual(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'])
        expect((await book({ service: alisado._id, date: DAY2, timeSlot: '12:00' })).status).toBe(400)
        expect((await book({ service: alisado._id, date: DAY2, timeSlot: '18:00' })).status).toBe(400)
    })

    it('un alisado a las 10:00 ocupa también las 11:00', async () => {
        expect((await book({ service: alisado._id, date: DAY2, timeSlot: '10:00' })).status).toBe(201)

        expect((await book({ service: alisado._id, date: DAY2, timeSlot: '11:00' })).status).toBe(409)
        expect((await book({ date: DAY2, timeSlot: '11:00' })).status).toBe(409)
        expect((await book({ service: alisado._id, date: DAY2, timeSlot: '09:00' })).status).toBe(409)
    })

    it('la disponibilidad lo refleja según el servicio elegido', async () => {
        const corto = await slotsFor(service)
        expect(corto.body.available).toContain('09:00')
        expect(corto.body.available).not.toContain('10:00')
        expect(corto.body.available).not.toContain('11:00')

        const largo = await slotsFor(alisado)
        expect(largo.body.available).not.toContain('09:00')   // chocaría con las 10:00
        expect(largo.body.available).toContain('14:00')
    })

    it('a las 12:00 sí queda lugar para un servicio de 1 hora', async () => {
        expect((await book({ date: DAY2, timeSlot: '12:00' })).status).toBe(201)
    })

    it('si dos servicios que se cruzan se reservan a la vez, solo uno lo consigue', async () => {
        const results = await Promise.all([
            book({ service: alisado._id, date: DAY2, timeSlot: '15:00' }),
            book({ service: alisado._id, date: DAY2, timeSlot: '16:00' }),
            book({ date: DAY2, timeSlot: '16:00' }),
        ])
        expect(results.filter(r => r.status === 201)).toHaveLength(1)
    })
})

describe('Citas — pago por adelantado', () => {
    const DAY3 = '2099-03-05'   // jueves

    it('por defecto se paga en el local', async () => {
        const res = await book({ date: DAY3, timeSlot: '09:00' })
        expect(res.status).toBe(201)
        expect(res.body.paymentMethod).toBe('local')
    })

    it('un servicio con precio se puede pagar por adelantado', async () => {
        const res = await book({ service: alisado._id, date: DAY3, timeSlot: '10:00', paymentMethod: 'transfer' })
        expect(res.status).toBe(201)
        expect(res.body.paymentMethod).toBe('transfer')
    })

    it('un servicio sin precio fijo no se puede pagar por adelantado', async () => {
        const res = await book({ date: DAY3, timeSlot: '14:00', paymentMethod: 'qr_deuna' })
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/precio fijo/)
    })

    it('rechaza métodos de pago desconocidos', async () => {
        expect((await book({ service: alisado._id, date: DAY3, timeSlot: '15:00', paymentMethod: 'bitcoin' })).status).toBe(400)
    })
})

describe('Citas — avisos al cliente', () => {
    const DAY4 = '2099-03-06'   // viernes

    it('al agendar se envía "recibimos tu solicitud" al correo de su cuenta', async () => {
        mail.sendBookingReceived.mockClear()
        const res = await book({ date: DAY4, timeSlot: '09:00' })
        expect(res.status).toBe(201)
        expect(res.body.emailSent).toBe(true)
        expect(mail.sendBookingReceived).toHaveBeenCalledWith(expect.objectContaining({ to: CLIENT_EMAIL, timeSlot: '09:00' }))
    })

    it('al confirmarla desde el panel se envía "tu cita está confirmada", una sola vez', async () => {
        const created = await book({ date: DAY4, timeSlot: '10:00', client: { name: 'Prueba', phone: '0999999999', email: 'otro@test.local' } })
        const admin = { Authorization: `Bearer ${adminToken}` }
        mail.sendBookingConfirmed.mockClear()

        const res = await request(app).patch(`/api/v1/bookings/${created.body._id}`).set(admin).send({ status: 'confirmed' })
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('confirmed')
        expect(res.body.emailSent).toBe(true)
        // Prioridad al correo que puso en el formulario
        expect(mail.sendBookingConfirmed).toHaveBeenCalledWith(expect.objectContaining({ to: 'otro@test.local', name: 'Prueba' }))

        // Completarla después no vuelve a enviar la confirmación
        await request(app).patch(`/api/v1/bookings/${created.body._id}`).set(admin).send({ status: 'completed' })
        expect(mail.sendBookingConfirmed).toHaveBeenCalledTimes(1)
    })

    it('si el correo falla, la cita se confirma igual', async () => {
        const created = await book({ date: DAY4, timeSlot: '11:00' })
        mail.sendBookingConfirmed.mockRejectedValueOnce(new Error('SMTP caído'))
        const res = await request(app).patch(`/api/v1/bookings/${created.body._id}`).set({ Authorization: `Bearer ${adminToken}` }).send({ status: 'confirmed' })
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('confirmed')
        expect(res.body.emailSent).toBe(false)
    })
})

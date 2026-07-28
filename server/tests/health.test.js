import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

describe('GET /api/health', () => {
    it('responde OK', async () => {
        const res = await request(app).get('/api/health')
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('OK')
    })
})

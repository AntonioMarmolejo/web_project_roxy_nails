import api from './axios'

export const fetchSlots = (date, service) => api.get('/bookings/slots', { params: { date, service } })
export const createBooking = (data) => api.post('/bookings', data)
export const fetchMyBookings = () => api.get('/bookings/my')
export const cancelMyBooking = (id) => api.patch(`/bookings/${id}/cancel`)
export const fetchAllBookings = (params = {}) => api.get('/bookings', { params })
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}`, { status })

// Turnos (admin): buscar por código, cola de hoy, llegada y llamada
export const fetchBookingByCode = (code) => api.get(`/bookings/code/${encodeURIComponent(code)}`)
export const fetchTodayQueue = () => api.get('/bookings/queue')
export const markBookingArrived = (id) => api.patch(`/bookings/${id}/arrive`)
export const callBookingTurn = (id) => api.patch(`/bookings/${id}/call`)
// Pantalla del local (pública)
export const fetchPublicQueue = () => api.get('/bookings/queue/public')

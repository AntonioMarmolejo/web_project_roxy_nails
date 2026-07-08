import api from './axios'

export const fetchSlots = (date) => api.get('/bookings/slots', { params: { date } })
export const createBooking = (data) => api.post('/bookings', data)
export const fetchMyBookings = () => api.get('/bookings/my')
export const cancelMyBooking = (id) => api.patch(`/bookings/${id}/cancel`)
export const fetchAllBookings = (params = {}) => api.get('/bookings', { params })
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}`, { status })

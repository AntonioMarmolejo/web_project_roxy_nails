import api from './axios'

export const createEnrollment       = (data)        => api.post('/enrollments', data)
export const fetchMyEnrollments     = ()            => api.get('/enrollments/my')
export const fetchAllEnrollments    = (params = {}) => api.get('/enrollments', { params })
export const updateEnrollmentStatus = (id, status)  => api.patch(`/enrollments/${id}`, { status })

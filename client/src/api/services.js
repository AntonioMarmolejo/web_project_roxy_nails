import api from './axios'

export const fetchServices  = ()          => api.get('/services')
export const createService  = (data)      => api.post('/services', data)
export const updateService  = (id, data)  => api.put(`/services/${id}`, data)
export const deleteService  = (id)        => api.delete(`/services/${id}`)

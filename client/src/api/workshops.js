import api from './axios'

export const fetchWorkshops    = ()         => api.get('/workshops')
export const fetchWorkshop     = (id)       => api.get(`/workshops/${id}`)
export const fetchAllWorkshops = ()         => api.get('/workshops/all')   // admin
export const createWorkshop    = (data)     => api.post('/workshops', data)
export const updateWorkshop    = (id, data) => api.put(`/workshops/${id}`, data)
export const toggleWorkshop    = (id)       => api.delete(`/workshops/${id}`) // soft-delete

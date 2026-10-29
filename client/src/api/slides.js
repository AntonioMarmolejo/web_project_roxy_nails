import api from './axios'

export const fetchSlides     = ()          => api.get('/slides')                    // público: activas en orden
export const fetchAllSlides  = ()          => api.get('/slides/all')                // admin
export const createSlide     = (data)      => api.post('/slides', data)             // admin
export const updateSlide     = (id, data)  => api.put(`/slides/${id}`, data)        // admin
export const toggleSlide     = (id)        => api.patch(`/slides/${id}/toggle`)     // admin
export const deleteSlide     = (id)        => api.delete(`/slides/${id}`)           // admin
export const reorderSlides   = (ids)       => api.put('/slides/order', { ids })     // admin

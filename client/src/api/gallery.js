import api from './axios'

export const fetchGalleryImages    = ()          => api.get('/gallery')
export const fetchAllGalleryImages = ()          => api.get('/gallery/all')   // admin
export const createGalleryImage    = (data)      => api.post('/gallery', data)
export const updateGalleryImage    = (id, data)  => api.put(`/gallery/${id}`, data)
export const toggleGalleryImage    = (id)        => api.delete(`/gallery/${id}`) // soft-delete
export const deleteGalleryImage    = (id)        => api.delete(`/gallery/${id}/permanent`)
export const likeGalleryImage     = (id, delta) => api.patch(`/gallery/${id}/like`, { delta })

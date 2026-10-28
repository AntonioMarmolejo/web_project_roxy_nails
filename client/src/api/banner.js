import api from './axios'

export const fetchBanner      = ()     => api.get('/banner')        // público: { visible, ... }
export const fetchBannerAdmin = ()     => api.get('/banner/admin')  // admin: configuración completa
export const saveBanner       = (data) => api.put('/banner', data)  // admin

import api from './axios'

export const fetchProducts    = ()        => api.get('/products')
export const fetchAllProducts = ()        => api.get('/products/all')   // admin
export const createProduct    = (data)    => api.post('/products', data)
export const updateProduct    = (id, data) => api.put(`/products/${id}`, data)
export const toggleProduct    = (id)      => api.delete(`/products/${id}`) // soft-delete

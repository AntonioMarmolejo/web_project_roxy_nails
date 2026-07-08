import api from './axios'

export const createOrder       = (data)        => api.post('/orders', data)
export const fetchMyOrders     = ()            => api.get('/orders/my')
export const fetchAllOrders    = (params = {}) => api.get('/orders', { params })
export const updateOrderStatus = (id, status)  => api.patch(`/orders/${id}`, { status })

import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
})

// Adjunta el token JWT a cada petición si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('rn_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Redirige al login si el token expira
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('rn_token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api

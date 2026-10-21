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
// También rechaza respuestas HTML (p. ej. el rewrite SPA de Vercel devolviendo index.html
// cuando la API no está disponible), para que no lleguen strings donde se esperan arrays
api.interceptors.response.use(
    (res) => {
        const type = res.headers?.['content-type'] || ''
        if (res.status !== 204 && !type.includes('application/json')) {
            return Promise.reject(new Error(`Respuesta no JSON de ${res.config?.url}`))
        }
        return res
    },
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('rn_token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api

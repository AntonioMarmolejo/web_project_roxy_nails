import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/ProtectedRoute.css'

export default function ProtectedRoute({ children, adminRequired = false }) {
    const { token, user, authReady } = useAuthStore()
    const location = useLocation()

    if (!authReady) return (
        <div className="protected-route__loading">
            <span>Cargando...</span>
        </div>
    )

    // Tras iniciar sesión se vuelve aquí (p. ej. /admin?turno=AEC48D al leer el QR con la cámara del teléfono)
    if (!token) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    if (adminRequired && user?.role !== 'admin') return <Navigate to="/" replace />

    return children
}

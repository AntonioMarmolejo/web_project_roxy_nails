import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/ProtectedRoute.css'

export default function ProtectedRoute({ children, adminRequired = false }) {
    const { token, user, authReady } = useAuthStore()

    if (!authReady) return (
        <div className="protected-loading">
            <span>Cargando...</span>
        </div>
    )

    if (!token) return <Navigate to="/login" replace />
    if (adminRequired && user?.role !== 'admin') return <Navigate to="/" replace />

    return children
}

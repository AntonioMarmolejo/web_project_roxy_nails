import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function ProtectedRoute({ children, adminRequired = false }) {
    const { token, user, authReady } = useAuthStore()

    if (!authReady) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <span style={{ color: '#C2185B', fontSize: 14 }}>Cargando...</span>
        </div>
    )

    if (!token) return <Navigate to="/login" replace />
    if (adminRequired && user?.role !== 'admin') return <Navigate to="/" replace />

    return children
}

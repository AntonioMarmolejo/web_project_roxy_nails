import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/RequireAccount.css'

// Envuelve una página que necesita cuenta (agendar, comprar, inscribirse a un taller).
// Sin sesión muestra un aviso con "Iniciar sesión" y "Crear cuenta"; después del login
// se vuelve a esta misma página con su estado (p. ej. el servicio elegido).
export default function RequireAccount({ action, backTo = '/', backLabel = 'Volver al inicio', children }) {
    const { token, authReady } = useAuthStore()
    const location = useLocation()
    const navigate = useNavigate()
    const showNotice = authReady && !token

    // Se llega desde más abajo en otra página (p. ej. una tarjeta del inicio): subir para que el aviso se vea
    useEffect(() => {
        if (showNotice) window.scrollTo({ top: 0 })
    }, [showNotice])

    if (!authReady) return <div className="require-account__loading">Cargando...</div>
    if (token) return children

    const goLogin = (mode) => navigate('/login', {
        state: { from: location.pathname + location.search, fromState: location.state, mode, reason: action },
    })

    return (
        <main className="require-account">
            <div className="require-account__card" role="alert">
                <div className="require-account__icon" aria-hidden="true">🔒</div>
                <h1 className="require-account__title">Necesitas una cuenta</h1>
                <p className="require-account__text">
                    Para {action} debes iniciar sesión o registrarte. Así guardamos tus datos y puedes ver tu historial cuando quieras.
                </p>
                <div className="require-account__actions">
                    <button onClick={() => goLogin('login')} className="btn btn--primary">Iniciar sesión</button>
                    <button onClick={() => goLogin('register')} className="btn btn--ghost">Crear cuenta</button>
                </div>
                <Link to={backTo} className="require-account__back">{backLabel}</Link>
            </div>
        </main>
    )
}

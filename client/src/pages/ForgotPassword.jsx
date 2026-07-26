import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/Login.css'

export default function ForgotPassword() {
    const { forgotPassword } = useAuthStore()
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await forgotPassword(email)
            setSent(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error, intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="login">
            <Helmet>
                <title>Recuperar contraseña — Roxy Nails</title>
                <meta name="description" content="Recupera el acceso a tu cuenta de Roxy Nails." />
            </Helmet>

            <div className="login__card">
                <div className="login__header">
                    <Link to="/" className="login__logo">
                        Roxy <em>Nails</em>
                    </Link>
                    <p className="login__subtitle">Recupera tu contraseña</p>
                </div>

                {sent ? (
                    <p className="login__toggle-text" style={{ textAlign: 'center' }}>
                        Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña.
                        Revisa tu bandeja de entrada (y spam).
                    </p>
                ) : (
                    <form onSubmit={submit} className="login__form">
                        <div>
                            <label className="login__label">Correo electrónico</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="login__input" placeholder="correo@ejemplo.com" required
                            />
                        </div>

                        {error && <p className="login__error">{error}</p>}

                        <button type="submit" disabled={loading} className="login__submit-btn">
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                )}

                <p className="login__toggle-text">
                    <Link to="/login" className="login__toggle-link">← Volver a iniciar sesión</Link>
                </p>
            </div>
        </main>
    )
}

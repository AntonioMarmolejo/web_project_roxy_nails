import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/Login.css'

export default function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const { resetPassword } = useAuthStore()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.')
            return
        }
        setLoading(true)
        try {
            await resetPassword(token, password)
            setDone(true)
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'El enlace no es válido o ha expirado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="login">
            <Helmet>
                <title>Restablecer contraseña — Roxy Nails</title>
                <meta name="description" content="Crea una nueva contraseña para tu cuenta de Roxy Nails." />
            </Helmet>

            <div className="login__card">
                <div className="login__header">
                    <Link to="/" className="login__logo">
                        Roxy <em>Nails</em>
                    </Link>
                    <p className="login__subtitle">Crea tu nueva contraseña</p>
                </div>

                {done ? (
                    <p className="login__toggle-text" style={{ textAlign: 'center' }}>
                        ¡Contraseña actualizada! Redirigiéndote a iniciar sesión...
                    </p>
                ) : (
                    <form onSubmit={submit} className="login__form">
                        <div>
                            <label className="login__label">Nueva contraseña</label>
                            <input
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="login__input" placeholder="••••••••" required minLength={6}
                            />
                        </div>
                        <div>
                            <label className="login__label">Confirmar contraseña</label>
                            <input
                                type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                className="login__input" placeholder="••••••••" required minLength={6}
                            />
                        </div>

                        {error && <p className="login__error">{error}</p>}

                        <button type="submit" disabled={loading} className="login__submit-btn">
                            {loading ? 'Guardando...' : 'Restablecer contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </main>
    )
}

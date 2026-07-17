import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/Login.css'

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' }

export default function Login() {
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState(EMPTY_FORM)
    const [error, setError] = useState('')
    const { login, register, loading } = useAuthStore()
    const navigate = useNavigate()

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            if (mode === 'login') {
                await login(form.email, form.password)
            } else {
                await register(form.name, form.email, form.phone, form.password)
            }
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error, intenta de nuevo.')
        }
    }

    const toggleMode = () => {
        setMode(m => m === 'login' ? 'register' : 'login')
        setForm(EMPTY_FORM)
        setError('')
    }

    return (
        <main className="login">
            <div className="login__card">
                {/* Logo */}
                <div className="login__header">
                    <Link to="/" className="login__logo">
                        Roxy <em>Nails</em>
                    </Link>
                    <p className="login__subtitle">
                        {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
                    </p>
                </div>

                {/* Toggle tabs */}
                <div className="login__tabs">
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setForm(EMPTY_FORM); setError('') }}
                            className={`login__tab${mode === m ? ' login__tab--active' : ''}`}>
                            {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="login__form">
                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="login__label">Nombre completo</label>
                                <input name="name" value={form.name} onChange={handle}
                                    className="login__input" placeholder="María Torres" required />
                            </div>
                            <div>
                                <label className="login__label">Teléfono / WhatsApp</label>
                                <input name="phone" value={form.phone} onChange={handle}
                                    className="login__input" placeholder="+593 99 123 4567" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="login__label">Correo electrónico</label>
                        <input name="email" type="email" value={form.email} onChange={handle}
                            className="login__input" placeholder="correo@ejemplo.com" required />
                    </div>

                    <div>
                        <label className="login__label">Contraseña</label>
                        <input name="password" type="password" value={form.password} onChange={handle}
                            className="login__input" placeholder="••••••••" required minLength={6} />
                    </div>

                    {error && (
                        <p className="login__error">{error}</p>
                    )}

                    <button type="submit" disabled={loading} className="login__submit-btn">
                        {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="login__toggle-text">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                    <span onClick={toggleMode} className="login__toggle-link">
                        {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                    </span>
                </p>
            </div>
        </main>
    )
}

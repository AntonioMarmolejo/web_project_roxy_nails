import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/useAuthStore'
import PasswordInput from '../components/PasswordInput'
import GoogleButton from '../components/GoogleButton'
import '../styles/Login.css'
import { brand } from '../config/brand'

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' }

export default function Login() {
    const location = useLocation()
    // Si viene del aviso "necesitas una cuenta": a dónde volver después y con qué pestaña abrir
    const { from, fromState, mode: initialMode, reason } = location.state || {}
    const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login')
    const [form, setForm] = useState(EMPTY_FORM)
    const [error, setError] = useState('')
    const { login, register, loginWithGoogle, loading } = useAuthStore()
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
            navigate(from || '/', { replace: true, state: fromState })
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error, intenta de nuevo.')
        }
    }

    const google = async (credential) => {
        setError('')
        try {
            await loginWithGoogle(credential)
            navigate(from || '/', { replace: true, state: fromState })
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo entrar con Google. Intenta de nuevo.')
        }
    }

    const toggleMode = () => {
        setMode(m => m === 'login' ? 'register' : 'login')
        setForm(EMPTY_FORM)
        setError('')
    }

    return (
        <main className="login">
            <Helmet>
                <title>{`${mode === 'login' ? 'Ingresar' : 'Crear cuenta'} — ${brand.fullName}`}</title>
                <meta name="description" content={`Ingresa o crea tu cuenta en ${brand.fullName} para agendar citas, comprar productos e inscribirte a talleres.`} />
            </Helmet>

            <div className="login__card">
                {/* Logo */}
                <div className="login__header">
                    <Link to="/" className="login__logo">
                        {brand.logo.main} <em>{brand.logo.accent}</em>
                    </Link>
                    <p className="login__subtitle">
                        {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
                    </p>
                </div>

                {reason && (
                    <p className="login__reason">
                        🔒 Para {reason} necesitas una cuenta. Al terminar volverás a donde estabas.
                    </p>
                )}

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
                        <PasswordInput name="password" value={form.password} onChange={handle}
                            className="login__input" placeholder="••••••••" required minLength={6} />
                    </div>

                    {mode === 'login' && (
                        <Link to="/olvide-contrasena" className="login__forgot-link">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}

                    {error && (
                        <p className="login__error">{error}</p>
                    )}

                    {/* Enviar + entrar con Google (solo el círculo con la "G") */}
                    <div className="login__submit-row">
                        <button type="submit" disabled={loading} className="login__submit-btn">
                            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                        </button>
                        <GoogleButton onCredential={google} onError={setError} />
                    </div>
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

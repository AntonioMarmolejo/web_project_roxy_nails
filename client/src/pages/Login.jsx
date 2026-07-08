import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' }

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #F0D0DC', borderRadius: 8,
  fontSize: 13, fontFamily: 'Inter, sans-serif',
  outline: 'none', background: '#fff', color: '#2D1520',
  boxSizing: 'border-box',
}

const labelStyle = { fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }

export default function Login() {
  const [mode, setMode]   = useState('login')
  const [form, setForm]   = useState(EMPTY_FORM)
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
    <main style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#FDF0F5', padding: '2rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '2.5rem 2rem', width: '100%', maxWidth: 400,
        border: '1px solid #F0D0DC',
        boxShadow: '0 4px 24px rgba(194,24,91,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 26, fontWeight: 600, color: '#C2185B',
            textDecoration: 'none',
          }}>
            Roxy <em style={{ fontStyle: 'italic', color: '#E91E8C' }}>Nails</em>
          </Link>
          <p style={{ fontSize: 13, color: '#6B4050', marginTop: 6 }}>
            {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Toggle tabs */}
        <div style={{
          display: 'flex', background: '#FDF0F5',
          borderRadius: 10, padding: 4, marginBottom: '1.5rem',
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setForm(EMPTY_FORM); setError('') }}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: mode === m ? '#C2185B' : 'transparent',
                color: mode === m ? '#fff' : '#6B4050',
                fontWeight: mode === m ? 500 : 400,
                transition: 'all 0.2s',
              }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input name="name" value={form.name} onChange={handle}
                  style={inputStyle} placeholder="María Torres" required />
              </div>
              <div>
                <label style={labelStyle}>Teléfono / WhatsApp</label>
                <input name="phone" value={form.phone} onChange={handle}
                  style={inputStyle} placeholder="+593 99 123 4567" />
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              style={inputStyle} placeholder="correo@ejemplo.com" required />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              style={inputStyle} placeholder="••••••••" required minLength={6} />
          </div>

          {error && (
            <p style={{
              fontSize: 12, color: '#C2185B',
              background: '#FDF0F5', padding: '8px 12px',
              borderRadius: 8, border: '1px solid #F8C8DC',
            }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? '#e88aaa' : '#C2185B',
            color: '#fff', border: 'none', borderRadius: 24,
            padding: '12px', fontSize: 14, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif', marginTop: 4,
          }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#6B4050', marginTop: '1.25rem' }}>
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <span onClick={toggleMode}
            style={{ color: '#C2185B', cursor: 'pointer', fontWeight: 500 }}>
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </span>
        </p>
      </div>
    </main>
  )
}

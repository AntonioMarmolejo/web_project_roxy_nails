import { Link } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Navbar() {
  const count   = useCartStore(s => s.count)
  const { user, logout } = useAuthStore()

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', borderBottom: '1px solid #F0D0DC',
      background: '#fff', position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#C2185B', fontWeight: 600 }}>
        Roxy <em style={{ fontStyle: 'italic', color: '#E91E8C' }}>Nails</em>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/servicios" style={{ fontSize: 13, color: '#6B4050' }}>Servicios</Link>
        <Link to="/agendar"   style={{ fontSize: 13, color: '#6B4050' }}>Agendar</Link>
        <Link to="/tienda"    style={{ fontSize: 13, color: '#6B4050' }}>Tienda</Link>
        <Link to="/talleres"  style={{ fontSize: 13, color: '#6B4050' }}>Talleres</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ fontSize: 13, color: '#C2185B', fontWeight: 500 }}>Admin</Link>
        )}

        <Link to="/tienda" style={{ position: 'relative', color: '#6B4050' }}>
          🛒
          {count > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -8,
              background: '#C2185B', color: '#fff',
              borderRadius: '50%', width: 16, height: 16,
              fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 500
            }}>{count}</span>
          )}
        </Link>

        {user ? (
          <button onClick={logout} className="btn-ghost" style={{ padding: '6px 16px', fontSize: 12 }}>
            Salir
          </button>
        ) : (
          <Link to="/admin"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: 12 }}>Ingresar</button></Link>
        )}
      </div>
    </nav>
  )
}

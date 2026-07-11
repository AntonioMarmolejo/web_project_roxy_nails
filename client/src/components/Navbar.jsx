import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Navbar() {
    const { count, openDrawer } = useCartStore()
    const { user, logout } = useAuthStore()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const close = () => setOpen(false)

    return (
        <nav className="rn-navbar" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 2rem', borderBottom: '1px solid #F0D0DC',
            background: '#fff', position: 'sticky', top: 0, zIndex: 100,
        }}>
            <Link to="/" onClick={close} style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#C2185B', fontWeight: 600 }}>
                Roxy <em style={{ fontStyle: 'italic', color: '#E91E8C' }}>Nails</em>
            </Link>

            {/* Hamburger — solo visible en mobile */}
            <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
                <span /><span /><span />
            </button>

            {/* Links — desktop inline, mobile dropdown */}
            <div className={`nav-links${open ? ' is-open' : ''}`}>
                <Link to="/servicios" onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Servicios</Link>
                <Link to="/agendar" onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Agendar</Link>
                {user && (
                    <Link to="/mis-citas"   onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Mis citas</Link>
                )}
                {user && (
                    <Link to="/mis-pedidos" onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Mis pedidos</Link>
                )}
                {user && (
                    <Link to="/mis-talleres" onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Mis talleres</Link>
                )}
                <Link to="/tienda" onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Tienda</Link>
                <Link to="/talleres" onClick={close} style={{ fontSize: 14, color: '#6B4050' }}>Talleres</Link>
                {user?.role === 'admin' && (
                    <Link to="/admin" onClick={close} style={{ fontSize: 14, color: '#C2185B', fontWeight: 500 }}>Admin</Link>
                )}

                <button onClick={() => { openDrawer(); close() }} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, color: '#6B4050', padding: '2px 4px' }}>
                    🛒
                    {count > 0 && (
                        <span style={{
                            position: 'absolute', top: -6, right: -8,
                            background: '#C2185B', color: '#fff',
                            borderRadius: '50%', width: 16, height: 16,
                            fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 500,
                        }}>{count}</span>
                    )}
                </button>

                {user ? (
                    <button onClick={() => { logout(); close() }} style={{
                        background: 'transparent', border: '1px solid #F0D0DC',
                        color: '#C2185B', borderRadius: 20, padding: '7px 18px',
                        fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                        Salir
                    </button>
                ) : (
                    <button onClick={() => { navigate('/login'); close() }} style={{
                        background: '#C2185B', color: '#fff', border: 'none',
                        borderRadius: 20, padding: '9px 20px',
                        fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                        Ingresar
                    </button>
                )}
            </div>
        </nav>
    )
}

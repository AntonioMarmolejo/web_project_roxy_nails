import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

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
                <NavLink to="/servicios" onClick={close} className={navLinkClass}>Servicios</NavLink>
                <NavLink to="/agendar" onClick={close} className={navLinkClass}>Agendar</NavLink>
                {user && (
                    <NavLink to="/mis-citas" onClick={close} className={navLinkClass}>Mis citas</NavLink>
                )}
                {user && (
                    <NavLink to="/mis-pedidos" onClick={close} className={navLinkClass}>Mis pedidos</NavLink>
                )}
                {user && (
                    <NavLink to="/mis-talleres" onClick={close} className={navLinkClass}>Mis talleres</NavLink>
                )}
                <NavLink to="/tienda" onClick={close} className={navLinkClass}>Tienda</NavLink>
                <NavLink to="/talleres" onClick={close} className={navLinkClass}>Talleres</NavLink>
                {user?.role === 'admin' && (
                    <NavLink to="/admin" onClick={close} className={({ isActive }) => `nav-link nav-link-admin${isActive ? ' active' : ''}`}>Admin</NavLink>
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

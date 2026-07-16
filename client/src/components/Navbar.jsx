import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/Navbar.css'

const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

export default function Navbar() {
    const { count, openDrawer } = useCartStore()
    const { user, logout } = useAuthStore()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const close = () => setOpen(false)

    return (
        <nav className="rn-navbar navbar">
            <Link to="/" onClick={close} className="navbar-logo">
                Roxy <em>Nails</em>
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

                <button onClick={() => { openDrawer(); close() }} className="cart-btn">
                    🛒
                    {count > 0 && (
                        <span className="cart-btn-badge">{count}</span>
                    )}
                </button>

                {user ? (
                    <button onClick={() => { logout(); close() }} className="navbar-logout-btn">
                        Salir
                    </button>
                ) : (
                    <button onClick={() => { navigate('/login'); close() }} className="navbar-login-btn">
                        Ingresar
                    </button>
                )}
            </div>
        </nav>
    )
}

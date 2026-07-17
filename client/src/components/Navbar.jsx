import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/Navbar.css'

const navLinkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`

export default function Navbar() {
    const { count, openDrawer } = useCartStore()
    const { user, logout } = useAuthStore()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const close = () => setOpen(false)

    return (
        <nav className="navbar">
            <Link to="/" onClick={close} className="navbar__logo">
                Roxy <em>Nails</em>
            </Link>

            {/* Hamburger — solo visible en mobile */}
            <button className="navbar__hamburger" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
                <span /><span /><span />
            </button>

            {/* Links — desktop inline, mobile dropdown */}
            <div className={`navbar__links${open ? ' navbar__links--open' : ''}`}>
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
                    <NavLink to="/admin" onClick={close} className={({ isActive }) => `navbar__link navbar__link--admin${isActive ? ' navbar__link--active' : ''}`}>Admin</NavLink>
                )}

                <button onClick={() => { openDrawer(); close() }} className="navbar__cart-btn">
                    🛒
                    {count > 0 && (
                        <span className="navbar__cart-badge">{count}</span>
                    )}
                </button>

                {user ? (
                    <button onClick={() => { logout(); close() }} className="navbar__logout-btn">
                        Salir
                    </button>
                ) : (
                    <button onClick={() => { navigate('/login'); close() }} className="navbar__login-btn">
                        Ingresar
                    </button>
                )}
            </div>
        </nav>
    )
}

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { useAccountDrawerStore } from '../store/useAccountDrawerStore'
import '../styles/Navbar.css'

const navLinkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`

export default function Navbar() {
    const { count, openDrawer } = useCartStore()
    const { user } = useAuthStore()
    const { toggle: toggleAccountDrawer } = useAccountDrawerStore()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const close = () => setOpen(false)

    return (
        <nav className="navbar">
            <div className="navbar__left">
                {user && (
                    <button className="navbar__account-hamburger" onClick={toggleAccountDrawer} aria-label="Abrir menú de cuenta">
                        <span /><span /><span />
                    </button>
                )}

                <Link to="/" onClick={close} className="navbar__logo">
                    Roxy <em>Nails</em>
                </Link>
            </div>

            {/* Hamburger — solo visible en mobile */}
            <button className="navbar__hamburger" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
                <span /><span /><span />
            </button>

            {/* Links — desktop inline, mobile dropdown */}
            <div className={`navbar__links${open ? ' navbar__links--open' : ''}`}>
                <NavLink to="/servicios" onClick={close} className={navLinkClass}>Servicios</NavLink>
                <NavLink to="/agendar" onClick={close} className={navLinkClass}>Agendar</NavLink>
                <NavLink to="/tienda" onClick={close} className={navLinkClass}>Tienda</NavLink>
                <NavLink to="/talleres" onClick={close} className={navLinkClass}>Talleres</NavLink>

                <button onClick={() => { openDrawer(); close() }} className="navbar__cart-btn">
                    🛒
                    {count > 0 && (
                        <span className="navbar__cart-badge">{count}</span>
                    )}
                </button>

                {!user && (
                    <button onClick={() => { navigate('/login'); close() }} className="navbar__login-btn">
                        Ingresar
                    </button>
                )}
            </div>
        </nav>
    )
}

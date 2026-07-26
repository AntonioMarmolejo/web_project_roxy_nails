import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAccountDrawerStore } from '../store/useAccountDrawerStore'
import { useAuthStore } from '../store/useAuthStore'
import '../styles/AccountDrawer.css'

const CLOSE_MS = 300

const LINKS = [
    { to: '/mis-citas',   icon: '📅', label: 'Mis citas' },
    { to: '/mis-pedidos', icon: '📦', label: 'Mis pedidos' },
    { to: '/mis-talleres', icon: '🎓', label: 'Mis talleres' },
    { to: '/perfil',      icon: '👤', label: 'Mi perfil' },
]

const navLinkClass = ({ isActive }) => `account-drawer__link${isActive ? ' account-drawer__link--active' : ''}`

export default function AccountDrawer() {
    const { open: storeOpen, close } = useAccountDrawerStore()
    const { user, logout } = useAuthStore()
    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (storeOpen) {
            setMounted(true)
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
        } else if (mounted) {
            setVisible(false)
            const t = setTimeout(() => setMounted(false), CLOSE_MS)
            return () => clearTimeout(t)
        }
    }, [storeOpen])

    useEffect(() => {
        if (!mounted) return
        document.body.style.overflow = 'hidden'
        const onKeyDown = (e) => { if (e.key === 'Escape') close() }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [mounted])

    if (!mounted || !user) return null

    const initial = user.name?.charAt(0).toUpperCase() || '?'

    return (
        <div className={`account-drawer${visible ? ' account-drawer--visible' : ''}`}>
            <div className="account-drawer__backdrop" onClick={close} />

            <div className="account-drawer__panel">
                <div className="account-drawer__profile">
                    <div className="account-drawer__avatar">{initial}</div>
                    <div className="account-drawer__name">{user.name}</div>
                    <div className="account-drawer__email">{user.email}</div>
                </div>

                <button onClick={() => { logout(); close() }} className="account-drawer__logout-btn">
                    ⏻ Cerrar sesión
                </button>

                <nav className="account-drawer__nav">
                    {LINKS.map(l => (
                        <NavLink key={l.to} to={l.to} onClick={close} className={navLinkClass}>
                            <span className="account-drawer__link-icon">{l.icon}</span>
                            {l.label}
                        </NavLink>
                    ))}
                    {user.role === 'admin' && (
                        <NavLink to="/admin" onClick={close} className={navLinkClass}>
                            <span className="account-drawer__link-icon">⚙️</span>
                            Admin
                        </NavLink>
                    )}
                </nav>
            </div>
        </div>
    )
}

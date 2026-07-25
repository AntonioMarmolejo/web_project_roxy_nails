import { useEffect, useState } from 'react'
import '../styles/PageHeader.css'

export default function PageHeader({ label, title, subtitle, visibleMs = 3000 }) {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setCollapsed(true), visibleMs)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className={`page-header${collapsed ? ' page-header--collapsed' : ''}`}>
            <div className="page-header__inner">
                <p className="page-header__label">{label}</p>
                <h1 className="page-header__title">{title}</h1>
                {subtitle && <p className="page-header__sub">{subtitle}</p>}
            </div>
        </div>
    )
}

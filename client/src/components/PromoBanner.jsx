import { Link } from 'react-router-dom'

// Barra promocional de la página de inicio (se configura en Admin → Banner)
export default function PromoBanner({ banner }) {
    if (!banner) return null
    const { emoji, highlight, message, linkText, linkTo } = banner
    const isInternal = linkTo?.startsWith('/')

    return (
        <div className="home__promo-bar">
            {emoji && <>{emoji} </>}
            {highlight && <strong>{highlight}</strong>}
            {highlight && message && ' '}
            {message}
            {linkText && linkTo && (
                <>
                    {' — '}
                    {isInternal
                        ? <Link to={linkTo}>{linkText}</Link>
                        : <a href={linkTo} target="_blank" rel="noopener noreferrer">{linkText}</a>}
                </>
            )}
        </div>
    )
}

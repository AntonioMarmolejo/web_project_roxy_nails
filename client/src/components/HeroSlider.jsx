import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSlides } from '../api/slides'
import '../styles/HeroSlider.css'

const AUTOPLAY_MS = 6500
const HERO_BG = 'linear-gradient(135deg, var(--color-bg) 55%, var(--color-surface-soft) 100%)'

// Separa el título en [antes, destacado, después] según la parte destacada (sin distinguir mayúsculas)
function splitTitle(title = '', highlight = '') {
    const i = highlight ? title.toLowerCase().indexOf(highlight.toLowerCase()) : -1
    if (i < 0) return [title, '', '']
    return [title.slice(0, i), title.slice(i, i + highlight.length), title.slice(i + highlight.length)]
}

// Las diapositivas se administran en el panel (pestaña Portada).
// `slides` + `preview`: el admin muestra una vista previa sin cargar del servidor ni navegar.
export default function HeroSlider({ slides: given, preview = false }) {
    const [loaded, setLoaded] = useState(null)
    const [cur, setCur] = useState(0)
    const navigate = useNavigate()
    const slides = given || loaded

    useEffect(() => {
        if (given) return
        fetchSlides().then(({ data }) => setLoaded(data)).catch(() => setLoaded([]))
    }, [given])

    const count = slides?.length || 0
    const go = useCallback((n) => setCur(count ? (n + count) % count : 0), [count])

    useEffect(() => {
        if (preview || count < 2) return
        const t = setInterval(() => go(cur + 1), AUTOPLAY_MS)
        return () => clearInterval(t)
    }, [cur, go, count, preview])

    // Mientras carga, un hueco del mismo alto para que la página no salte
    if (!slides) return <div className="hero hero--loading" style={{ '--hero-bg': HERO_BG }} />
    if (count === 0) return null

    const s = slides[Math.min(cur, count - 1)]
    const [before, em, after] = splitTitle(s.title, s.highlight)

    const open = (to) => {
        if (preview || !to) return
        if (to.startsWith('/')) navigate(to)
        else window.open(to, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="hero" style={{ '--hero-bg': HERO_BG, '--btn-color': 'var(--color-primary)' }}>
            <div className="hero__inner">
                {/* Contenido */}
                <div className="hero__content" key={`content-${cur}`}>
                    {s.tag && <span className="hero__tag">{s.tag}</span>}

                    <h1 className="hero__title">
                        {before && <span>{before}</span>}
                        {em && <em>{em}</em>}
                        {after && <span>{after}</span>}
                    </h1>

                    {s.subtitle && <p className="hero__sub">{s.subtitle}</p>}

                    {(s.primaryLabel || s.secondaryLabel) && (
                        <div className="hero__buttons">
                            {s.primaryLabel && (
                                <button className="btn btn--primary" onClick={() => open(s.primaryLink)}>
                                    {s.primaryLabel}
                                </button>
                            )}
                            {s.secondaryLabel && (
                                <button className="btn btn--ghost" onClick={() => open(s.secondaryLink)}>
                                    {s.secondaryLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Imagen */}
                <div className="hero__media">
                    {s.image && <img src={s.image} alt={s.title} key={`media-${cur}`} />}
                </div>
            </div>

            {count > 1 && (
                <>
                    {/* Flechas */}
                    {['‹', '›'].map((arrow, i) => (
                        <button
                            key={arrow}
                            onClick={() => go(cur + (i === 0 ? -1 : 1))}
                            aria-label={i === 0 ? 'Anterior' : 'Siguiente'}
                            className={`hero__arrow ${i === 0 ? 'hero__arrow--left' : 'hero__arrow--right'}`}
                        >{arrow}</button>
                    ))}

                    {/* Dots */}
                    <div className="hero__dots">
                        {slides.map((_, i) => (
                            <button key={i} onClick={() => go(i)} aria-label={`Diapositiva ${i + 1}`}
                                className={`hero__dot${cur === i ? ' hero__dot--active' : ''}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

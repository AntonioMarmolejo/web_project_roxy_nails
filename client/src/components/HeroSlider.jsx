import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/HeroSlider.css'

const SLIDES = [
    {
        tag: '✨ Más solicitado',
        tagBg: '#F8C8DC', tagColor: '#88134A',
        title: ['Manicure ', 'gel', ' que dura semanas'],
        titleEm: 1,
        emColor: '#C2185B',
        sub: 'Colores que no se despegan, acabados que brillan. Tu estilo, sin preocupaciones.',
        bg: 'linear-gradient(135deg, #FDF0F5 55%, #F8C8DC 100%)',
        btnPrimary: { label: 'Ver precios', to: '/servicios', color: '#C2185B' },
        btnGhost: { label: 'Agendar ahora', to: '/agendar', color: '#C2185B' },
        image: 'https://res.cloudinary.com/lhwns2br/image/upload/v1784258154/roxy-nails/fo64nw2o6szi9a2m2moo.jpg',
    },
    {
        tag: '🌸 Relajación total',
        tagBg: '#FFE0D0', tagColor: '#993C1D',
        title: ['Pedicure ', 'spa', ' con piedras calientes'],
        titleEm: 1,
        emColor: '#D85A30',
        sub: 'Un ritual completo de cuidado desde la rodilla hasta las puntas.',
        bg: 'linear-gradient(135deg, #FFF5F0 55%, #FFD4C2 100%)',
        btnPrimary: { label: 'Reservar', to: '/agendar', color: '#D85A30' },
        btnGhost: { label: 'Ver detalles', to: '/servicios', color: '#D85A30' },
        image: 'https://res.cloudinary.com/lhwns2br/image/upload/v1784258204/roxy-nails/kn1ddmkumimcfxboibof.jpg',
    },
    {
        tag: '🎓 Próximo taller',
        tagBg: '#E8DCFF', tagColor: '#534AB7',
        title: ['Aprende ', 'nail art', ' desde cero'],
        titleEm: 1,
        emColor: '#7F77DD',
        sub: 'Talleres presenciales y virtuales. Certificación incluida. ¡Plazas limitadas!',
        bg: 'linear-gradient(135deg, #F5F0FF 55%, #E0CEFF 100%)',
        btnPrimary: { label: 'Ver talleres', to: '/talleres', color: '#7F77DD' },
        btnGhost: { label: 'Más info', to: '/talleres', color: '#7F77DD' },
        image: 'https://res.cloudinary.com/lhwns2br/image/upload/v1784258243/roxy-nails/im714bfargexaa9lagjp.jpg',
    },
]

const AUTOPLAY_MS = 6500

export default function HeroSlider() {
    const [cur, setCur] = useState(0)
    const navigate = useNavigate()

    const go = useCallback((n) => setCur((n + SLIDES.length) % SLIDES.length), [])

    useEffect(() => {
        const t = setInterval(() => go(cur + 1), AUTOPLAY_MS)
        return () => clearInterval(t)
    }, [cur, go])

    const s = SLIDES[cur]

    return (
        <div className="hero" style={{ '--hero-bg': s.bg, '--btn-color': s.btnPrimary.color }}>
            <div className="hero__inner">
                {/* Contenido */}
                <div className="hero__content" key={`content-${cur}`}>
                    <span className="hero__tag" style={{ '--tag-bg': s.tagBg, '--tag-color': s.tagColor }}>{s.tag}</span>

                    <h1 className="hero__title">
                        {s.title.map((part, i) =>
                            i === s.titleEm
                                ? <em key={i} style={{ '--em-color': s.emColor }}>{part}</em>
                                : <span key={i}>{part}</span>
                        )}
                    </h1>

                    <p className="hero__sub">
                        {s.sub}
                    </p>

                    <div className="hero__buttons">
                        <button className="btn btn--primary"
                            style={{ '--btn-color': s.btnPrimary.color }}
                            onClick={() => navigate(s.btnPrimary.to)}>
                            {s.btnPrimary.label}
                        </button>
                        <button className="btn btn--ghost"
                            style={{ '--btn-color': s.btnGhost.color }}
                            onClick={() => navigate(s.btnGhost.to)}>
                            {s.btnGhost.label}
                        </button>
                    </div>
                </div>

                {/* Imagen */}
                <div className="hero__media">
                    <img src={s.image} alt={s.title.join('')} key={`media-${cur}`} />
                </div>
            </div>

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
                {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => go(i)} className={`hero__dot${cur === i ? ' hero__dot--active' : ''}`} />
                ))}
            </div>
        </div>
    )
}

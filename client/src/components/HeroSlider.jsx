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
        nails: ['#E91E8C', '#F06292', '#C2185B', '#F8BBD9', '#EC407A', '#AD1457'],
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
        nails: ['#FF8A65', '#FF7043', '#E64A19', '#FFCCBC', '#FF5722', '#BF360C'],
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
        nails: ['#9575CD', '#7E57C2', '#5E35B1', '#D1C4E9', '#7C4DFF', '#4527A0'],
    },
]

export default function HeroSlider() {
    const [cur, setCur] = useState(0)
    const navigate = useNavigate()

    const go = useCallback((n) => setCur((n + SLIDES.length) % SLIDES.length), [])

    useEffect(() => {
        const t = setInterval(() => go(cur + 1), 4500)
        return () => clearInterval(t)
    }, [cur, go])

    const s = SLIDES[cur]

    return (
        <div className="rn-hero-slider hero-slider" style={{ '--hero-bg': s.bg }}>
            <div className="rn-hero-inner hero-inner">
                {/* Contenido */}
                <div className="rn-hero-content hero-content">
                    <span className="hero-tag" style={{ '--tag-bg': s.tagBg, '--tag-color': s.tagColor }}>{s.tag}</span>

                    <h1 className="hero-title">
                        {s.title.map((part, i) =>
                            i === s.titleEm
                                ? <em key={i} style={{ '--em-color': s.emColor }}>{part}</em>
                                : <span key={i}>{part}</span>
                        )}
                    </h1>

                    <p className="hero-sub">
                        {s.sub}
                    </p>

                    <div className="rn-hero-buttons hero-buttons">
                        <button className="btn-primary"
                            style={{ '--btn-color': s.btnPrimary.color }}
                            onClick={() => navigate(s.btnPrimary.to)}>
                            {s.btnPrimary.label}
                        </button>
                        <button className="btn-ghost"
                            style={{ '--btn-color': s.btnGhost.color }}
                            onClick={() => navigate(s.btnGhost.to)}>
                            {s.btnGhost.label}
                        </button>
                    </div>
                </div>

                {/* Decoración de uñas */}
                <div className="rn-hero-nails hero-nails">
                    {[0, 1].map(col => (
                        <div key={col} className="hero-nails-col" style={{ marginTop: col * 28 }}>
                            {s.nails.slice(col * 3, col * 3 + 3).map((color, i) => (
                                <div key={i} className="hero-nail" style={{ '--nail-color': color }} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Flechas */}
            {['←', '→'].map((arrow, i) => (
                <button
                    key={arrow}
                    onClick={() => go(cur + (i === 0 ? -1 : 1))}
                    className={`hero-arrow ${i === 0 ? 'hero-arrow-left' : 'hero-arrow-right'}`}
                >{arrow}</button>
            ))}

            {/* Dots */}
            <div className="hero-dots">
                {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => go(i)} className={`hero-dot${cur === i ? ' active' : ''}`} />
                ))}
            </div>
        </div>
    )
}

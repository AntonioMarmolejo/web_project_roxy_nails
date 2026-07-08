import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    tag:      '✨ Más solicitado',
    tagBg:    '#F8C8DC', tagColor: '#88134A',
    title:    ['Manicure ', 'gel', ' que dura semanas'],
    titleEm:  1,
    emColor:  '#C2185B',
    sub:      'Colores que no se despegan, acabados que brillan. Tu estilo, sin preocupaciones.',
    bg:       'linear-gradient(135deg, #FDF0F5 55%, #F8C8DC 100%)',
    btnPrimary:  { label: 'Ver precios',    to: '/servicios', color: '#C2185B' },
    btnGhost:    { label: 'Agendar ahora',  to: '/agendar',   color: '#C2185B' },
    nails: ['#E91E8C','#F06292','#C2185B','#F8BBD9','#EC407A','#AD1457'],
  },
  {
    tag:      '🌸 Relajación total',
    tagBg:    '#FFE0D0', tagColor: '#993C1D',
    title:    ['Pedicure ', 'spa', ' con piedras calientes'],
    titleEm:  1,
    emColor:  '#D85A30',
    sub:      'Un ritual completo de cuidado desde la rodilla hasta las puntas.',
    bg:       'linear-gradient(135deg, #FFF5F0 55%, #FFD4C2 100%)',
    btnPrimary:  { label: 'Reservar',      to: '/agendar',   color: '#D85A30' },
    btnGhost:    { label: 'Ver detalles',  to: '/servicios', color: '#D85A30' },
    nails: ['#FF8A65','#FF7043','#E64A19','#FFCCBC','#FF5722','#BF360C'],
  },
  {
    tag:      '🎓 Próximo taller',
    tagBg:    '#E8DCFF', tagColor: '#534AB7',
    title:    ['Aprende ', 'nail art', ' desde cero'],
    titleEm:  1,
    emColor:  '#7F77DD',
    sub:      'Talleres presenciales y virtuales. Certificación incluida. ¡Plazas limitadas!',
    bg:       'linear-gradient(135deg, #F5F0FF 55%, #E0CEFF 100%)',
    btnPrimary:  { label: 'Ver talleres', to: '/talleres',  color: '#7F77DD' },
    btnGhost:    { label: 'Más info',     to: '/talleres',  color: '#7F77DD' },
    nails: ['#9575CD','#7E57C2','#5E35B1','#D1C4E9','#7C4DFF','#4527A0'],
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
    <div className="rn-hero-slider" style={{ position: 'relative', overflow: 'hidden', background: s.bg, transition: 'background 0.5s' }}>
      <div className="rn-hero-inner" style={{
        maxWidth: 1100, margin: '0 auto',
        height: '100%', display: 'flex', alignItems: 'center',
        padding: '0 4rem', position: 'relative',
      }}>
        {/* Contenido */}
        <div className="rn-hero-content" style={{ maxWidth: 500, zIndex: 2 }}>
          <span style={{
            fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', background: s.tagBg, color: s.tagColor,
            padding: '5px 16px', borderRadius: 20, display: 'inline-block', marginBottom: '1.25rem',
          }}>{s.tag}</span>

          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.18,
            fontWeight: 600, color: '#2D1520', marginBottom: '1rem',
          }}>
            {s.title.map((part, i) =>
              i === s.titleEm
                ? <em key={i} style={{ fontStyle: 'italic', color: s.emColor }}>{part}</em>
                : <span key={i}>{part}</span>
            )}
          </h1>

          <p style={{ fontSize: 16, color: '#6B4050', marginBottom: '2rem', lineHeight: 1.7, maxWidth: 400 }}>
            {s.sub}
          </p>

          <div className="rn-hero-buttons" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-primary"
              style={{ background: s.btnPrimary.color }}
              onClick={() => navigate(s.btnPrimary.to)}>
              {s.btnPrimary.label}
            </button>
            <button className="btn-ghost"
              style={{ color: s.btnGhost.color, borderColor: s.btnGhost.color }}
              onClick={() => navigate(s.btnGhost.to)}>
              {s.btnGhost.label}
            </button>
          </div>
        </div>

        {/* Decoración de uñas */}
        <div className="rn-hero-nails" style={{
          position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 16, opacity: 0.8,
        }}>
          {[0, 1].map(col => (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: col * 28 }}>
              {s.nails.slice(col * 3, col * 3 + 3).map((color, i) => (
                <div key={i} style={{
                  width: 52, height: 66, borderRadius: '50% 50% 40% 40%',
                  background: color, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Flechas */}
      {['←', '→'].map((arrow, i) => (
        <button key={arrow} onClick={() => go(cur + (i === 0 ? -1 : 1))} style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          [i === 0 ? 'left' : 'right']: '1rem',
          background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%',
          width: 42, height: 42, cursor: 'pointer',
          fontSize: 20, color: '#C2185B', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        }}>{arrow}</button>
      ))}

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 7,
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{
            width: cur === i ? 22 : 8, height: 8,
            borderRadius: cur === i ? 4 : '50%',
            background: cur === i ? '#C2185B' : 'rgba(194,24,91,0.3)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

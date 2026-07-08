import { useNavigate } from 'react-router-dom'

const ICONS = {
  manicure:    '💅',
  pedicure:    '🦶',
  'nail-art':  '🎨',
  extensiones: '💎',
  retiro:      '✨',
}

export default function ServiceCard({ service, onClick }) {
  const navigate = useNavigate()
  const icon = ICONS[service.category] || '💅'

  return (
    <div
      onClick={() => onClick ? onClick(service) : navigate('/agendar')}
      style={{
        background: '#fff', border: '1px solid #F0D0DC',
        borderRadius: 18, padding: '1.5rem 1.25rem',
        cursor: 'pointer', textAlign: 'center',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#C2185B'
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(194,24,91,0.13)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#F0D0DC'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 66, height: 66, borderRadius: '50%',
        background: '#FDF0F5', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 0.9rem', fontSize: 28,
      }}>{icon}</div>

      <div style={{ fontSize: 15, fontWeight: 500, color: '#2D1520', marginBottom: 5 }}>
        {service.name}
      </div>

      {service.description && (
        <div style={{ fontSize: 13, color: '#9E7080', marginBottom: 8, lineHeight: 1.55 }}>
          {service.description}
        </div>
      )}

      <div style={{ fontSize: 17, color: '#C2185B', fontWeight: 700, marginBottom: 6 }}>
        desde ${service.price}
      </div>

      <div style={{ fontSize: 12, color: '#9E7080' }}>
        {service.duration} min
      </div>

      {service.featured && (
        <span style={{
          display: 'inline-block', marginTop: 10,
          fontSize: 11, padding: '4px 12px', borderRadius: 12,
          background: '#F8C8DC', color: '#88134A', fontWeight: 600,
        }}>⭐ Destacado</span>
      )}
    </div>
  )
}

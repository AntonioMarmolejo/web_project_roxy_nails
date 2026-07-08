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
        borderRadius: 16, padding: '1.25rem',
        cursor: 'pointer', textAlign: 'center',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#C2185B'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(194,24,91,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#F0D0DC'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#FDF0F5', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 0.75rem', fontSize: 24,
      }}>{icon}</div>

      <div style={{ fontSize: 14, fontWeight: 500, color: '#2D1520', marginBottom: 4 }}>
        {service.name}
      </div>

      {service.description && (
        <div style={{ fontSize: 12, color: '#9E7080', marginBottom: 6, lineHeight: 1.5 }}>
          {service.description}
        </div>
      )}

      <div style={{ fontSize: 14, color: '#C2185B', fontWeight: 600, marginBottom: 6 }}>
        desde ${service.price}
      </div>

      <div style={{ fontSize: 11, color: '#9E7080' }}>
        {service.duration} min
      </div>

      {service.featured && (
        <span style={{
          display: 'inline-block', marginTop: 8,
          fontSize: 10, padding: '3px 10px', borderRadius: 10,
          background: '#F8C8DC', color: '#88134A', fontWeight: 500,
        }}>⭐ Destacado</span>
      )}
    </div>
  )
}

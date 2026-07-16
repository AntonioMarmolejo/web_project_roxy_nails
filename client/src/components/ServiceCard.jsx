import { useNavigate } from 'react-router-dom'
import '../styles/ServiceCard.css'

const ICONS = {
    manicure: '💅',
    pedicure: '🦶',
    'nail-art': '🎨',
    extensiones: '💎',
    retiro: '✨',
}

export default function ServiceCard({ service, onClick }) {
    const navigate = useNavigate()
    const icon = ICONS[service.category] || '💅'

    return (
        <div className="service-card" onClick={() => onClick ? onClick(service) : navigate('/agendar')}>
            <div className="service-card-icon">{icon}</div>

            <div className="service-card-name">
                {service.name}
            </div>

            {service.description && (
                <div className="service-card-desc">
                    {service.description}
                </div>
            )}

            <div className="service-card-price">
                desde ${service.price}
            </div>

            <div className="service-card-duration">
                {service.duration} min
            </div>

            {service.featured && (
                <span className="service-card-featured">⭐ Destacado</span>
            )}
        </div>
    )
}

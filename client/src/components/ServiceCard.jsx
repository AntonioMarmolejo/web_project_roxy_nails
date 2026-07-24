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
            <div className="service-card__image">
                {service.image ? <img src={service.image} alt={service.name} /> : icon}
                {service.featured && (
                    <span className="service-card__featured">⭐ Destacado</span>
                )}
            </div>

            <div className="service-card__body">
                <div className="service-card__name">
                    {service.name}
                </div>

                {service.description && (
                    <div className="service-card__desc">
                        {service.description}
                    </div>
                )}

                <div className="service-card__footer">
                    <span className="service-card__price">
                        desde ${service.price}
                    </span>
                    <span className="service-card__duration">
                        {service.duration} min
                    </span>
                </div>
            </div>
        </div>
    )
}

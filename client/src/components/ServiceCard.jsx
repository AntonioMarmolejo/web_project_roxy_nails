import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikeButton from './LikeButton'
import '../styles/ServiceCard.css'

const ICONS = {
    manicure: '💅',
    pedicure: '🦶',
    'nail-art': '🎨',
    extensiones: '💎',
    retiro: '✨',
}

const CLOSE_MS = 350

export default function ServiceCard({ service, onClick }) {
    const navigate = useNavigate()
    const icon = ICONS[service.category] || '💅'
    const [open, setOpen] = useState(false)
    const [visible, setVisible] = useState(false)

    const descItems = service.description
        ? service.description.split(',').map(s => s.trim()).filter(Boolean)
        : []

    const openModal = () => {
        setOpen(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }

    const closeModal = () => {
        setVisible(false)
        setTimeout(() => setOpen(false), CLOSE_MS)
    }

    useEffect(() => {
        if (!open) return
        document.body.style.overflow = 'hidden'
        const onKeyDown = (e) => { if (e.key === 'Escape') closeModal() }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    const handleBook = () => {
        onClick ? onClick(service) : navigate('/agendar', { state: { serviceId: service._id } })
    }

    return (
        <>
            <div className="service-card" onClick={openModal}>
                <LikeButton id={service._id} />
                <div className="service-card__image">
                    {service.image ? <img src={service.image} alt={service.name} /> : icon}
                    {service.featured && (
                        <span className="service-card__featured">⭐ Destacado</span>
                    )}
                </div>
                <div className="service-card__name">
                    {service.name}
                </div>
            </div>

            {open && (
                <div className={`service-modal${visible ? ' service-modal--visible' : ''}`}>
                    <div className="service-modal__backdrop" onClick={closeModal} />

                    <div className="service-modal__panel">
                        <button className="service-modal__close" onClick={closeModal} aria-label="Cerrar">
                            ✕
                        </button>

                        <div className="service-modal__image">
                            {service.image ? <img src={service.image} alt={service.name} /> : icon}
                        </div>

                        <div className="service-modal__body">
                            <h3 className="service-modal__name">{service.name}</h3>

                            {descItems.length > 0 && (
                                <ul className="service-modal__list">
                                    {descItems.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            )}

                            <div className="service-modal__footer">
                                <span className="service-modal__price">
                                    desde ${service.price}
                                </span>
                                <span className="service-modal__duration">
                                    {service.duration} min
                                </span>
                            </div>

                            <button className="service-modal__book-btn" onClick={handleBook}>
                                Agendar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

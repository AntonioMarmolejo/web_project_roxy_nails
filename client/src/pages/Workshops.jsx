import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { fetchWorkshops, likeWorkshop } from '../api/workshops'
import LikeButton from '../components/LikeButton'
import PageHeader from '../components/PageHeader'
import '../styles/Workshops.css'

const CLOSE_MS = 350

export default function Workshops() {
    const [workshops, setWorkshops] = useState([])
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        fetchWorkshops()
            .then(({ data }) => setWorkshops(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <Helmet>
                <title>Talleres — Roxy Nails</title>
                <meta name="description" content="Aprende técnicas de manicure y nail art en nuestros talleres." />
            </Helmet>

            <PageHeader
                label="Aprende con nosotras"
                title="Talleres"
                subtitle="Cupos limitados. Inscríbete antes de que se agoten."
            />

            <div className="workshops__grid-section">
                {loading ? (
                    <p className="workshops__loading">
                        Cargando talleres...
                    </p>
                ) : workshops.length === 0 ? (
                    <div className="workshops__empty">
                        <div className="workshops__empty-icon">🎓</div>
                        <p>No hay talleres programados por ahora. ¡Vuelve pronto!</p>
                    </div>
                ) : (
                    <div className="catalog-grid">
                        {workshops.map(w => <WorkshopCard key={w._id} workshop={w} />)}
                    </div>
                )}
            </div>
        </>
    )
}

function WorkshopCard({ workshop }) {
    const full = workshop.spotsLeft <= 0
    const lowSpots = !full && workshop.spotsLeft <= 3
    const dateStr = new Date(workshop.date).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
    })

    const [open, setOpen] = useState(false)
    const [visible, setVisible] = useState(false)

    const descItems = workshop.description
        ? workshop.description.split(',').map(s => s.trim()).filter(Boolean)
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

    return (
        <>
            <div className="workshop-card" onClick={openModal}>
                <div className="workshop-card__image">
                    <LikeButton
                        id={workshop._id}
                        count={workshop.likes}
                        showCount
                        className="workshop-card__like"
                        onLike={(liked) => likeWorkshop(workshop._id, liked ? 1 : -1).catch(() => {})}
                    />
                    {workshop.image
                        ? <img src={workshop.image} alt={workshop.title} />
                        : '🎓'
                    }
                    {full && (
                        <div className="workshop-card__badge workshop-card__badge--full">
                            Cupos agotados
                        </div>
                    )}
                    {lowSpots && (
                        <div className="workshop-card__badge workshop-card__badge--low-spots">
                            ¡Últimos {workshop.spotsLeft} cupos!
                        </div>
                    )}
                </div>
                <div className="workshop-card__title">
                    {workshop.title}
                </div>
            </div>

            {open && (
                <div className={`workshop-modal${visible ? ' workshop-modal--visible' : ''}`}>
                    <div className="workshop-modal__backdrop" onClick={closeModal} />

                    <div className="workshop-modal__panel">
                        <button className="workshop-modal__close" onClick={closeModal} aria-label="Cerrar">
                            ✕
                        </button>

                        <div className="workshop-modal__image">
                            {workshop.image
                                ? <img src={workshop.image} alt={workshop.title} />
                                : '🎓'
                            }
                        </div>

                        <div className="workshop-modal__body">
                            <span className="workshop-modal__meta">
                                {workshop.modality === 'virtual' ? 'Virtual' : 'Presencial'} · {dateStr}
                            </span>
                            <h3 className="workshop-modal__name">{workshop.title}</h3>

                            {descItems.length > 0 && (
                                <ul className="workshop-modal__list">
                                    {descItems.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            )}

                            <div className="workshop-modal__footer">
                                <span className="workshop-modal__price">
                                    ${workshop.price}
                                </span>
                                <span className="workshop-modal__spots">
                                    {full ? 'Sin cupos' : `${workshop.spotsLeft} cupos disponibles`}
                                </span>
                            </div>

                            {full ? (
                                <button disabled className="workshop-modal__btn">
                                    Agotado
                                </button>
                            ) : (
                                <Link to={`/talleres/${workshop._id}/inscripcion`}>
                                    <button className="workshop-modal__btn">
                                        Inscribirme
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

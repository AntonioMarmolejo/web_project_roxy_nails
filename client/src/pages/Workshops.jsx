import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { fetchWorkshops } from '../api/workshops'
import '../styles/Workshops.css'

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

            <div className="workshops__header">
                <p className="workshops__header-label">
                    Aprende con nosotras
                </p>
                <h1 className="workshops__header-title">Talleres</h1>
                <p className="workshops__header-sub">Cupos limitados. Inscríbete antes de que se agoten.</p>
            </div>

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
    const dateStr = new Date(workshop.date).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
    })

    return (
        <div className="workshop-card">
            <div className="workshop-card__image">
                {workshop.image
                    ? <img src={workshop.image} alt={workshop.title} />
                    : '🎓'
                }
                {full && (
                    <div className="workshop-card__badge workshop-card__badge--full">
                        Cupos agotados
                    </div>
                )}
                {!full && workshop.spotsLeft <= 3 && (
                    <div className="workshop-card__badge workshop-card__badge--low-spots">
                        ¡Últimos {workshop.spotsLeft} cupos!
                    </div>
                )}
            </div>

            <div className="workshop-card__info">
                <span className="workshop-card__meta">
                    {workshop.modality === 'virtual' ? 'Virtual' : 'Presencial'} · {dateStr}
                </span>
                <h3 className="workshop-card__title">
                    {workshop.title}
                </h3>
                {workshop.description && (
                    <p className="workshop-card__desc">
                        {workshop.description}
                    </p>
                )}
                <div className="workshop-card__footer">
                    <span className="workshop-card__price">
                        ${workshop.price}
                    </span>
                    {full ? (
                        <button disabled className="workshop-card__btn">
                            Agotado
                        </button>
                    ) : (
                        <Link to={`/talleres/${workshop._id}/inscripcion`}>
                            <button className="workshop-card__btn">
                                Inscribirme
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

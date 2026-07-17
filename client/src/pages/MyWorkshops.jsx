import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link }   from 'react-router-dom'
import { fetchMyEnrollments } from '../api/enrollments'
import '../styles/MyWorkshops.css'

const STATUS = {
    pending:   { label: 'Pendiente', bg: '#FFF8E1', color: '#E65100' },
    paid:      { label: 'Pagado',    bg: '#E8F5E9', color: '#2E7D32' },
    cancelled: { label: 'Cancelado', bg: '#F5F5F5', color: '#757575' },
}

export default function MyWorkshops() {
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMyEnrollments()
            .then(({ data }) => setEnrollments(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <Helmet>
                <title>Mis talleres — Roxy Nails</title>
                <meta name="description" content="Historial de tus inscripciones a talleres en Roxy Nails." />
            </Helmet>

            <div className="myworkshops__header">
                <p className="myworkshops__header-label">
                    Mi historial
                </p>
                <h1 className="myworkshops__header-title">Mis talleres</h1>
                <p className="myworkshops__header-sub">Talleres en los que te has inscrito.</p>
            </div>

            <div className="myworkshops__container">
                {loading ? (
                    <p className="myworkshops__loading">
                        Cargando talleres...
                    </p>
                ) : enrollments.length === 0 ? (
                    <div className="myworkshops__empty">
                        <div className="myworkshops__empty-icon">🎓</div>
                        <h3 className="myworkshops__empty-title">Aún no te has inscrito a ningún taller</h3>
                        <p className="myworkshops__empty-sub">
                            Explora los talleres disponibles y reserva tu cupo.
                        </p>
                        <Link to="/talleres">
                            <button className="btn btn--primary" style={{ width: 'auto', padding: '13px 32px' }}>
                                Ver talleres
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="myworkshops__list">
                        {enrollments.map(en => {
                            const st = STATUS[en.status] || STATUS.pending
                            const dateStr = new Date(en.date).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })
                            return (
                                <div key={en._id} className="myworkshops__card">
                                    <div className="myworkshops__card-header">
                                        <span className="myworkshops__title">{en.title}</span>
                                        <span className="myworkshops__status-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <div className="myworkshops__date">
                                        📅 {dateStr}
                                    </div>

                                    <div className="myworkshops__total-row">
                                        <span className="myworkshops__total-label">Precio</span>
                                        <span className="myworkshops__total-value">
                                            ${en.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {enrollments.length > 0 && (
                    <div className="myworkshops__cta">
                        <Link to="/talleres">
                            <button className="btn btn--ghost" style={{ width: 'auto' }}>Ver más talleres</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

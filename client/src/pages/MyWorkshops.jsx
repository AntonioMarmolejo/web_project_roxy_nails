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

            <div className="myworkshops-header">
                <p className="myworkshops-header-label">
                    Mi historial
                </p>
                <h1 className="myworkshops-header-title">Mis talleres</h1>
                <p className="myworkshops-header-sub">Talleres en los que te has inscrito.</p>
            </div>

            <div className="myworkshops-container">
                {loading ? (
                    <p className="myworkshops-loading">
                        Cargando talleres...
                    </p>
                ) : enrollments.length === 0 ? (
                    <div className="myworkshops-empty">
                        <div className="myworkshops-empty-icon">🎓</div>
                        <h3 className="myworkshops-empty-title">Aún no te has inscrito a ningún taller</h3>
                        <p className="myworkshops-empty-sub">
                            Explora los talleres disponibles y reserva tu cupo.
                        </p>
                        <Link to="/talleres">
                            <button className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                                Ver talleres
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="myworkshops-list">
                        {enrollments.map(en => {
                            const st = STATUS[en.status] || STATUS.pending
                            const dateStr = new Date(en.date).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })
                            return (
                                <div key={en._id} className="myworkshops-card">
                                    <div className="myworkshops-card-header">
                                        <span className="myworkshops-title">{en.title}</span>
                                        <span className="myworkshops-status-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <div className="myworkshops-date">
                                        📅 {dateStr}
                                    </div>

                                    <div className="myworkshops-total-row">
                                        <span className="myworkshops-total-label">Precio</span>
                                        <span className="myworkshops-total-value">
                                            ${en.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {enrollments.length > 0 && (
                    <div className="myworkshops-cta">
                        <Link to="/talleres">
                            <button className="btn-ghost" style={{ width: 'auto' }}>Ver más talleres</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

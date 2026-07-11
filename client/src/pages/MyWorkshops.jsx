import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link }   from 'react-router-dom'
import { fetchMyEnrollments } from '../api/enrollments'

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

            <div style={{ background: '#FDF0F5', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 8 }}>
                    Mi historial
                </p>
                <h1 style={{ fontSize: 34, marginBottom: 8 }}>Mis talleres</h1>
                <p style={{ fontSize: 15, color: '#9E7080' }}>Talleres en los que te has inscrito.</p>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#9E7080', padding: '3rem 0', fontSize: 15 }}>
                        Cargando talleres...
                    </p>
                ) : enrollments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: 52, marginBottom: '1.25rem' }}>🎓</div>
                        <h3 style={{ fontSize: 22, color: '#2D1520', marginBottom: 10 }}>Aún no te has inscrito a ningún taller</h3>
                        <p style={{ fontSize: 15, color: '#9E7080', marginBottom: '2rem' }}>
                            Explora los talleres disponibles y reserva tu cupo.
                        </p>
                        <Link to="/talleres">
                            <button className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                                Ver talleres
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {enrollments.map(en => {
                            const st = STATUS[en.status] || STATUS.pending
                            const dateStr = new Date(en.date).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })
                            return (
                                <div key={en._id} style={{
                                    background: '#fff', border: '1px solid #F0D0DC',
                                    borderRadius: 16, padding: '1.25rem 1.5rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>{en.title}</span>
                                        <span style={{
                                            fontSize: 11, padding: '4px 12px', borderRadius: 20,
                                            background: st.bg, color: st.color, fontWeight: 600,
                                        }}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: 13, color: '#9E7080', marginBottom: 10 }}>
                                        📅 {dateStr}
                                    </div>

                                    <div style={{ borderTop: '1px solid #F0D0DC', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: 13, color: '#6B4050' }}>Precio</span>
                                        <span style={{ fontSize: 17, fontWeight: 700, color: '#C2185B' }}>
                                            ${en.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {enrollments.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <Link to="/talleres">
                            <button className="btn-ghost" style={{ width: 'auto' }}>Ver más talleres</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

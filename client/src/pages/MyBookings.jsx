import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { fetchMyBookings, cancelMyBooking } from '../api/bookings'
import '../styles/MyBookings.css'

const STATUS = {
    pending: { label: 'Pendiente', bg: '#FFF8E1', color: '#E65100' },
    confirmed: { label: 'Confirmada', bg: '#E8F5E9', color: '#2E7D32' },
    completed: { label: 'Completada', bg: '#E3F2FD', color: '#1565C0' },
    cancelled: { label: 'Cancelada', bg: '#F5F5F5', color: '#757575' },
}

export default function MyBookings() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(null)

    useEffect(() => {
        fetchMyBookings()
            .then(({ data }) => setBookings(data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleCancel = async (id) => {
        if (!window.confirm('¿Cancelar esta cita?')) return
        setCancelling(id)
        try {
            await cancelMyBooking(id)
            setBookings(b => b.map(x => x._id === id ? { ...x, status: 'cancelled' } : x))
        } catch (err) {
            alert(err.response?.data?.message || 'No se pudo cancelar. Intenta de nuevo.')
        } finally {
            setCancelling(null)
        }
    }

    return (
        <>
            <Helmet>
                <title>Mis citas — Roxy Nails</title>
                <meta name="description" content="Historial y gestión de tus citas en Roxy Nails." />
            </Helmet>

            <div className="mybookings__header">
                <p className="mybookings__header-label">
                    Mi historial
                </p>
                <h1 className="mybookings__header-title">Mis citas</h1>
                <p className="mybookings__header-sub">Aquí aparecen todas tus reservas.</p>
            </div>

            <div className="mybookings__container">
                {loading ? (
                    <p className="mybookings__loading">
                        Cargando citas...
                    </p>
                ) : bookings.length === 0 ? (
                    <div className="mybookings__empty">
                        <div className="mybookings__empty-icon">💅</div>
                        <h3 className="mybookings__empty-title">Aún no tienes citas</h3>
                        <p className="mybookings__empty-sub">
                            Cuando agendes, aparecerán aquí con todos los detalles.
                        </p>
                        <Link to="/agendar">
                            <button className="btn btn--primary" style={{ width: 'auto', padding: '13px 32px' }}>
                                Agendar mi primera cita
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="mybookings__list">
                        {bookings.map(b => {
                            const st = STATUS[b.status] || STATUS.pending
                            const canCancel = ['pending', 'confirmed'].includes(b.status)
                            const dateStr = new Date(b.date).toLocaleDateString('es-ES', {
                                weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC',
                            })
                            return (
                                <div key={b._id} className="mybookings__card">
                                    <div className="mybookings__card-main">
                                        <div className="mybookings__card-title-row">
                                            <span className="mybookings__service-name">
                                                {b.service?.name || '—'}
                                            </span>
                                            <span className="mybookings__status-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <div className="mybookings__meta-row">
                                            <span>📅 {dateStr}</span>
                                            <span>🕐 {b.timeSlot}</span>
                                            {b.service?.price && <span className="mybookings__meta-price">💰 ${b.service.price}</span>}
                                        </div>
                                        {b.notes && (
                                            <p className="mybookings__notes">
                                                "{b.notes}"
                                            </p>
                                        )}
                                    </div>
                                    {canCancel && (
                                        <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id} className="mybookings__cancel-btn">
                                            {cancelling === b._id ? '...' : 'Cancelar'}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {bookings.length > 0 && (
                    <div className="mybookings__cta">
                        <Link to="/agendar">
                            <button className="btn btn--ghost" style={{ width: 'auto' }}>+ Nueva cita</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

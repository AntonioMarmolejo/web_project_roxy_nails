import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { fetchMyBookings, cancelMyBooking } from '../api/bookings'

const STATUS = {
  pending:   { label: 'Pendiente',   bg: '#FFF8E1', color: '#E65100' },
  confirmed: { label: 'Confirmada',  bg: '#E8F5E9', color: '#2E7D32' },
  completed: { label: 'Completada',  bg: '#E3F2FD', color: '#1565C0' },
  cancelled: { label: 'Cancelada',   bg: '#F5F5F5', color: '#757575' },
}

export default function MyBookings() {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => {})
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

      <div style={{ background: '#FDF0F5', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
        <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 8 }}>
          Mi historial
        </p>
        <h1 style={{ fontSize: 34, marginBottom: 8 }}>Mis citas</h1>
        <p style={{ fontSize: 15, color: '#9E7080' }}>Aquí aparecen todas tus reservas.</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9E7080', padding: '3rem 0', fontSize: 15 }}>
            Cargando citas...
          </p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: 52, marginBottom: '1.25rem' }}>💅</div>
            <h3 style={{ fontSize: 22, color: '#2D1520', marginBottom: 10 }}>Aún no tienes citas</h3>
            <p style={{ fontSize: 15, color: '#9E7080', marginBottom: '2rem' }}>
              Cuando agendes, aparecerán aquí con todos los detalles.
            </p>
            <Link to="/agendar">
              <button className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                Agendar mi primera cita
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map(b => {
              const st = STATUS[b.status] || STATUS.pending
              const canCancel = ['pending', 'confirmed'].includes(b.status)
              const dateStr   = new Date(b.date).toLocaleDateString('es-ES', {
                weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC',
              })
              return (
                <div key={b._id} style={{
                  background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16,
                  padding: '1.25rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#2D1520' }}>
                        {b.service?.name || '—'}
                      </span>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                        background: st.bg, color: st.color, fontWeight: 600,
                      }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#9E7080', flexWrap: 'wrap' }}>
                      <span>📅 {dateStr}</span>
                      <span>🕐 {b.timeSlot}</span>
                      {b.service?.price && <span style={{ color: '#C2185B', fontWeight: 500 }}>💰 ${b.service.price}</span>}
                    </div>
                    {b.notes && (
                      <p style={{ fontSize: 12, color: '#9E7080', marginTop: 8, fontStyle: 'italic' }}>
                        "{b.notes}"
                      </p>
                    )}
                  </div>
                  {canCancel && (
                    <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id} style={{
                      background: 'transparent', border: '1px solid #F0D0DC',
                      color: '#9E7080', borderRadius: 8, padding: '7px 16px',
                      fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      flexShrink: 0,
                    }}>
                      {cancelling === b._id ? '...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {bookings.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/agendar">
              <button className="btn-ghost" style={{ width: 'auto' }}>+ Nueva cita</button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

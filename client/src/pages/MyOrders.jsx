import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link }   from 'react-router-dom'
import { fetchMyOrders } from '../api/orders'

const STATUS = {
    pending:   { label: 'Pendiente',   bg: '#FFF8E1', color: '#E65100' },
    paid:      { label: 'Pagado',      bg: '#E8F5E9', color: '#2E7D32' },
    shipped:   { label: 'En camino',   bg: '#E3F2FD', color: '#1565C0' },
    delivered: { label: 'Entregado',   bg: '#F3E5F5', color: '#6A1B9A' },
    cancelled: { label: 'Cancelado',   bg: '#F5F5F5', color: '#757575' },
}

export default function MyOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMyOrders()
            .then(({ data }) => setOrders(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <Helmet>
                <title>Mis pedidos — Roxy Nails</title>
                <meta name="description" content="Historial de tus compras en Roxy Nails." />
            </Helmet>

            <div style={{ background: '#FDF0F5', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 8 }}>
                    Mi historial
                </p>
                <h1 style={{ fontSize: 34, marginBottom: 8 }}>Mis pedidos</h1>
                <p style={{ fontSize: 15, color: '#9E7080' }}>Seguimiento y detalle de tus compras.</p>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#9E7080', padding: '3rem 0', fontSize: 15 }}>
                        Cargando pedidos...
                    </p>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: 52, marginBottom: '1.25rem' }}>📦</div>
                        <h3 style={{ fontSize: 22, color: '#2D1520', marginBottom: 10 }}>Aún no tienes pedidos</h3>
                        <p style={{ fontSize: 15, color: '#9E7080', marginBottom: '2rem' }}>
                            Explora la tienda y haz tu primera compra.
                        </p>
                        <Link to="/tienda">
                            <button className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                                Ir a la tienda
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {orders.map(order => {
                            const st = STATUS[order.status] || STATUS.pending
                            const dateStr = new Date(order.createdAt).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })
                            return (
                                <div key={order._id} style={{
                                    background: '#fff', border: '1px solid #F0D0DC',
                                    borderRadius: 16, padding: '1.25rem 1.5rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 13, color: '#9E7080' }}>{dateStr}</span>
                                        <span style={{
                                            fontSize: 11, padding: '4px 12px', borderRadius: 20,
                                            background: st.bg, color: st.color, fontWeight: 600,
                                        }}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B4050' }}>
                                                <span>{item.name} <span style={{ color: '#9E7080' }}>×{item.qty}</span></span>
                                                <span>${(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid #F0D0DC', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: 13, color: '#6B4050' }}>Total</span>
                                        <span style={{ fontSize: 17, fontWeight: 700, color: '#C2185B' }}>
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {orders.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <Link to="/tienda">
                            <button className="btn-ghost" style={{ width: 'auto' }}>Seguir comprando</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

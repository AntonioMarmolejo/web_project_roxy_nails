import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link }   from 'react-router-dom'
import { fetchMyOrders } from '../api/orders'
import '../styles/MyOrders.css'

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

            <div className="myorders-header">
                <p className="myorders-header-label">
                    Mi historial
                </p>
                <h1 className="myorders-header-title">Mis pedidos</h1>
                <p className="myorders-header-sub">Seguimiento y detalle de tus compras.</p>
            </div>

            <div className="myorders-container">
                {loading ? (
                    <p className="myorders-loading">
                        Cargando pedidos...
                    </p>
                ) : orders.length === 0 ? (
                    <div className="myorders-empty">
                        <div className="myorders-empty-icon">📦</div>
                        <h3 className="myorders-empty-title">Aún no tienes pedidos</h3>
                        <p className="myorders-empty-sub">
                            Explora la tienda y haz tu primera compra.
                        </p>
                        <Link to="/tienda">
                            <button className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                                Ir a la tienda
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="myorders-list">
                        {orders.map(order => {
                            const st = STATUS[order.status] || STATUS.pending
                            const dateStr = new Date(order.createdAt).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })
                            return (
                                <div key={order._id} className="myorders-card">
                                    <div className="myorders-card-header">
                                        <span className="myorders-date">{dateStr}</span>
                                        <span className="myorders-status-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <div className="myorders-items">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="myorders-item-row">
                                                <span>{item.name} <span className="myorders-item-qty">×{item.qty}</span></span>
                                                <span>${(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="myorders-total-row">
                                        <span className="myorders-total-label">Total</span>
                                        <span className="myorders-total-value">
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {orders.length > 0 && (
                    <div className="myorders-cta">
                        <Link to="/tienda">
                            <button className="btn-ghost" style={{ width: 'auto' }}>Seguir comprando</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

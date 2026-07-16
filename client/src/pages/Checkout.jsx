import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useCartStore }  from '../store/useCartStore'
import { useAuthStore }  from '../store/useAuthStore'
import { createOrder }   from '../api/orders'
import '../styles/Checkout.css'

export default function Checkout() {
    const { items, total, clearCart } = useCartStore()
    const { user }   = useAuthStore()
    const navigate   = useNavigate()

    const [form, setForm] = useState({
        name:    user?.name  || '',
        email:   user?.email || '',
        phone:   user?.phone || '',
        address: '',
        notes:   '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')
    const [success, setSuccess]       = useState(null)

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const payload = {
                items: items.map(i => ({ product: i._id, qty: i.qty })),
                client: {
                    name:    form.name,
                    email:   form.email,
                    phone:   form.phone,
                    address: form.address,
                },
                notes:         form.notes,
                paymentMethod: 'cod',
            }
            const { data } = await createOrder(payload)
            clearCart()
            setSuccess(data)
        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar el pedido. Intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    // Carrito vacío (sin pedido confirmado)
    if (items.length === 0 && !success) {
        return (
            <div className="checkout-empty">
                <div className="checkout-empty-icon">🛒</div>
                <h2 className="checkout-empty-title">Tu carrito está vacío</h2>
                <p className="checkout-empty-sub">Agrega productos antes de continuar.</p>
                <button onClick={() => navigate('/tienda')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver tienda
                </button>
            </div>
        )
    }

    // Pedido confirmado
    if (success) {
        return (
            <div className="checkout-success">
                <div className="checkout-success-icon">🎉</div>
                <h2 className="checkout-success-title">
                    ¡Pedido realizado!
                </h2>
                <p className="checkout-success-sub">
                    Hemos recibido tu pedido. Te contactaremos pronto para coordinar la entrega.
                </p>

                <div className="checkout-success-box">
                    <div className="checkout-success-details">
                        <span><strong>Cliente:</strong> {success.client.name}</span>
                        <span><strong>Correo:</strong> {success.client.email}</span>
                        <span>
                            <strong>Total:</strong>{' '}
                            <span className="checkout-success-total">${success.total.toFixed(2)}</span>
                        </span>
                        <span><strong>Pago:</strong> En tienda / al retirar</span>
                    </div>
                </div>

                <button onClick={() => navigate('/tienda')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Seguir comprando
                </button>
                {user && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate('/mis-pedidos')} className="checkout-success-link-btn">
                            Ver mis pedidos
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>Checkout — Roxy Nails</title>
            </Helmet>

            <div className="checkout-page-header">
                <h1 className="checkout-page-title">
                    Finalizar compra
                </h1>
            </div>

            <div className="rn-checkout-grid checkout-grid">
                {/* Formulario */}
                <form onSubmit={handleSubmit} className="checkout-form">
                    <h2 className="checkout-form-title">
                        Datos de entrega
                    </h2>

                    <div className="checkout-fields">
                        {[
                            { name: 'name',    label: 'Nombre completo *',       placeholder: 'Tu nombre',           required: true },
                            { name: 'email',   label: 'Correo electrónico *',    placeholder: 'correo@ejemplo.com',  required: true, type: 'email' },
                            { name: 'phone',   label: 'Teléfono',                placeholder: '0912 345 678' },
                            { name: 'address', label: 'Dirección / punto de retiro', placeholder: 'Calle, sector, ciudad' },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="checkout-label">{f.label}</label>
                                <input
                                    name={f.name} type={f.type || 'text'}
                                    value={form[f.name]} onChange={handleChange}
                                    placeholder={f.placeholder} required={f.required}
                                    className="checkout-input"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="checkout-label">Notas del pedido</label>
                            <textarea
                                name="notes" value={form.notes} onChange={handleChange}
                                rows={3} placeholder="Instrucciones especiales, horario de entrega..."
                                className="checkout-input" style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="checkout-payment-box">
                        <p className="checkout-payment-title">Método de pago</p>
                        <div className="checkout-payment-row">
                            <span style={{ fontSize: 18 }}>💵</span>
                            Pago al retirar / en tienda
                        </div>
                    </div>

                    {error && (
                        <p className="checkout-error">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                        {submitting ? 'Procesando...' : 'Confirmar pedido'}
                    </button>
                </form>

                {/* Resumen del pedido */}
                <div className="rn-order-summary checkout-summary">
                    <h2 className="checkout-summary-title">
                        Tu pedido ({items.length})
                    </h2>

                    <div className="checkout-summary-items">
                        {items.map(item => (
                            <div key={item._id} className="checkout-summary-item">
                                <span className="checkout-summary-item-name">
                                    {item.name}
                                    <span className="checkout-summary-item-qty"> ×{item.qty}</span>
                                </span>
                                <span className="checkout-summary-item-price">
                                    ${(item.price * item.qty).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-summary-total-row">
                        <span className="checkout-summary-total-label">Total</span>
                        <span className="checkout-summary-total-value">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

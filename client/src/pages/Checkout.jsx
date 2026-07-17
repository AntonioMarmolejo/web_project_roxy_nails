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
            <div className="checkout__empty">
                <div className="checkout__empty-icon">🛒</div>
                <h2 className="checkout__empty-title">Tu carrito está vacío</h2>
                <p className="checkout__empty-sub">Agrega productos antes de continuar.</p>
                <button onClick={() => navigate('/tienda')} className="btn btn--primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver tienda
                </button>
            </div>
        )
    }

    // Pedido confirmado
    if (success) {
        return (
            <div className="checkout__success">
                <div className="checkout__success-icon">🎉</div>
                <h2 className="checkout__success-title">
                    ¡Pedido realizado!
                </h2>
                <p className="checkout__success-sub">
                    Hemos recibido tu pedido. Te contactaremos pronto para coordinar la entrega.
                </p>

                <div className="checkout__success-box">
                    <div className="checkout__success-details">
                        <span><strong>Cliente:</strong> {success.client.name}</span>
                        <span><strong>Correo:</strong> {success.client.email}</span>
                        <span>
                            <strong>Total:</strong>{' '}
                            <span className="checkout__success-total">${success.total.toFixed(2)}</span>
                        </span>
                        <span><strong>Pago:</strong> En tienda / al retirar</span>
                    </div>
                </div>

                <button onClick={() => navigate('/tienda')} className="btn btn--primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Seguir comprando
                </button>
                {user && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate('/mis-pedidos')} className="checkout__success-link-btn">
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

            <div className="checkout__page-header">
                <h1 className="checkout__page-title">
                    Finalizar compra
                </h1>
            </div>

            <div className="checkout__grid">
                {/* Formulario */}
                <form onSubmit={handleSubmit} className="checkout__form">
                    <h2 className="checkout__form-title">
                        Datos de entrega
                    </h2>

                    <div className="checkout__fields">
                        {[
                            { name: 'name',    label: 'Nombre completo *',       placeholder: 'Tu nombre',           required: true },
                            { name: 'email',   label: 'Correo electrónico *',    placeholder: 'correo@ejemplo.com',  required: true, type: 'email' },
                            { name: 'phone',   label: 'Teléfono',                placeholder: '0912 345 678' },
                            { name: 'address', label: 'Dirección / punto de retiro', placeholder: 'Calle, sector, ciudad' },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="checkout__label">{f.label}</label>
                                <input
                                    name={f.name} type={f.type || 'text'}
                                    value={form[f.name]} onChange={handleChange}
                                    placeholder={f.placeholder} required={f.required}
                                    className="checkout__input"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="checkout__label">Notas del pedido</label>
                            <textarea
                                name="notes" value={form.notes} onChange={handleChange}
                                rows={3} placeholder="Instrucciones especiales, horario de entrega..."
                                className="checkout__input" style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="checkout__payment-box">
                        <p className="checkout__payment-title">Método de pago</p>
                        <div className="checkout__payment-row">
                            <span style={{ fontSize: 18 }}>💵</span>
                            Pago al retirar / en tienda
                        </div>
                    </div>

                    {error && (
                        <p className="checkout__error">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={submitting} className="btn btn--primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                        {submitting ? 'Procesando...' : 'Confirmar pedido'}
                    </button>
                </form>

                {/* Resumen del pedido */}
                <div className="checkout__summary">
                    <h2 className="checkout__summary-title">
                        Tu pedido ({items.length})
                    </h2>

                    <div className="checkout__summary-items">
                        {items.map(item => (
                            <div key={item._id} className="checkout__summary-item">
                                <span className="checkout__summary-item-name">
                                    {item.name}
                                    <span className="checkout__summary-item-qty"> ×{item.qty}</span>
                                </span>
                                <span className="checkout__summary-item-price">
                                    ${(item.price * item.qty).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout__summary-total-row">
                        <span className="checkout__summary-total-label">Total</span>
                        <span className="checkout__summary-total-value">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

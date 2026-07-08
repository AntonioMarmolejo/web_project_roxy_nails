import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useCartStore }  from '../store/useCartStore'
import { useAuthStore }  from '../store/useAuthStore'
import { createOrder }   from '../api/orders'

const INPUT = {
    width: '100%', padding: '9px 12px', border: '1px solid #F0D0DC',
    borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif',
    outline: 'none', background: '#fff', color: '#2D1520', boxSizing: 'border-box',
}

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
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#9E7080' }}>
                <div style={{ fontSize: 52, marginBottom: '1.5rem' }}>🛒</div>
                <h2 style={{ fontSize: 22, color: '#2D1520', marginBottom: 10 }}>Tu carrito está vacío</h2>
                <p style={{ fontSize: 15, marginBottom: '2rem' }}>Agrega productos antes de continuar.</p>
                <button onClick={() => navigate('/tienda')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver tienda
                </button>
            </div>
        )
    }

    // Pedido confirmado
    if (success) {
        return (
            <div style={{ maxWidth: 500, margin: '4rem auto', padding: '0 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: '1.5rem' }}>🎉</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#C2185B', marginBottom: 10 }}>
                    ¡Pedido realizado!
                </h2>
                <p style={{ fontSize: 15, color: '#9E7080', marginBottom: '1.5rem' }}>
                    Hemos recibido tu pedido. Te contactaremos pronto para coordinar la entrega.
                </p>

                <div style={{ background: '#FDF0F5', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#6B4050' }}>
                        <span><strong style={{ color: '#2D1520' }}>Cliente:</strong> {success.client.name}</span>
                        <span><strong style={{ color: '#2D1520' }}>Correo:</strong> {success.client.email}</span>
                        <span>
                            <strong style={{ color: '#2D1520' }}>Total:</strong>{' '}
                            <span style={{ color: '#C2185B', fontWeight: 700, fontSize: 16 }}>${success.total.toFixed(2)}</span>
                        </span>
                        <span><strong style={{ color: '#2D1520' }}>Pago:</strong> En tienda / al retirar</span>
                    </div>
                </div>

                <button onClick={() => navigate('/tienda')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Seguir comprando
                </button>
                {user && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate('/mis-pedidos')} style={{
                            background: 'transparent', border: 'none', color: '#C2185B',
                            cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', textDecoration: 'underline',
                        }}>
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

            <div style={{ background: '#FDF0F5', padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #F0D0DC' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#2D1520' }}>
                    Finalizar compra
                </h1>
            </div>

            <div style={{
                maxWidth: 900, margin: '0 auto', padding: '2rem',
                display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem',
                alignItems: 'start',
            }}>
                {/* Formulario */}
                <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                        Datos de entrega
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'name',    label: 'Nombre completo *',       placeholder: 'Tu nombre',           required: true },
                            { name: 'email',   label: 'Correo electrónico *',    placeholder: 'correo@ejemplo.com',  required: true, type: 'email' },
                            { name: 'phone',   label: 'Teléfono',                placeholder: '0912 345 678' },
                            { name: 'address', label: 'Dirección / punto de retiro', placeholder: 'Calle, sector, ciudad' },
                        ].map(f => (
                            <div key={f.name}>
                                <label style={{ fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }}>{f.label}</label>
                                <input
                                    name={f.name} type={f.type || 'text'}
                                    value={form[f.name]} onChange={handleChange}
                                    placeholder={f.placeholder} required={f.required}
                                    style={INPUT}
                                />
                            </div>
                        ))}

                        <div>
                            <label style={{ fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }}>Notas del pedido</label>
                            <textarea
                                name="notes" value={form.notes} onChange={handleChange}
                                rows={3} placeholder="Instrucciones especiales, horario de entrega..."
                                style={{ ...INPUT, resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#FDF0F5', borderRadius: 12, border: '1px solid #F0D0DC' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#2D1520', marginBottom: 6 }}>Método de pago</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B4050' }}>
                            <span style={{ fontSize: 18 }}>💵</span>
                            Pago al retirar / en tienda
                        </div>
                    </div>

                    {error && (
                        <p style={{ fontSize: 13, color: '#D32F2F', marginTop: '1rem', padding: '10px 12px', background: '#FFEBEE', borderRadius: 8 }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                        {submitting ? 'Procesando...' : 'Confirmar pedido'}
                    </button>
                </form>

                {/* Resumen del pedido */}
                <div style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                        Tu pedido ({items.length})
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' }}>
                        {items.map(item => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <span style={{ fontSize: 13, color: '#6B4050', flex: 1 }}>
                                    {item.name}
                                    <span style={{ color: '#9E7080' }}> ×{item.qty}</span>
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 500, color: '#2D1520', flexShrink: 0 }}>
                                    ${(item.price * item.qty).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid #F0D0DC', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>Total</span>
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#C2185B' }}>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'

const QTY_BTN = {
    width: 26, height: 26, borderRadius: 6, border: '1px solid #F0D0DC',
    background: '#fff', cursor: 'pointer', fontSize: 15, lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#6B4050', fontFamily: 'Inter, sans-serif', padding: 0,
}

export default function CartDrawer() {
    const { items, count, total, drawerOpen, closeDrawer, removeItem, updateQty, clearCart } = useCartStore()
    const navigate = useNavigate()

    if (!drawerOpen) return null

    const handleCheckout = () => {
        closeDrawer()
        navigate('/checkout')
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={closeDrawer}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: 200,
                }}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, height: '100vh',
                width: 380, maxWidth: '100vw',
                background: '#fff', zIndex: 201,
                display: 'flex', flexDirection: 'column',
                boxShadow: '-4px 0 32px rgba(0,0,0,0.13)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0D0DC',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#2D1520' }}>
                        Carrito{' '}
                        {count > 0 && (
                            <span style={{ fontSize: 14, color: '#C2185B' }}>({count})</span>
                        )}
                    </h2>
                    <button onClick={closeDrawer} style={{
                        background: 'transparent', border: 'none', fontSize: 22,
                        cursor: 'pointer', color: '#9E7080', lineHeight: 1, padding: '2px 6px',
                    }}>✕</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9E7080' }}>
                            <div style={{ fontSize: 52, marginBottom: '1rem' }}>🛒</div>
                            <p style={{ fontSize: 14 }}>Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {items.map(item => (
                                <div key={item._id} style={{
                                    display: 'flex', gap: 10, alignItems: 'center',
                                    padding: '0.75rem', border: '1px solid #F0D0DC', borderRadius: 12,
                                }}>
                                    {/* Imagen */}
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 10, background: '#FDF0F5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 22, flexShrink: 0, overflow: 'hidden',
                                    }}>
                                        {item.image
                                            ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : '💅'
                                        }
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: '#2D1520', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </p>
                                        <p style={{ fontSize: 13, color: '#C2185B', fontWeight: 600 }}>
                                            ${(item.price * item.qty).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Cantidad + quitar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                        <button style={QTY_BTN} onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#2D1520', minWidth: 20, textAlign: 'center' }}>
                                            {item.qty}
                                        </span>
                                        <button style={QTY_BTN} onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                                        <button
                                            style={{ ...QTY_BTN, marginLeft: 4, color: '#C2185B', borderColor: '#F8C8DC' }}
                                            onClick={() => removeItem(item._id)}
                                        >×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #F0D0DC' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                            <span style={{ fontSize: 14, color: '#6B4050' }}>Total</span>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#C2185B' }}>
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%' }}>
                            Ir a pagar
                        </button>
                        <button onClick={clearCart} style={{
                            width: '100%', background: 'transparent', border: 'none',
                            color: '#9E7080', fontSize: 12, cursor: 'pointer',
                            marginTop: '0.6rem', fontFamily: 'Inter, sans-serif', padding: '4px',
                        }}>
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

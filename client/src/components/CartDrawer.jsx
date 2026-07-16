import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import '../styles/CartDrawer.css'

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
            <div className="cart-backdrop" onClick={closeDrawer} />

            {/* Panel */}
            <div className="cart-panel">
                {/* Header */}
                <div className="cart-header">
                    <h2>
                        Carrito{' '}
                        {count > 0 && (
                            <span className="cart-header-count">({count})</span>
                        )}
                    </h2>
                    <button onClick={closeDrawer} className="cart-close-btn">✕</button>
                </div>

                {/* Items */}
                <div className="cart-items">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <p>Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        <div className="cart-item-list">
                            {items.map(item => (
                                <div key={item._id} className="cart-item">
                                    {/* Imagen */}
                                    <div className="cart-item-image">
                                        {item.image
                                            ? <img src={item.image} alt={item.name} />
                                            : '💅'
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="cart-item-info">
                                        <p className="cart-item-name">
                                            {item.name}
                                        </p>
                                        <p className="cart-item-price">
                                            ${(item.price * item.qty).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Cantidad + quitar */}
                                    <div className="cart-item-actions">
                                        <button className="cart-qty-btn" onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                                        <span className="cart-item-qty">
                                            {item.qty}
                                        </span>
                                        <button className="cart-qty-btn" onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                                        <button
                                            className="cart-qty-btn cart-qty-remove"
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
                    <div className="cart-footer">
                        <div className="cart-total-row">
                            <span className="cart-total-label">Total</span>
                            <span className="cart-total-value">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%' }}>
                            Ir a pagar
                        </button>
                        <button onClick={clearCart} className="cart-clear-btn">
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

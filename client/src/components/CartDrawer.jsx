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
            <div className="cart__backdrop" onClick={closeDrawer} />

            {/* Panel */}
            <div className="cart__panel">
                {/* Header */}
                <div className="cart__header">
                    <h2>
                        Carrito{' '}
                        {count > 0 && (
                            <span className="cart__header-count">({count})</span>
                        )}
                    </h2>
                    <button onClick={closeDrawer} className="cart__close-btn">✕</button>
                </div>

                {/* Items */}
                <div className="cart__items">
                    {items.length === 0 ? (
                        <div className="cart__empty">
                            <div className="cart__empty-icon">🛒</div>
                            <p>Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        <div className="cart__item-list">
                            {items.map(item => (
                                <div key={item._id} className="cart__item">
                                    {/* Imagen */}
                                    <div className="cart__item-image">
                                        {item.image
                                            ? <img src={item.image} alt={item.name} />
                                            : '💅'
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="cart__item-info">
                                        <p className="cart__item-name">
                                            {item.name}
                                        </p>
                                        <p className="cart__item-price">
                                            ${(item.price * item.qty).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Cantidad + quitar */}
                                    <div className="cart__item-actions">
                                        <button className="cart__qty-btn" onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                                        <span className="cart__item-qty">
                                            {item.qty}
                                        </span>
                                        <button className="cart__qty-btn" onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                                        <button
                                            className="cart__qty-btn cart__remove-btn"
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
                    <div className="cart__footer">
                        <div className="cart__total-row">
                            <span className="cart__total-label">Total</span>
                            <span className="cart__total-value">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <button onClick={handleCheckout} className="btn btn--primary" style={{ width: '100%' }}>
                            Ir a pagar
                        </button>
                        <button onClick={clearCart} className="cart__clear-btn">
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

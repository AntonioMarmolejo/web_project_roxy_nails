import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchProducts } from '../api/products'
import { useCartStore } from '../store/useCartStore'
import '../styles/Shop.css'

const CATS = ['todo', 'esmaltes', 'cuidado', 'herramientas', 'nail-art', 'accesorios']

export default function Shop() {
    const [products, setProducts] = useState([])
    const [loading, setLoading]   = useState(true)
    const [cat, setCat]           = useState('todo')
    const [added, setAdded]       = useState(null)

    const { addItem, openDrawer } = useCartStore()

    useEffect(() => {
        fetchProducts()
            .then(({ data }) => setProducts(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const filtered = cat === 'todo' ? products : products.filter(p => p.category === cat)

    const handleAdd = (product) => {
        addItem(product)
        setAdded(product._id)
        setTimeout(() => setAdded(null), 1500)
        openDrawer()
    }

    return (
        <>
            <Helmet>
                <title>Tienda — Roxy Nails</title>
                <meta name="description" content="Esmaltes, herramientas y todo para el cuidado de tus uñas." />
            </Helmet>

            {/* Header */}
            <div className="shop__header">
                <p className="shop__header-label">
                    Nuestros productos
                </p>
                <h1 className="shop__header-title">Tienda</h1>
                <p className="shop__header-sub">Esmaltes, herramientas y todo para el cuidado de tus uñas.</p>
            </div>

            {/* Filtros */}
            <div className="shop__filters">
                {CATS.map(c => (
                    <button key={c} onClick={() => setCat(c)} className={`shop__filter-btn${cat === c ? ' shop__filter-btn--active' : ''}`}>
                        {c === 'todo' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="shop__grid-section">
                {loading ? (
                    <p className="shop__loading">
                        Cargando productos...
                    </p>
                ) : filtered.length === 0 ? (
                    <div className="shop__empty">
                        <div className="shop__empty-icon">🛍️</div>
                        <p>
                            {products.length === 0
                                ? 'La tienda está vacía. Pronto agregaremos productos.'
                                : 'No hay productos en esta categoría.'}
                        </p>
                    </div>
                ) : (
                    <div className="catalog-grid">
                        {filtered.map(p => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                onAdd={handleAdd}
                                isAdded={added === p._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

function ProductCard({ product, onAdd, isAdded }) {
    const outOfStock = product.stock < 1
    const lowStock   = !outOfStock && product.stock <= 5

    return (
        <div className="product-card">
            {/* Imagen */}
            <div className="product-card__image">
                {product.image
                    ? <img src={product.image} alt={product.name} />
                    : '💅'
                }
                {outOfStock && (
                    <div className="product-card__badge product-card__badge--out-of-stock">
                        Agotado
                    </div>
                )}
                {lowStock && (
                    <div className="product-card__badge product-card__badge--low-stock">
                        ¡Últimas {product.stock}!
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="product-card__info">
                {product.brand && (
                    <span className="product-card__brand">
                        {product.brand}
                    </span>
                )}
                <h3 className="product-card__name">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="product-card__desc">
                        {product.description}
                    </p>
                )}
                <div className="product-card__footer">
                    <span className="product-card__price">
                        ${product.price}
                    </span>
                    <button
                        onClick={() => !outOfStock && onAdd(product)}
                        disabled={outOfStock}
                        className={`product-card__add-btn${isAdded ? ' product-card__add-btn--added' : ''}`}>
                        {isAdded ? '✓ Agregado' : outOfStock ? 'Agotado' : '+ Agregar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

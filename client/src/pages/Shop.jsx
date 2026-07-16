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
            <div className="shop-header">
                <p className="shop-header-label">
                    Nuestros productos
                </p>
                <h1 className="shop-header-title">Tienda</h1>
                <p className="shop-header-sub">Esmaltes, herramientas y todo para el cuidado de tus uñas.</p>
            </div>

            {/* Filtros */}
            <div className="shop-filters">
                {CATS.map(c => (
                    <button key={c} onClick={() => setCat(c)} className={`shop-filter-btn${cat === c ? ' active' : ''}`}>
                        {c === 'todo' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="shop-grid-section">
                {loading ? (
                    <p className="shop-loading">
                        Cargando productos...
                    </p>
                ) : filtered.length === 0 ? (
                    <div className="shop-empty">
                        <div className="shop-empty-icon">🛍️</div>
                        <p>
                            {products.length === 0
                                ? 'La tienda está vacía. Pronto agregaremos productos.'
                                : 'No hay productos en esta categoría.'}
                        </p>
                    </div>
                ) : (
                    <div className="rn-catalog-grid">
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
            <div className="product-card-image">
                {product.image
                    ? <img src={product.image} alt={product.name} />
                    : '💅'
                }
                {outOfStock && (
                    <div className="product-card-badge out-of-stock">
                        Agotado
                    </div>
                )}
                {lowStock && (
                    <div className="product-card-badge low-stock">
                        ¡Últimas {product.stock}!
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="product-card-info">
                {product.brand && (
                    <span className="product-card-brand">
                        {product.brand}
                    </span>
                )}
                <h3 className="product-card-name">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="product-card-desc">
                        {product.description}
                    </p>
                )}
                <div className="product-card-footer">
                    <span className="product-card-price">
                        ${product.price}
                    </span>
                    <button
                        onClick={() => !outOfStock && onAdd(product)}
                        disabled={outOfStock}
                        className={`product-card-add-btn${isAdded ? ' is-added' : ''}`}>
                        {isAdded ? '✓ Agregado' : outOfStock ? 'Agotado' : '+ Agregar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

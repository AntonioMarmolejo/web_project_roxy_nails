import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchProducts } from '../api/products'
import { useCartStore } from '../store/useCartStore'

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
            <div style={{ background: '#FDF0F5', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 8 }}>
                    Nuestros productos
                </p>
                <h1 style={{ fontSize: 34, marginBottom: 8 }}>Tienda</h1>
                <p style={{ fontSize: 15, color: '#9E7080' }}>Esmaltes, herramientas y todo para el cuidado de tus uñas.</p>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 8, padding: '1.5rem 2rem', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
                {CATS.map(c => (
                    <button key={c} onClick={() => setCat(c)} style={{
                        padding: '7px 18px', borderRadius: 20, fontSize: 13,
                        border: '1px solid', cursor: 'pointer',
                        borderColor: cat === c ? '#C2185B' : '#F0D0DC',
                        background:  cat === c ? '#C2185B' : '#fff',
                        color:       cat === c ? '#fff' : '#6B4050',
                        fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                        transition: 'all 0.15s',
                    }}>
                        {c === 'todo' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 4rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#9E7080', padding: '4rem 0', fontSize: 15 }}>
                        Cargando productos...
                    </p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9E7080' }}>
                        <div style={{ fontSize: 52, marginBottom: '1rem' }}>🛍️</div>
                        <p style={{ fontSize: 15 }}>
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
        <div style={{
            background: '#fff', border: '1px solid #F0D0DC', borderRadius: 18,
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
            {/* Imagen */}
            <div style={{
                height: 190, background: '#FDF0F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 56, position: 'relative', overflow: 'hidden',
            }}>
                {product.image
                    ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '💅'
                }
                {outOfStock && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#9E7080', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>
                        Agotado
                    </div>
                )}
                {lowStock && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#E65100', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>
                        ¡Últimas {product.stock}!
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {product.brand && (
                    <span style={{ fontSize: 10, color: '#9E7080', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                        {product.brand}
                    </span>
                )}
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#2D1520', lineHeight: 1.3 }}>
                    {product.name}
                </h3>
                {product.description && (
                    <p style={{ fontSize: 12, color: '#9E7080', lineHeight: 1.45, flex: 1 }}>
                        {product.description}
                    </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#C2185B' }}>
                        ${product.price}
                    </span>
                    <button
                        onClick={() => !outOfStock && onAdd(product)}
                        disabled={outOfStock}
                        style={{
                            background: isAdded ? '#1D9E75' : outOfStock ? '#F5F5F5' : '#C2185B',
                            color:      outOfStock ? '#9E7080' : '#fff',
                            border: 'none', borderRadius: 20, padding: '7px 16px',
                            fontSize: 12, fontWeight: 500, cursor: outOfStock ? 'not-allowed' : 'pointer',
                            fontFamily: 'Inter, sans-serif', transition: 'background 0.2s', flexShrink: 0,
                        }}>
                        {isAdded ? '✓ Agregado' : outOfStock ? 'Agotado' : '+ Agregar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

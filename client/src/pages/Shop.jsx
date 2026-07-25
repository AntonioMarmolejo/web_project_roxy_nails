import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchProducts } from '../api/products'
import { useCartStore } from '../store/useCartStore'
import LikeButton from '../components/LikeButton'
import Lightbox from '../components/Lightbox'
import PageHeader from '../components/PageHeader'
import '../styles/Shop.css'

const CATS = ['todo', 'esmaltes', 'cuidado', 'herramientas', 'nail-art', 'accesorios']
const CLOSE_MS = 350

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

            <PageHeader
                label="Nuestros productos"
                title="Tienda"
                subtitle="Esmaltes, herramientas y todo para el cuidado de tus uñas."
            />

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
    const images = product.images?.length ? product.images : []
    const outOfStock = product.stock < 1
    const lowStock   = !outOfStock && product.stock <= 5

    const [open, setOpen] = useState(false)
    const [visible, setVisible] = useState(false)
    const [activeImg, setActiveImg] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    const descItems = product.description
        ? product.description.split(',').map(s => s.trim()).filter(Boolean)
        : []

    const openModal = () => {
        setActiveImg(0)
        setOpen(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }

    const closeModal = () => {
        setVisible(false)
        setTimeout(() => setOpen(false), CLOSE_MS)
    }

    useEffect(() => {
        if (!open) return
        document.body.style.overflow = 'hidden'
        const onKeyDown = (e) => { if (e.key === 'Escape') closeModal() }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    return (
        <>
            <div className="product-card" onClick={openModal}>
                <LikeButton id={product._id} />
                <div className="product-card__image">
                    {images[0]
                        ? <img src={images[0]} alt={product.name} />
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
                <div className="product-card__name">
                    {product.name}
                </div>
            </div>

            {open && (
                <div className={`product-modal${visible ? ' product-modal--visible' : ''}`}>
                    <div className="product-modal__backdrop" onClick={closeModal} />

                    <div className="product-modal__panel">
                        <button className="product-modal__close" onClick={closeModal} aria-label="Cerrar">
                            ✕
                        </button>

                        <div
                            className="product-modal__image"
                            onClick={() => images.length && setLightboxOpen(true)}
                        >
                            {images[activeImg]
                                ? <img src={images[activeImg]} alt={product.name} />
                                : '💅'
                            }
                        </div>

                        {images.length > 1 && (
                            <div className="product-modal__thumbs">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`product-modal__thumb${i === activeImg ? ' product-modal__thumb--active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(i) }}
                                    >
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="product-modal__body">
                            {product.brand && (
                                <span className="product-modal__brand">
                                    {product.brand}
                                </span>
                            )}
                            <h3 className="product-modal__name">{product.name}</h3>

                            {descItems.length > 0 && (
                                <ul className="product-modal__list">
                                    {descItems.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            )}

                            <div className="product-modal__footer">
                                <span className="product-modal__price">
                                    ${product.price}
                                </span>
                            </div>

                            <button
                                onClick={() => !outOfStock && onAdd(product)}
                                disabled={outOfStock}
                                className={`product-modal__add-btn${isAdded ? ' product-modal__add-btn--added' : ''}`}>
                                {isAdded ? '✓ Agregado' : outOfStock ? 'Agotado' : '+ Agregar al carrito'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {lightboxOpen && images.length > 0 && (
                <Lightbox
                    images={images}
                    index={activeImg}
                    onClose={() => setLightboxOpen(false)}
                    onSelect={setActiveImg}
                />
            )}
        </>
    )
}

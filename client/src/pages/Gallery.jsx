import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Lightbox from '../components/Lightbox'
import LikeButton from '../components/LikeButton'
import { fetchGalleryImages, likeGalleryImage } from '../api/gallery'
import '../styles/Gallery.css'

const CATS = [
    { key: 'todas', label: 'Todas' },
    { key: 'manicure', label: 'Manicure' },
    { key: 'pedicure', label: 'Pedicure' },
    { key: 'nail-art', label: 'Nail Art' },
]

export default function Gallery() {
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [cat, setCat] = useState('todas')
    const [lightboxIndex, setLightboxIndex] = useState(null)

    useEffect(() => {
        fetchGalleryImages()
            .then(({ data }) => setImages(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const filtered = cat === 'todas' ? images : images.filter(g => g.category === cat)
    const lightboxImgs = filtered.map(g => g.image)

    const handleLike = (id, liked) => {
        likeGalleryImage(id, liked ? 1 : -1).catch(() => {})
    }

    return (
        <>
            <Helmet>
                <title>Galería — Roxy Nails</title>
                <meta name="description" content="Explora todos los diseños de manicure, pedicure y nail art que hemos creado." />
            </Helmet>

            <div className="gallery__header">
                <p className="gallery__header-label">
                    Nuestro trabajo
                </p>
                <h1 className="gallery__header-title">Galería</h1>
                <p className="gallery__header-sub">
                    Todos los diseños que hemos creado, organizados por categoría.
                </p>
            </div>

            <div className="gallery__filters">
                {CATS.map(c => (
                    <button key={c.key} onClick={() => setCat(c.key)} className={`gallery__filter-btn${cat === c.key ? ' gallery__filter-btn--active' : ''}`}>
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="gallery__grid-section">
                {loading ? (
                    <p className="gallery__empty">Cargando diseños...</p>
                ) : filtered.length === 0 ? (
                    <p className="gallery__empty">
                        {images.length === 0
                            ? 'Aún no hay diseños publicados. ¡Vuelve pronto!'
                            : 'No hay diseños en esta categoría aún.'}
                    </p>
                ) : (
                    <div className="gallery__grid">
                        {filtered.map((item, i) => (
                            <div key={item._id} className="gallery__item" onClick={() => setLightboxIndex(i)}>
                                <img src={item.image} alt="Trabajo de Roxy Nails" loading="lazy" />
                                <LikeButton
                                    id={item._id}
                                    count={item.likes}
                                    showCount
                                    className="gallery__item-like"
                                    onLike={(liked) => handleLike(item._id, liked)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={lightboxImgs}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onSelect={setLightboxIndex}
                />
            )}
        </>
    )
}

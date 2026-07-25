import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Lightbox from '../components/Lightbox'
import { GALLERY_IMAGES } from '../data/galleryImages'
import '../styles/Gallery.css'

const CATS = [
    { key: 'todas', label: 'Todas' },
    { key: 'manicure', label: 'Manicure' },
    { key: 'pedicure', label: 'Pedicure' },
    { key: 'nail-art', label: 'Nail Art' },
]

export default function Gallery() {
    const [cat, setCat] = useState('todas')
    const [lightboxIndex, setLightboxIndex] = useState(null)

    const filtered = cat === 'todas' ? GALLERY_IMAGES : GALLERY_IMAGES.filter(g => g.category === cat)
    const images = filtered.map(g => g.img)

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
                {filtered.length === 0 ? (
                    <p className="gallery__empty">No hay diseños en esta categoría aún.</p>
                ) : (
                    <div className="gallery__grid">
                        {filtered.map((item, i) => (
                            <div key={i} className="gallery__item" onClick={() => setLightboxIndex(i)}>
                                <img src={item.img} alt="Trabajo de Roxy Nails" loading="lazy" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={images}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onSelect={setLightboxIndex}
                />
            )}
        </>
    )
}

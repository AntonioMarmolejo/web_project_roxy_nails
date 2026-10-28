import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSlider from '../components/HeroSlider'
import ServiceCard from '../components/ServiceCard'
import Lightbox from '../components/Lightbox'
import LikeButton from '../components/LikeButton'
import { fetchServices } from '../api/services'
import { fetchGalleryImages, likeGalleryImage } from '../api/gallery'
import { fetchBanner } from '../api/banner'
import PromoBanner from '../components/PromoBanner'
import '../styles/Home.css'
import { brand } from '../config/brand'

// Respaldo si la API no responde (muestra del catálogo real)
const FALLBACK_SERVICES = [
    { _id: 'f1', name: 'Botox capilar', category: 'capilar', price: null, duration: null, featured: true },
    { _id: 'f2', name: 'Esmalte semipermanente – manos', category: 'unas', price: 25, duration: null, featured: true },
    { _id: 'f3', name: 'Soft gel – diseño liso', category: 'unas', price: 18, duration: null, featured: true },
    { _id: 'f4', name: 'Laminado de cejas', category: 'cejas', price: 25, duration: null, featured: true },
    { _id: 'f5', name: 'Pestañas por punto – clásicas', category: 'pestanas', price: 20, duration: null, featured: true },
    { _id: 'f6', name: 'Pestañas pelo a pelo – clásicas', category: 'pestanas', price: null, duration: null, featured: false },
]

const SectionLabel = ({ children }) => (
    <p className="home__section-label">
        {children}
    </p>
)

export default function Home() {
    const [services, setServices] = useState(FALLBACK_SERVICES)
    const [galleryImages, setGalleryImages] = useState([])
    const [lightboxIndex, setLightboxIndex] = useState(null)
    const [banner, setBanner] = useState(null)
    const galleryImgs = galleryImages.map(g => g.image)

    useEffect(() => {
        fetchBanner()
            .then(({ data }) => setBanner(data?.visible ? data : null))
            .catch(() => { })
        fetchServices()
            .then(({ data }) => { if (data?.length) setServices(data) })
            .catch(() => { })
        fetchGalleryImages()
            .then(({ data }) => setGalleryImages(data))
            .catch(() => { })
    }, [])

    const handleLike = (id, liked) => {
        likeGalleryImage(id, liked ? 1 : -1).catch(() => {})
    }

    const featured = services.filter(s => s.featured).slice(0, 9)
    const display = featured.length ? featured : services.slice(0, 9)

    return (
        <>
            <Helmet>
                <title>{`${brand.fullName} — ${brand.tagline}`}</title>
                <meta name="description" content={`${brand.tagline}. Tratamientos capilares, uñas, cejas y pestañas. ${brand.serviceNote}.`} />
            </Helmet>

            {/* Promo bar — se configura en Admin → Banner */}
            <PromoBanner banner={banner} />

            {/* Hero slider */}
            <HeroSlider />

            {/* Servicios destacados */}
            <section className="u-section home__services-section">
                <SectionLabel>Lo que hacemos</SectionLabel>
                <h2 className="home__section-title">Nuestros servicios</h2>
                <p className="home__section-sub">
                    Cada servicio incluye limpieza, hidratación y el acabado que elijas.
                </p>
                <div className="home__services-grid">
                    {display.map(svc => <ServiceCard key={svc._id} service={svc} />)}
                </div>
                <div className="home__section-cta">
                    <Link to="/servicios">
                        <button className="btn btn--ghost" style={{ width: 'auto' }}>Ver todos los servicios</button>
                    </Link>
                </div>
            </section>

            {/* Galería */}
            <section className="u-section home__gallery-section">
                <SectionLabel>Nuestro trabajo</SectionLabel>
                <h2 className="home__gallery-title">Galería</h2>
                <div className="home__gallery-grid">
                    {galleryImages.map((item, i) => (
                        <div
                            key={item._id}
                            className="home__gallery-item"
                            style={{ '--gallery-row-span': i === 0 || i === 6 ? 'span 2' : 'span 1' }}
                            onClick={() => setLightboxIndex(i)}
                        >
                            <img src={item.image} alt={`Trabajo de ${brand.name}`} loading="lazy" />
                            <LikeButton
                                id={item._id}
                                count={item.likes}
                                showCount
                                className="home__gallery-item-like"
                                onLike={(liked) => handleLike(item._id, liked)}
                            />
                        </div>
                    ))}
                </div>
                <div className="home__section-cta">
                    <Link to="/galeria">
                        <button className="btn btn--ghost" style={{ width: 'auto' }}>Ver más</button>
                    </Link>
                </div>
            </section>

            {lightboxIndex !== null && (
                <Lightbox
                    images={galleryImgs}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onSelect={setLightboxIndex}
                />
            )}

            {/* CTA Agenda */}
            <section className="home__cta-section">
                <h2 className="home__cta-title">¿Lista para tu próxima cita?</h2>
                <p className="home__cta-sub">
                    Reserva en minutos. Recibirás confirmación por WhatsApp.
                </p>
                <Link to="/agendar">
                    <button className="btn btn--primary home__cta-btn">
                        Agendar cita
                    </button>
                </Link>
            </section>
        </>
    )
}

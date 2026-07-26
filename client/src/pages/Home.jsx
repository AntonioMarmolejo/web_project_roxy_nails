import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSlider from '../components/HeroSlider'
import ServiceCard from '../components/ServiceCard'
import Lightbox from '../components/Lightbox'
import LikeButton from '../components/LikeButton'
import { fetchServices } from '../api/services'
import { fetchGalleryImages, likeGalleryImage } from '../api/gallery'
import '../styles/Home.css'

const FALLBACK_SERVICES = [
    { _id: '1', name: 'Manicure Gel', category: 'manicure', price: 25, duration: 60, featured: true, description: 'Acabado brillante que dura semanas.' },
    { _id: '2', name: 'Pedicure Spa', category: 'pedicure', price: 30, duration: 75, featured: true, description: 'Ritual completo con piedras calientes.' },
    { _id: '3', name: 'Nail Art', category: 'nail-art', price: 15, duration: 45, featured: false, description: 'Diseños personalizados a mano.' },
    { _id: '4', name: 'Extensiones', category: 'extensiones', price: 45, duration: 90, featured: false, description: 'Extensiones de gel o acrílico.' },
    { _id: '5', name: 'Retiro Gel', category: 'retiro', price: 10, duration: 30, featured: false, description: 'Retiro seguro sin dañar la uña.' },
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
    const galleryImgs = galleryImages.map(g => g.image)

    useEffect(() => {
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

    const featured = services.filter(s => s.featured).slice(0, 5)
    const display = featured.length ? featured : services.slice(0, 5)

    return (
        <>
            <Helmet>
                <title>Roxy Nails — Manicure y Pedicure Profesional</title>
                <meta name="description" content="Estudio de manicure y pedicure profesional. Gel, nail art, extensiones y más. Agenda tu cita online." />
            </Helmet>

            {/* Promo bar */}
            <div className="home__promo-bar">
                🎉 <strong>Julio: 20% OFF</strong> en manicure gel + pedicure spa —{' '}
                <Link to="/agendar">
                    Agenda tu cita hoy
                </Link>
            </div>

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
                            <img src={item.image} alt="Trabajo de Roxy Nails" loading="lazy" />
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

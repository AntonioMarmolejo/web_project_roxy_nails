import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSlider from '../components/HeroSlider'
import ServiceCard from '../components/ServiceCard'
import { fetchServices } from '../api/services'
import '../styles/Home.css'

const FALLBACK_SERVICES = [
    { _id: '1', name: 'Manicure Gel', category: 'manicure', price: 25, duration: 60, featured: true, description: 'Acabado brillante que dura semanas.' },
    { _id: '2', name: 'Pedicure Spa', category: 'pedicure', price: 30, duration: 75, featured: true, description: 'Ritual completo con piedras calientes.' },
    { _id: '3', name: 'Nail Art', category: 'nail-art', price: 15, duration: 45, featured: false, description: 'Diseños personalizados a mano.' },
    { _id: '4', name: 'Extensiones', category: 'extensiones', price: 45, duration: 90, featured: false, description: 'Extensiones de gel o acrílico.' },
    { _id: '5', name: 'Retiro Gel', category: 'retiro', price: 10, duration: 30, featured: false, description: 'Retiro seguro sin dañar la uña.' },
]

const GALLERY = [
    { bg: '#FDF0F5', emoji: '💅', tall: true },
    { bg: '#FCE4EC', emoji: '🌸' },
    { bg: '#F8C8DC', emoji: '✨' },
    { bg: '#EDE7F6', emoji: '💎' },
    { bg: '#FFF3E0', emoji: '🌺' },
    { bg: '#FCE4EC', emoji: '🎀' },
    { bg: '#F3E5F5', emoji: '💜', tall: true },
    { bg: '#FFEEF4', emoji: '🌷' },
    { bg: '#F8C8DC', emoji: '🦋' },
]

const SectionLabel = ({ children }) => (
    <p className="home__section-label">
        {children}
    </p>
)

export default function Home() {
    const [services, setServices] = useState(FALLBACK_SERVICES)

    useEffect(() => {
        fetchServices()
            .then(({ data }) => { if (data?.length) setServices(data) })
            .catch(() => { })
    }, [])

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
                    {GALLERY.map((item, i) => (
                        <div
                            key={i}
                            className="home__gallery-item"
                            style={{
                                '--gallery-bg': item.bg,
                                '--gallery-font-size': item.tall ? '40px' : '30px',
                                '--gallery-row-span': item.tall ? 'span 2' : 'span 1',
                            }}
                        >{item.emoji}</div>
                    ))}
                </div>
            </section>

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

            {/* Footer */}
            <footer className="home__footer">
                <div className="home__footer-inner">
                    <div>
                        <div className="home__footer-brand">
                            Roxy Nails
                        </div>
                        <p className="home__footer-desc">
                            Tu estudio de manicure y pedicure de confianza. Cuidamos cada detalle para que brilles.
                        </p>
                    </div>
                    <div>
                        <h4 className="home__footer-heading">Servicios</h4>
                        {['Manicure Gel', 'Pedicure Spa', 'Nail Art', 'Extensiones'].map(s => (
                            <Link key={s} to="/servicios" className="home__footer-link">{s}</Link>
                        ))}
                    </div>
                    <div>
                        <h4 className="home__footer-heading">Contacto</h4>
                        {['📍 Tu dirección aquí', '📱 WhatsApp', '📸 Instagram', '🕐 Lun–Sáb 8–19h'].map(c => (
                            <p key={c} className="home__footer-text">{c}</p>
                        ))}
                    </div>
                </div>
                <div className="home__footer-bottom">
                    © 2026 Roxy Nails — Todos los derechos reservados
                </div>
            </footer>
        </>
    )
}

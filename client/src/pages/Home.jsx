import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSlider from '../components/HeroSlider'
import ServiceCard from '../components/ServiceCard'
import Lightbox from '../components/Lightbox'
import { fetchServices } from '../api/services'
import { GALLERY_IMAGES } from '../data/galleryImages'
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
    const [lightboxIndex, setLightboxIndex] = useState(null)
    const galleryImgs = GALLERY_IMAGES.map(g => g.img)

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
                    {GALLERY_IMAGES.map((item, i) => (
                        <div
                            key={i}
                            className="home__gallery-item"
                            style={{ '--gallery-row-span': item.tall ? 'span 2' : 'span 1' }}
                            onClick={() => setLightboxIndex(i)}
                        >
                            <img src={item.img} alt="Trabajo de Roxy Nails" loading="lazy" />
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
                    <div>
                        <h4 className="home__footer-heading">Redes sociales</h4>
                        <div className="home__social-links">
                            <a href="https://wa.me/593967141740" target="_blank" rel="noopener noreferrer"
                                className="home__social-link home__social-link--whatsapp" aria-label="WhatsApp">
                                <svg viewBox="0 0 32 32"><path d="M16.004 3C9.377 3 4 8.377 4 15.004c0 2.373.66 4.59 1.804 6.484L3 29l7.71-2.767a11.94 11.94 0 0 0 5.294 1.24h.005c6.627 0 12.004-5.377 12.004-12.004C28.013 8.377 22.631 3 16.004 3zm0 21.86h-.004a9.9 9.9 0 0 1-5.045-1.383l-.362-.215-4.575 1.642 1.222-4.457-.236-.457a9.86 9.86 0 0 1-1.512-5.293c0-5.462 4.446-9.908 9.917-9.908 2.648 0 5.135 1.034 7.007 2.909a9.845 9.845 0 0 1 2.9 7.006c0 5.462-4.447 9.907-9.912 9.907zm5.437-7.42c-.298-.149-1.76-.868-2.033-.967-.273-.099-.472-.149-.67.15-.199.297-.769.966-.943 1.164-.174.199-.348.224-.646.075-.298-.15-1.257-.463-2.394-1.475-.885-.789-1.482-1.763-1.656-2.061-.174-.298-.019-.459.13-.607.134-.133.298-.348.447-.522.15-.174.199-.298.298-.497.1-.199.05-.373-.025-.522-.075-.149-.67-1.612-.918-2.208-.242-.58-.487-.502-.67-.511l-.57-.01c-.199 0-.522.075-.795.373-.273.298-1.04 1.017-1.04 2.48s1.065 2.876 1.213 3.075c.15.199 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.626.711.226 1.359.194 1.87.118.57-.085 1.76-.719 2.008-1.414.248-.694.248-1.29.174-1.414-.075-.124-.273-.199-.571-.348z"/></svg>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer"
                                className="home__social-link home__social-link--instagram" aria-label="Instagram">
                                <svg viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer"
                                className="home__social-link home__social-link--tiktok" aria-label="TikTok">
                                <svg viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/></svg>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer"
                                className="home__social-link home__social-link--facebook" aria-label="Facebook">
                                <svg viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="home__footer-bottom">
                    © 2026 Roxy Nails — Todos los derechos reservados
                </div>
            </footer>
        </>
    )
}

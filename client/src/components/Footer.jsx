import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchServices } from '../api/services'
import '../styles/Footer.css'

export default function Footer() {
    const navigate = useNavigate()
    const [services, setServices] = useState([])

    useEffect(() => {
        fetchServices().then(({ data }) => setServices(data)).catch(() => {})
    }, [])

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div>
                    <div className="footer__brand">
                        Roxy Nails
                    </div>
                    <p className="footer__desc">
                        Tu estudio de manicure y pedicure de confianza. Cuidamos cada detalle para que brilles.
                    </p>
                </div>
                <div>
                    <h4 className="footer__heading">Servicios</h4>
                    {services.slice(0, 4).map(svc => (
                        <button
                            key={svc._id}
                            onClick={() => navigate('/agendar', { state: { serviceId: svc._id } })}
                            className="footer__link footer__link--btn"
                        >
                            {svc.name}
                        </button>
                    ))}
                </div>
                <div>
                    <h4 className="footer__heading">Contacto</h4>
                    {['📍 Tu dirección aquí', '🕐 Lun–Sáb 8–19h'].map(c => (
                        <p key={c} className="footer__text">{c}</p>
                    ))}
                </div>
                <div>
                    <h4 className="footer__heading">Redes sociales</h4>
                    <div className="footer__social-links">
                        <a href="https://wa.me/593967141740" target="_blank" rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--whatsapp" aria-label="WhatsApp">
                            <svg viewBox="0 0 32 32"><path d="M16.004 3C9.377 3 4 8.377 4 15.004c0 2.373.66 4.59 1.804 6.484L3 29l7.71-2.767a11.94 11.94 0 0 0 5.294 1.24h.005c6.627 0 12.004-5.377 12.004-12.004C28.013 8.377 22.631 3 16.004 3zm0 21.86h-.004a9.9 9.9 0 0 1-5.045-1.383l-.362-.215-4.575 1.642 1.222-4.457-.236-.457a9.86 9.86 0 0 1-1.512-5.293c0-5.462 4.446-9.908 9.917-9.908 2.648 0 5.135 1.034 7.007 2.909a9.845 9.845 0 0 1 2.9 7.006c0 5.462-4.447 9.907-9.912 9.907zm5.437-7.42c-.298-.149-1.76-.868-2.033-.967-.273-.099-.472-.149-.67.15-.199.297-.769.966-.943 1.164-.174.199-.348.224-.646.075-.298-.15-1.257-.463-2.394-1.475-.885-.789-1.482-1.763-1.656-2.061-.174-.298-.019-.459.13-.607.134-.133.298-.348.447-.522.15-.174.199-.298.298-.497.1-.199.05-.373-.025-.522-.075-.149-.67-1.612-.918-2.208-.242-.58-.487-.502-.67-.511l-.57-.01c-.199 0-.522.075-.795.373-.273.298-1.04 1.017-1.04 2.48s1.065 2.876 1.213 3.075c.15.199 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.626.711.226 1.359.194 1.87.118.57-.085 1.76-.719 2.008-1.414.248-.694.248-1.29.174-1.414-.075-.124-.273-.199-.571-.348z"/></svg>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--instagram" aria-label="Instagram">
                            <svg viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--tiktok" aria-label="TikTok">
                            <svg viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/></svg>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer"
                            className="footer__social-link footer__social-link--facebook" aria-label="Facebook">
                            <svg viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer__bottom">
                <span>© {new Date().getFullYear()} Roxy Nails — Todos los derechos reservados</span>
                <div className="footer__legal-links">
                    <Link to="/privacidad">Privacidad</Link>
                    <Link to="/terminos">Términos y condiciones</Link>
                </div>
            </div>
        </footer>
    )
}

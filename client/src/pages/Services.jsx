import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import ServiceCard from '../components/ServiceCard'
import { fetchServices } from '../api/services'
import '../styles/Services.css'

const FALLBACK = [
    { _id: '1', name: 'Manicure Gel', category: 'manicure', price: 25, duration: 60, featured: true, description: 'Acabado brillante que dura semanas.' },
    { _id: '2', name: 'Manicure Clásica', category: 'manicure', price: 12, duration: 40, featured: false, description: 'Limpieza, forma y esmalte regular.' },
    { _id: '3', name: 'Pedicure Spa', category: 'pedicure', price: 30, duration: 75, featured: true, description: 'Ritual completo con piedras calientes.' },
    { _id: '4', name: 'Pedicure Básico', category: 'pedicure', price: 18, duration: 50, featured: false, description: 'Limpieza y esmalte de pies.' },
    { _id: '5', name: 'Nail Art', category: 'nail-art', price: 15, duration: 45, featured: false, description: 'Diseños personalizados a mano.' },
    { _id: '6', name: 'Nail Art Premium', category: 'nail-art', price: 25, duration: 60, featured: false, description: 'Piedras, degradados y diseños complejos.' },
    { _id: '7', name: 'Extensiones', category: 'extensiones', price: 45, duration: 90, featured: false, description: 'Extensiones de gel o acrílico.' },
    { _id: '8', name: 'Retiro Gel', category: 'retiro', price: 10, duration: 30, featured: false, description: 'Retiro seguro sin dañar la uña.' },
]

const CATS = [
    { key: 'todas', label: 'Todas' },
    { key: 'manicure', label: 'Manicure' },
    { key: 'pedicure', label: 'Pedicure' },
    { key: 'nail-art', label: 'Nail Art' },
    { key: 'extensiones', label: 'Extensiones' },
    { key: 'retiro', label: 'Retiro' },
]

export default function Services() {
    const [services, setServices] = useState(FALLBACK)
    const [cat, setCat] = useState('todas')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchServices()
            .then(({ data }) => { if (data?.length) setServices(data) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const filtered = cat === 'todas' ? services : services.filter(s => s.category === cat)

    return (
        <>
            <Helmet>
                <title>Servicios — Roxy Nails</title>
                <meta name="description" content="Catálogo completo de servicios: manicure gel, pedicure spa, nail art, extensiones y más." />
            </Helmet>

            {/* Header */}
            <div className="services__header">
                <p className="services__header-label">
                    Lo que hacemos
                </p>
                <h1 className="services__header-title">Nuestros servicios</h1>
                <p className="services__header-sub">
                    Cada servicio incluye limpieza, hidratación y el acabado que elijas.
                </p>
            </div>

            {/* Filtros */}
            <div className="services__filters">
                {CATS.map(c => (
                    <button key={c.key} onClick={() => setCat(c.key)} className={`services__filter-btn${cat === c.key ? ' services__filter-btn--active' : ''}`}>
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="u-section services__grid-section">
                {loading ? (
                    <p className="services__empty">Cargando servicios...</p>
                ) : filtered.length === 0 ? (
                    <p className="services__empty">
                        No hay servicios en esta categoría aún.
                    </p>
                ) : (
                    <div className="catalog-grid">
                        {filtered.map(svc => <ServiceCard key={svc._id} service={svc} />)}
                    </div>
                )}
            </div>
        </>
    )
}

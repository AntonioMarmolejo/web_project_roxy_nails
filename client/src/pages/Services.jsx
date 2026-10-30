import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import ServiceCard from '../components/ServiceCard'
import PageHeader from '../components/PageHeader'
import { fetchServices } from '../api/services'
import '../styles/Services.css'
import { brand } from '../config/brand'
import { SERVICE_CATEGORIES } from '../config/services'
import { SkeletonGrid } from '../components/Skeleton'

// Respaldo si la API no responde (muestra del catálogo real)
const FALLBACK = [
    { _id: 'f1', name: 'Botox capilar', category: 'capilar', price: null, duration: null, featured: true },
    { _id: 'f2', name: 'Esmalte semipermanente – manos', category: 'unas', price: 25, duration: null, featured: true },
    { _id: 'f3', name: 'Soft gel – diseño liso', category: 'unas', price: 18, duration: null, featured: true },
    { _id: 'f4', name: 'Laminado de cejas', category: 'cejas', price: 25, duration: null, featured: true },
    { _id: 'f5', name: 'Pestañas por punto – clásicas', category: 'pestanas', price: 20, duration: null, featured: true },
    { _id: 'f6', name: 'Pestañas pelo a pelo – clásicas', category: 'pestanas', price: null, duration: null, featured: false },
]

const CATS = [{ key: 'todas', label: 'Todas' }, ...SERVICE_CATEGORIES]

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
                <title>{`Servicios — ${brand.fullName}`}</title>
                <meta name="description" content="Catálogo completo de servicios: tratamientos capilares, uñas, cejas y pestañas." />
            </Helmet>

            <PageHeader
                label="Lo que hacemos"
                title="Nuestros servicios"
                subtitle="Cada servicio incluye limpieza, hidratación y el acabado que elijas."
            />

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
                    <SkeletonGrid count={8} label="Cargando servicios" />
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

import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import ServiceCard from '../components/ServiceCard'
import { fetchServices } from '../api/services'

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
            <div style={{ background: '#FDF0F5', padding: '3rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 10 }}>
                    Lo que hacemos
                </p>
                <h1 style={{ fontSize: 38, marginBottom: 10 }}>Nuestros servicios</h1>
                <p style={{ fontSize: 15, color: '#9E7080', maxWidth: 460, margin: '0 auto' }}>
                    Cada servicio incluye limpieza, hidratación y el acabado que elijas.
                </p>
            </div>

            {/* Filtros */}
            <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
                padding: '1.5rem 2rem', borderBottom: '1px solid #F0D0DC', background: '#fff',
                position: 'sticky', top: 64, zIndex: 5,
            }}>
                {CATS.map(c => (
                    <button key={c.key} onClick={() => setCat(c.key)} style={{
                        padding: '8px 20px', borderRadius: 20, fontSize: 14,
                        border: '1px solid',
                        borderColor: cat === c.key ? '#C2185B' : '#F0D0DC',
                        background: cat === c.key ? '#C2185B' : '#fff',
                        color: cat === c.key ? '#fff' : '#6B4050',
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s',
                    }}>{c.label}</button>
                ))}
            </div>

            {/* Grid */}
            <div className="rn-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#9E7080', fontSize: 15 }}>Cargando servicios...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9E7080', fontSize: 15 }}>
                        No hay servicios en esta categoría aún.
                    </p>
                ) : (
                    <div className="rn-catalog-grid">
                        {filtered.map(svc => <ServiceCard key={svc._id} service={svc} />)}
                    </div>
                )}
            </div>
        </>
    )
}

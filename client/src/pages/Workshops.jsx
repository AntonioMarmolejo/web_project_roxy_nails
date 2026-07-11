import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { fetchWorkshops } from '../api/workshops'

export default function Workshops() {
    const [workshops, setWorkshops] = useState([])
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        fetchWorkshops()
            .then(({ data }) => setWorkshops(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <Helmet>
                <title>Talleres — Roxy Nails</title>
                <meta name="description" content="Aprende técnicas de manicure y nail art en nuestros talleres." />
            </Helmet>

            <div style={{ background: '#FDF0F5', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 8 }}>
                    Aprende con nosotras
                </p>
                <h1 style={{ fontSize: 34, marginBottom: 8 }}>Talleres</h1>
                <p style={{ fontSize: 15, color: '#9E7080' }}>Cupos limitados. Inscríbete antes de que se agoten.</p>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#9E7080', padding: '4rem 0', fontSize: 15 }}>
                        Cargando talleres...
                    </p>
                ) : workshops.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9E7080' }}>
                        <div style={{ fontSize: 52, marginBottom: '1rem' }}>🎓</div>
                        <p style={{ fontSize: 15 }}>No hay talleres programados por ahora. ¡Vuelve pronto!</p>
                    </div>
                ) : (
                    <div className="rn-catalog-grid">
                        {workshops.map(w => <WorkshopCard key={w._id} workshop={w} />)}
                    </div>
                )}
            </div>
        </>
    )
}

function WorkshopCard({ workshop }) {
    const full = workshop.spotsLeft <= 0
    const dateStr = new Date(workshop.date).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
    })

    return (
        <div style={{
            background: '#fff', border: '1px solid #F0D0DC', borderRadius: 18,
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
            <div style={{
                height: 190, background: '#FDF0F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 56, position: 'relative', overflow: 'hidden',
            }}>
                {workshop.image
                    ? <img src={workshop.image} alt={workshop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🎓'
                }
                {full && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#9E7080', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>
                        Cupos agotados
                    </div>
                )}
                {!full && workshop.spotsLeft <= 3 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#E65100', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>
                        ¡Últimos {workshop.spotsLeft} cupos!
                    </div>
                )}
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 10, color: '#9E7080', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                    {workshop.modality === 'virtual' ? 'Virtual' : 'Presencial'} · {dateStr}
                </span>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#2D1520', lineHeight: 1.3 }}>
                    {workshop.title}
                </h3>
                {workshop.description && (
                    <p style={{ fontSize: 12, color: '#9E7080', lineHeight: 1.45, flex: 1 }}>
                        {workshop.description}
                    </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#C2185B' }}>
                        ${workshop.price}
                    </span>
                    {full ? (
                        <button disabled style={{
                            background: '#F5F5F5', color: '#9E7080',
                            border: 'none', borderRadius: 20, padding: '7px 16px',
                            fontSize: 12, fontWeight: 500, cursor: 'not-allowed',
                            fontFamily: 'Inter, sans-serif', flexShrink: 0,
                        }}>
                            Agotado
                        </button>
                    ) : (
                        <Link to={`/talleres/${workshop._id}/inscripcion`}>
                            <button style={{
                                background: '#C2185B', color: '#fff',
                                border: 'none', borderRadius: 20, padding: '7px 16px',
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', flexShrink: 0,
                            }}>
                                Inscribirme
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthStore }    from '../store/useAuthStore'
import { fetchWorkshop }   from '../api/workshops'
import { createEnrollment } from '../api/enrollments'

const INPUT = {
    width: '100%', padding: '9px 12px', border: '1px solid #F0D0DC',
    borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif',
    outline: 'none', background: '#fff', color: '#2D1520', boxSizing: 'border-box',
}

export default function WorkshopCheckout() {
    const { id } = useParams()
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const [workshop, setWorkshop] = useState(null)
    const [loading, setLoading]   = useState(true)
    const [form, setForm] = useState({
        name:  user?.name  || '',
        email: user?.email || '',
        phone: user?.phone || '',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')
    const [success, setSuccess]       = useState(null)

    useEffect(() => {
        fetchWorkshop(id)
            .then(({ data }) => setWorkshop(data))
            .catch(() => setWorkshop(false))
            .finally(() => setLoading(false))
    }, [id])

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const payload = {
                workshop: id,
                client: { name: form.name, email: form.email, phone: form.phone },
                notes: form.notes,
                paymentMethod: 'cod',
            }
            const { data } = await createEnrollment(payload)
            setSuccess(data)
        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar la inscripción. Intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <p style={{ textAlign: 'center', color: '#9E7080', padding: '6rem 0', fontSize: 15 }}>Cargando...</p>
    }

    if (!workshop) {
        return (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#9E7080' }}>
                <div style={{ fontSize: 52, marginBottom: '1.5rem' }}>🎓</div>
                <h2 style={{ fontSize: 22, color: '#2D1520', marginBottom: 10 }}>Taller no disponible</h2>
                <p style={{ fontSize: 15, marginBottom: '2rem' }}>Puede que ya no exista o se haya dado de baja.</p>
                <button onClick={() => navigate('/talleres')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver talleres
                </button>
            </div>
        )
    }

    if (success) {
        return (
            <div style={{ maxWidth: 500, margin: '4rem auto', padding: '0 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: '1.5rem' }}>🎉</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#C2185B', marginBottom: 10 }}>
                    ¡Inscripción confirmada!
                </h2>
                <p style={{ fontSize: 15, color: '#9E7080', marginBottom: '1.5rem' }}>
                    Te esperamos en "{success.title}". Te contactaremos con los detalles.
                </p>

                <div style={{ background: '#FDF0F5', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#6B4050' }}>
                        <span><strong style={{ color: '#2D1520' }}>Taller:</strong> {success.title}</span>
                        <span><strong style={{ color: '#2D1520' }}>Fecha:</strong> {new Date(success.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>
                            <strong style={{ color: '#2D1520' }}>Precio:</strong>{' '}
                            <span style={{ color: '#C2185B', fontWeight: 700, fontSize: 16 }}>${success.price.toFixed(2)}</span>
                        </span>
                        <span><strong style={{ color: '#2D1520' }}>Pago:</strong> En el lugar / al confirmar</span>
                    </div>
                </div>

                <button onClick={() => navigate('/talleres')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver más talleres
                </button>
                {user && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate('/mis-talleres')} style={{
                            background: 'transparent', border: 'none', color: '#C2185B',
                            cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', textDecoration: 'underline',
                        }}>
                            Ver mis talleres
                        </button>
                    </div>
                )}
            </div>
        )
    }

    const full = workshop.spotsLeft <= 0
    const dateStr = new Date(workshop.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <>
            <Helmet>
                <title>Inscripción — {workshop.title} — Roxy Nails</title>
            </Helmet>

            <div style={{ background: '#FDF0F5', padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #F0D0DC' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#2D1520' }}>
                    Inscripción al taller
                </h1>
            </div>

            <div className="rn-checkout-grid" style={{
                maxWidth: 900, margin: '0 auto', padding: '2rem',
                display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem',
                alignItems: 'start',
            }}>
                {full ? (
                    <div style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '2rem', textAlign: 'center', color: '#9E7080' }}>
                        <p style={{ fontSize: 15, marginBottom: '1rem' }}>Este taller ya no tiene cupos disponibles.</p>
                        <Link to="/talleres"><button className="btn-ghost">Ver otros talleres</button></Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                            Tus datos
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'name',  label: 'Nombre completo *',    placeholder: 'Tu nombre',          required: true },
                                { name: 'email', label: 'Correo electrónico *', placeholder: 'correo@ejemplo.com', required: true, type: 'email' },
                                { name: 'phone', label: 'Teléfono',             placeholder: '0912 345 678' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label style={{ fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }}>{f.label}</label>
                                    <input
                                        name={f.name} type={f.type || 'text'}
                                        value={form[f.name]} onChange={handleChange}
                                        placeholder={f.placeholder} required={f.required}
                                        style={INPUT}
                                    />
                                </div>
                            ))}

                            <div>
                                <label style={{ fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }}>Notas</label>
                                <textarea
                                    name="notes" value={form.notes} onChange={handleChange}
                                    rows={3} placeholder="Alguna pregunta o requerimiento especial..."
                                    style={{ ...INPUT, resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#FDF0F5', borderRadius: 12, border: '1px solid #F0D0DC' }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#2D1520', marginBottom: 6 }}>Método de pago</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B4050' }}>
                                <span style={{ fontSize: 18 }}>💵</span>
                                Pago en el lugar / al confirmar
                            </div>
                        </div>

                        {error && (
                            <p style={{ fontSize: 13, color: '#D32F2F', marginTop: '1rem', padding: '10px 12px', background: '#FFEBEE', borderRadius: 8 }}>
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                            {submitting ? 'Procesando...' : 'Confirmar inscripción'}
                        </button>
                    </form>
                )}

                {/* Resumen del taller */}
                <div className="rn-order-summary" style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                        {workshop.title}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#6B4050', marginBottom: '1rem' }}>
                        <span>📅 {dateStr}</span>
                        {workshop.duration && <span>⏱️ {workshop.duration} horas</span>}
                        <span>{workshop.modality === 'virtual' ? '💻 Virtual' : '📍 Presencial'}</span>
                        <span>{workshop.spotsLeft} cupo{workshop.spotsLeft === 1 ? '' : 's'} disponible{workshop.spotsLeft === 1 ? '' : 's'}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #F0D0DC', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>Precio</span>
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#C2185B' }}>${workshop.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

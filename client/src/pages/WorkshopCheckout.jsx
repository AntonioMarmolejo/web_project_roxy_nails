import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthStore }    from '../store/useAuthStore'
import { fetchWorkshop }   from '../api/workshops'
import { createEnrollment } from '../api/enrollments'
import '../styles/Checkout.css'

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
        return <p className="checkout__empty" style={{ padding: '6rem 0' }}>Cargando...</p>
    }

    if (!workshop) {
        return (
            <div className="checkout__empty">
                <div className="checkout__empty-icon">🎓</div>
                <h2 className="checkout__empty-title">Taller no disponible</h2>
                <p className="checkout__empty-sub">Puede que ya no exista o se haya dado de baja.</p>
                <button onClick={() => navigate('/talleres')} className="btn btn--primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver talleres
                </button>
            </div>
        )
    }

    if (success) {
        return (
            <div className="checkout__success">
                <div className="checkout__success-icon">🎉</div>
                <h2 className="checkout__success-title">
                    ¡Inscripción confirmada!
                </h2>
                <p className="checkout__success-sub">
                    Te esperamos en "{success.title}". Te contactaremos con los detalles.
                </p>

                <div className="checkout__success-box">
                    <div className="checkout__success-details">
                        <span><strong>Taller:</strong> {success.title}</span>
                        <span><strong>Fecha:</strong> {new Date(success.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>
                            <strong>Precio:</strong>{' '}
                            <span className="checkout__success-total">${success.price.toFixed(2)}</span>
                        </span>
                        <span><strong>Pago:</strong> En el lugar / al confirmar</span>
                    </div>
                </div>

                <button onClick={() => navigate('/talleres')} className="btn btn--primary" style={{ width: 'auto', padding: '12px 32px' }}>
                    Ver más talleres
                </button>
                {user && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate('/mis-talleres')} className="checkout__success-link-btn">
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

            <div className="checkout__page-header">
                <h1 className="checkout__page-title">
                    Inscripción al taller
                </h1>
            </div>

            <div className="checkout__grid">
                {full ? (
                    <div className="checkout__form" style={{ textAlign: 'center', color: '#9E7080' }}>
                        <p style={{ fontSize: 15, marginBottom: '1rem' }}>Este taller ya no tiene cupos disponibles.</p>
                        <Link to="/talleres"><button className="btn btn--ghost">Ver otros talleres</button></Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="checkout__form">
                        <h2 className="checkout__form-title">
                            Tus datos
                        </h2>

                        <div className="checkout__fields">
                            {[
                                { name: 'name',  label: 'Nombre completo *',    placeholder: 'Tu nombre',          required: true },
                                { name: 'email', label: 'Correo electrónico *', placeholder: 'correo@ejemplo.com', required: true, type: 'email' },
                                { name: 'phone', label: 'Teléfono',             placeholder: '0912 345 678' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="checkout__label">{f.label}</label>
                                    <input
                                        name={f.name} type={f.type || 'text'}
                                        value={form[f.name]} onChange={handleChange}
                                        placeholder={f.placeholder} required={f.required}
                                        className="checkout__input"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="checkout__label">Notas</label>
                                <textarea
                                    name="notes" value={form.notes} onChange={handleChange}
                                    rows={3} placeholder="Alguna pregunta o requerimiento especial..."
                                    className="checkout__input" style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div className="checkout__payment-box">
                            <p className="checkout__payment-title">Método de pago</p>
                            <div className="checkout__payment-row">
                                <span style={{ fontSize: 18 }}>💵</span>
                                Pago en el lugar / al confirmar
                            </div>
                        </div>

                        {error && (
                            <p className="checkout__error">
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={submitting} className="btn btn--primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                            {submitting ? 'Procesando...' : 'Confirmar inscripción'}
                        </button>
                    </form>
                )}

                {/* Resumen del taller */}
                <div className="checkout__summary">
                    <h2 className="checkout__summary-title">
                        {workshop.title}
                    </h2>
                    <div className="checkout__summary-details">
                        <span>📅 {dateStr}</span>
                        {workshop.duration && <span>⏱️ {workshop.duration} horas</span>}
                        <span>{workshop.modality === 'virtual' ? '💻 Virtual' : '📍 Presencial'}</span>
                        <span>{workshop.spotsLeft} cupo{workshop.spotsLeft === 1 ? '' : 's'} disponible{workshop.spotsLeft === 1 ? '' : 's'}</span>
                    </div>
                    <div className="checkout__summary-total-row">
                        <span className="checkout__summary-total-label">Precio</span>
                        <span className="checkout__summary-total-value">${workshop.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

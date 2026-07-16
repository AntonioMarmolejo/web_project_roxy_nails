import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices } from '../api/services'
import { fetchSlots, createBooking } from '../api/bookings'
import '../styles/Booking.css'

// ─── Calendar helpers ────────────────────────────────────────────
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const ALL_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const CAT_ICONS = { manicure: '💅', pedicure: '🦶', 'nail-art': '🎨', extensiones: '💎', retiro: '✨' }

function getDaysGrid(year, month) {
    const firstJS = new Date(year, month, 1).getDay()
    const offset = (firstJS + 6) % 7   // convert to Mon-first
    const total = new Date(year, month + 1, 0).getDate()
    const cells = Array(offset).fill(null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
}

function toDateStr(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isPastOrSunday(year, month, day) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(year, month, day)
    return d < today || d.getDay() === 0
}

// ─── Stepper ─────────────────────────────────────────────────────
function Stepper({ step }) {
    const labels = ['Servicio', 'Fecha', 'Horario', 'Datos']
    return (
        <div className="rn-stepper stepper">
            {labels.map((label, i) => {
                const n = i + 1
                const done = step > n
                const active = step === n
                return (
                    <div key={n} className="stepper-step">
                        <div className="stepper-circle-wrap">
                            <div className={`rn-stepper-circle stepper-circle${(done || active) ? ' is-filled' : ''}${active ? ' is-active' : ''}`}>
                                {done ? '✓' : n}
                            </div>
                            <span className={`rn-stepper-label stepper-label${active ? ' is-active' : ''}`}>
                                {label}
                            </span>
                        </div>
                        {i < 3 && (
                            <div className={`rn-stepper-line stepper-line${step > n ? ' is-done' : ''}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────
export default function Booking() {
    const { user } = useAuthStore()

    const [step, setStep] = useState(1)
    const [services, setServices] = useState([])
    const [selSvc, setSelSvc] = useState(null)

    const now = new Date()
    const [calYear, setCalYear] = useState(now.getFullYear())
    const [calMonth, setCalMonth] = useState(now.getMonth())
    const [selDate, setSelDate] = useState(null)

    const [slots, setSlots] = useState({ available: [], booked: [] })
    const [loadingSlots, setLoadSlots] = useState(false)
    const [selSlot, setSelSlot] = useState(null)

    const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchServices().then(({ data }) => setServices(data)).catch(() => { })
    }, [])

    useEffect(() => {
        if (user) setForm(f => ({
            name: f.name || user.name || '',
            phone: f.phone || user.phone || '',
            email: f.email || user.email || '',
            notes: f.notes,
        }))
    }, [user])

    const loadSlots = async (dateStr) => {
        setLoadSlots(true)
        try {
            const { data } = await fetchSlots(dateStr)
            setSlots(data)
        } catch {
            setSlots({ available: [], booked: [] })
        } finally {
            setLoadSlots(false)
        }
    }

    const pickDate = (day) => {
        const dateStr = toDateStr(calYear, calMonth, day)
        setSelDate(dateStr)
        setSelSlot(null)
        loadSlots(dateStr)
    }

    const handleForm = (e) => {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
    }

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const { data } = await createBooking({
                client: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined },
                service: selSvc._id,
                date: selDate,
                timeSlot: selSlot,
                notes: form.notes.trim() || undefined,
            })
            setResult(data)
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear la cita. Intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    const resetWizard = () => {
        setResult(null); setStep(1); setSelSvc(null)
        setSelDate(null); setSelSlot(null); setError('')
    }

    // ── Pantalla de éxito ─────────────────────────────────────────
    if (result) {
        const dateFormatted = new Date(result.date).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
        })
        return (
            <div className="booking-success-wrap">
                <div className="booking-success-card">
                    <div className="booking-success-icon">💅</div>
                    <h2 className="booking-success-title">
                        ¡Cita agendada!
                    </h2>
                    <p className="booking-success-sub">
                        Te esperamos con muchas ganas. 🌸
                    </p>
                    <div className="booking-summary-box">
                        {[
                            ['Servicio', result.service?.name || selSvc?.name],
                            ['Fecha', dateFormatted],
                            ['Hora', result.timeSlot],
                            ['Cliente', result.client?.name],
                        ].map(([k, v]) => (
                            <div key={k} className="booking-summary-row">
                                <span className="booking-summary-key">{k}</span>
                                <span className="booking-summary-value">{v}</span>
                            </div>
                        ))}
                    </div>
                    {result.client?.email && (
                        <p className="booking-success-email-note">
                            Recibirás confirmación en <strong>{result.client.email}</strong>
                        </p>
                    )}
                    <button onClick={resetWizard} className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                        Agendar otra cita
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>Agendar cita — Roxy Nails</title>
                <meta name="description" content="Agenda tu cita de manicure, pedicure o nail art." />
            </Helmet>

            {/* Header */}
            <div className="booking-header">
                <p className="booking-header-label">
                    Tu próxima sesión
                </p>
                <h1 className="booking-header-title">Agendar cita</h1>
                <p className="booking-header-sub">
                    Elige tu servicio, fecha y hora favorita en minutos.
                </p>
            </div>

            <div className="booking-container">
                <Stepper step={step} />

                {/* ── Paso 1: Servicio ─────────────────────────── */}
                {step === 1 && (
                    <div>
                        <h2 className="booking-step-title">
                            ¿Qué servicio deseas?
                        </h2>
                        <div className="booking-services-grid">
                            {services.map(svc => (
                                <div key={svc._id} onClick={() => setSelSvc(svc)} className={`booking-service-option${selSvc?._id === svc._id ? ' selected' : ''}`}>
                                    <div className="booking-service-icon">{CAT_ICONS[svc.category] || '💅'}</div>
                                    <div className="booking-service-name">{svc.name}</div>
                                    <div className="booking-service-price">${svc.price}</div>
                                    <div className="booking-service-duration">{svc.duration} min</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep(2)} disabled={!selSvc} className={`btn-primary${!selSvc ? ' is-disabled-look' : ''}`}
                            style={{ width: '100%' }}>
                            Siguiente →
                        </button>
                    </div>
                )}

                {/* ── Paso 2: Fecha (Calendario) ───────────────── */}
                {step === 2 && (
                    <div>
                        <h2 className="booking-step-title">
                            ¿Qué día te viene bien?
                        </h2>
                        <div className="booking-calendar-card">
                            {/* Navegación mes */}
                            <div className="booking-calendar-nav">
                                <button onClick={() => { const d = new Date(calYear, calMonth - 1, 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                                    className="booking-calendar-nav-btn">‹</button>
                                <span className="booking-calendar-month-label">{MONTHS[calMonth]} {calYear}</span>
                                <button onClick={() => { const d = new Date(calYear, calMonth + 1, 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                                    className="booking-calendar-nav-btn">›</button>
                            </div>

                            {/* Headers días */}
                            <div className="booking-calendar-days-header">
                                {DAYS.map(d => (
                                    <div key={d} className="booking-calendar-day-label">{d}</div>
                                ))}
                            </div>

                            {/* Grid días */}
                            <div className="booking-calendar-grid">
                                {getDaysGrid(calYear, calMonth).map((day, i) => {
                                    if (!day) return <div key={i} />
                                    const dateStr = toDateStr(calYear, calMonth, day)
                                    const disabled = isPastOrSunday(calYear, calMonth, day)
                                    const selected = dateStr === selDate
                                    return (
                                        <button key={i} onClick={() => !disabled && pickDate(day)} disabled={disabled}
                                            className={`booking-calendar-day${selected ? ' selected' : ''}`}
                                        >{day}</button>
                                    )
                                })}
                            </div>
                            <p className="booking-calendar-note">
                                Abrimos Lunes–Sábado. Los domingos estamos cerradas. 🌸
                            </p>
                        </div>
                        <div className="booking-nav-row with-margin">
                            <button onClick={() => setStep(1)} className="btn-ghost booking-btn-flex1">← Atrás</button>
                            <button onClick={() => setStep(3)} disabled={!selDate} className={`btn-primary booking-btn-flex2${!selDate ? ' is-disabled-look' : ''}`}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 3: Horario ─────────────────────────── */}
                {step === 3 && (
                    <div>
                        <h2 className="booking-step-title" style={{ marginBottom: 6 }}>
                            ¿A qué hora?
                        </h2>
                        <p className="booking-step-sub">
                            {new Date(selDate + 'T00:00:00').toLocaleDateString('es-ES', {
                                weekday: 'long', day: 'numeric', month: 'long',
                            })}
                        </p>

                        {loadingSlots ? (
                            <p className="booking-loading-note">
                                Consultando disponibilidad...
                            </p>
                        ) : (
                            <>
                                <div className="booking-slots-grid">
                                    {ALL_SLOTS.map(slot => {
                                        const avail = slots.available.includes(slot)
                                        const selected = slot === selSlot
                                        return (
                                            <button key={slot} onClick={() => avail && setSelSlot(slot)}
                                                className={`booking-slot-btn${selected ? ' selected' : ''}${!avail ? ' unavailable' : ''}`}>
                                                {slot}
                                                {!avail && <div className="booking-slot-unavailable-label">Ocupado</div>}
                                            </button>
                                        )
                                    })}
                                </div>
                                {slots.available.length === 0 && (
                                    <p className="booking-slots-empty-note">
                                        No hay horarios disponibles este día. Por favor elige otra fecha.
                                    </p>
                                )}
                            </>
                        )}

                        <div className="booking-nav-row">
                            <button onClick={() => { setStep(2); setSelSlot(null) }} className="btn-ghost booking-btn-flex1">← Atrás</button>
                            <button onClick={() => setStep(4)} disabled={!selSlot} className={`btn-primary booking-btn-flex2${!selSlot ? ' is-disabled-look' : ''}`}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 4: Datos de contacto ────────────────── */}
                {step === 4 && (
                    <div>
                        <h2 className="booking-step-title" style={{ marginBottom: 6 }}>
                            Tus datos de contacto
                        </h2>
                        <p className="booking-step-sub">
                            Te avisaremos para recordarte la cita.
                        </p>

                        {/* Resumen */}
                        <div className="booking-summary-box">
                            {[
                                ['Servicio', selSvc?.name],
                                ['Fecha', new Date(selDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })],
                                ['Hora', selSlot],
                                ['Precio', `$${selSvc?.price}`],
                            ].map(([k, v]) => (
                                <div key={k} className="booking-summary-row">
                                    <span className="booking-summary-key">{k}</span>
                                    <span className="booking-summary-value">{v}</span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={submit} className="booking-form">
                            {[
                                { name: 'name', label: 'Nombre completo *', type: 'text', placeholder: 'Tu nombre', required: true },
                                { name: 'phone', label: 'Teléfono / WhatsApp *', type: 'tel', placeholder: '+1 234 567 8900', required: true },
                                { name: 'email', label: 'Email (para confirmación)', type: 'email', placeholder: 'opcional', required: false },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="booking-field-label">{f.label}</label>
                                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleForm}
                                        placeholder={f.placeholder} required={f.required} className="booking-input" />
                                </div>
                            ))}

                            <div>
                                <label className="booking-field-label">
                                    Notas (alergias, diseño, color…)
                                </label>
                                <textarea name="notes" value={form.notes} onChange={handleForm} rows={3}
                                    placeholder="Opcional" className="booking-input" style={{ resize: 'vertical' }} />
                            </div>

                            {error && (
                                <div className="booking-error-box">
                                    {error}
                                </div>
                            )}

                            <div className="booking-nav-row" style={{ marginTop: 4 }}>
                                <button type="button" onClick={() => setStep(3)} className="btn-ghost booking-btn-flex1">
                                    ← Atrás
                                </button>
                                <button type="submit" disabled={submitting} className={`btn-primary booking-btn-flex2${submitting ? ' is-disabled-look' : ''}`}>
                                    {submitting ? 'Confirmando...' : 'Confirmar cita 💅'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

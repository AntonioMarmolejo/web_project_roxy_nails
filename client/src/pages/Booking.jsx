import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices } from '../api/services'
import { fetchSlots, createBooking } from '../api/bookings'

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {labels.map((label, i) => {
                const n = i + 1
                const done = step > n
                const active = step === n
                return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: done || active ? '#C2185B' : '#F0D0DC',
                                color: done || active ? '#fff' : '#9E7080',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 600,
                                boxShadow: active ? '0 0 0 4px rgba(194,24,91,0.2)' : 'none',
                                transition: 'all 0.25s',
                            }}>{done ? '✓' : n}</div>
                            <span style={{ fontSize: 11, color: active ? '#C2185B' : '#9E7080', fontWeight: active ? 600 : 400 }}>
                                {label}
                            </span>
                        </div>
                        {i < 3 && (
                            <div style={{
                                width: 52, height: 2, margin: '0 4px', marginBottom: 22,
                                background: step > n ? '#C2185B' : '#F0D0DC',
                                transition: 'background 0.3s',
                            }} />
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
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: '#FDF0F5' }}>
                <div style={{
                    background: '#fff', border: '1px solid #F0D0DC', borderRadius: 22,
                    padding: '3rem 2.5rem', textAlign: 'center', maxWidth: 460, width: '100%',
                    boxShadow: '0 12px 40px rgba(194,24,91,0.12)',
                }}>
                    <div style={{ fontSize: 56, marginBottom: '1.25rem' }}>💅</div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#C2185B', marginBottom: 10 }}>
                        ¡Cita agendada!
                    </h2>
                    <p style={{ fontSize: 15, color: '#9E7080', marginBottom: '2rem' }}>
                        Te esperamos con muchas ganas. 🌸
                    </p>
                    <div style={{ background: '#FDF0F5', borderRadius: 14, padding: '1.25rem 1.5rem', textAlign: 'left', marginBottom: '1.75rem' }}>
                        {[
                            ['Servicio', result.service?.name || selSvc?.name],
                            ['Fecha', dateFormatted],
                            ['Hora', result.timeSlot],
                            ['Cliente', result.client?.name],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                                <span style={{ color: '#9E7080' }}>{k}</span>
                                <span style={{ color: '#2D1520', fontWeight: 500 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    {result.client?.email && (
                        <p style={{ fontSize: 13, color: '#9E7080', marginBottom: '1.5rem' }}>
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

    const inputSt = {
        width: '100%', padding: '12px 14px', border: '1px solid #F0D0DC',
        borderRadius: 10, fontSize: 14, fontFamily: 'Inter, sans-serif',
        outline: 'none', color: '#2D1520', background: '#fff',
    }

    return (
        <>
            <Helmet>
                <title>Agendar cita — Roxy Nails</title>
                <meta name="description" content="Agenda tu cita de manicure, pedicure o nail art." />
            </Helmet>

            {/* Header */}
            <div style={{ background: '#FDF0F5', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #F0D0DC' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 8 }}>
                    Tu próxima sesión
                </p>
                <h1 style={{ fontSize: 34, marginBottom: 8 }}>Agendar cita</h1>
                <p style={{ fontSize: 15, color: '#9E7080', maxWidth: 420, margin: '0 auto' }}>
                    Elige tu servicio, fecha y hora favorita en minutos.
                </p>
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
                <Stepper step={step} />

                {/* ── Paso 1: Servicio ─────────────────────────── */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: 19, fontWeight: 600, color: '#2D1520', marginBottom: '1.5rem' }}>
                            ¿Qué servicio deseas?
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 12, marginBottom: '2rem' }}>
                            {services.map(svc => (
                                <div key={svc._id} onClick={() => setSelSvc(svc)} style={{
                                    border: `2px solid ${selSvc?._id === svc._id ? '#C2185B' : '#F0D0DC'}`,
                                    background: selSvc?._id === svc._id ? '#FDF0F5' : '#fff',
                                    borderRadius: 14, padding: '1.1rem 0.9rem',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>{CAT_ICONS[svc.category] || '💅'}</div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2D1520', marginBottom: 4 }}>{svc.name}</div>
                                    <div style={{ fontSize: 14, color: '#C2185B', fontWeight: 700 }}>${svc.price}</div>
                                    <div style={{ fontSize: 11, color: '#9E7080' }}>{svc.duration} min</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep(2)} disabled={!selSvc} className="btn-primary"
                            style={{ width: '100%', opacity: selSvc ? 1 : 0.45 }}>
                            Siguiente →
                        </button>
                    </div>
                )}

                {/* ── Paso 2: Fecha (Calendario) ───────────────── */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: 19, fontWeight: 600, color: '#2D1520', marginBottom: '1.5rem' }}>
                            ¿Qué día te viene bien?
                        </h2>
                        <div style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 18, padding: '1.75rem' }}>
                            {/* Navegación mes */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <button onClick={() => { const d = new Date(calYear, calMonth - 1, 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#C2185B', lineHeight: 1, padding: '4px 10px' }}>‹</button>
                                <span style={{ fontSize: 16, fontWeight: 600, color: '#2D1520' }}>{MONTHS[calMonth]} {calYear}</span>
                                <button onClick={() => { const d = new Date(calYear, calMonth + 1, 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#C2185B', lineHeight: 1, padding: '4px 10px' }}>›</button>
                            </div>

                            {/* Headers días */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                                {DAYS.map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#9E7080', fontWeight: 600, padding: '4px 0' }}>{d}</div>
                                ))}
                            </div>

                            {/* Grid días */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                                {getDaysGrid(calYear, calMonth).map((day, i) => {
                                    if (!day) return <div key={i} />
                                    const dateStr = toDateStr(calYear, calMonth, day)
                                    const disabled = isPastOrSunday(calYear, calMonth, day)
                                    const selected = dateStr === selDate
                                    return (
                                        <button key={i} onClick={() => !disabled && pickDate(day)} style={{
                                            aspectRatio: '1', borderRadius: 8, border: 'none',
                                            background: selected ? '#C2185B' : 'transparent',
                                            color: selected ? '#fff' : disabled ? '#DFC8D0' : '#2D1520',
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            fontSize: 13, fontWeight: selected ? 600 : 400,
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => { if (!disabled && !selected) e.currentTarget.style.background = '#FDF0F5' }}
                                            onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                                        >{day}</button>
                                    )
                                })}
                            </div>
                            <p style={{ fontSize: 12, color: '#9E7080', marginTop: '1.25rem', textAlign: 'center' }}>
                                Abrimos Lunes–Sábado. Los domingos estamos cerradas. 🌸
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                            <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1 }}>← Atrás</button>
                            <button onClick={() => setStep(3)} disabled={!selDate} className="btn-primary"
                                style={{ flex: 2, opacity: selDate ? 1 : 0.45 }}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 3: Horario ─────────────────────────── */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontSize: 19, fontWeight: 600, color: '#2D1520', marginBottom: 6 }}>
                            ¿A qué hora?
                        </h2>
                        <p style={{ fontSize: 14, color: '#9E7080', marginBottom: '1.75rem' }}>
                            {new Date(selDate + 'T00:00:00').toLocaleDateString('es-ES', {
                                weekday: 'long', day: 'numeric', month: 'long',
                            })}
                        </p>

                        {loadingSlots ? (
                            <p style={{ textAlign: 'center', color: '#9E7080', padding: '2rem 0', fontSize: 14 }}>
                                Consultando disponibilidad...
                            </p>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.75rem' }}>
                                    {ALL_SLOTS.map(slot => {
                                        const avail = slots.available.includes(slot)
                                        const selected = slot === selSlot
                                        return (
                                            <button key={slot} onClick={() => avail && setSelSlot(slot)} style={{
                                                padding: '13px 8px', borderRadius: 12, fontSize: 15, fontWeight: 500,
                                                border: `2px solid ${selected ? '#C2185B' : avail ? '#F0D0DC' : '#F5EAEF'}`,
                                                background: selected ? '#C2185B' : avail ? '#fff' : '#FAFAFA',
                                                color: selected ? '#fff' : avail ? '#2D1520' : '#CCAABB',
                                                cursor: avail ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.15s',
                                            }}>
                                                {slot}
                                                {!avail && <div style={{ fontSize: 10, color: '#CCAABB', marginTop: 3 }}>Ocupado</div>}
                                            </button>
                                        )
                                    })}
                                </div>
                                {slots.available.length === 0 && (
                                    <p style={{ textAlign: 'center', color: '#9E7080', fontSize: 14, marginBottom: '1.5rem' }}>
                                        No hay horarios disponibles este día. Por favor elige otra fecha.
                                    </p>
                                )}
                            </>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => { setStep(2); setSelSlot(null) }} className="btn-ghost" style={{ flex: 1 }}>← Atrás</button>
                            <button onClick={() => setStep(4)} disabled={!selSlot} className="btn-primary"
                                style={{ flex: 2, opacity: selSlot ? 1 : 0.45 }}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 4: Datos de contacto ────────────────── */}
                {step === 4 && (
                    <div>
                        <h2 style={{ fontSize: 19, fontWeight: 600, color: '#2D1520', marginBottom: 6 }}>
                            Tus datos de contacto
                        </h2>
                        <p style={{ fontSize: 14, color: '#9E7080', marginBottom: '1.5rem' }}>
                            Te avisaremos para recordarte la cita.
                        </p>

                        {/* Resumen */}
                        <div style={{ background: '#FDF0F5', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
                            {[
                                ['Servicio', selSvc?.name],
                                ['Fecha', new Date(selDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })],
                                ['Hora', selSlot],
                                ['Precio', `$${selSvc?.price}`],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span style={{ color: '#9E7080' }}>{k}</span>
                                    <span style={{ color: '#2D1520', fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'name', label: 'Nombre completo *', type: 'text', placeholder: 'Tu nombre', required: true },
                                { name: 'phone', label: 'Teléfono / WhatsApp *', type: 'tel', placeholder: '+1 234 567 8900', required: true },
                                { name: 'email', label: 'Email (para confirmación)', type: 'email', placeholder: 'opcional', required: false },
                            ].map(f => (
                                <div key={f.name}>
                                    <label style={{ fontSize: 13, color: '#6B4050', marginBottom: 6, display: 'block' }}>{f.label}</label>
                                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleForm}
                                        placeholder={f.placeholder} required={f.required} style={inputSt} />
                                </div>
                            ))}

                            <div>
                                <label style={{ fontSize: 13, color: '#6B4050', marginBottom: 6, display: 'block' }}>
                                    Notas (alergias, diseño, color…)
                                </label>
                                <textarea name="notes" value={form.notes} onChange={handleForm} rows={3}
                                    placeholder="Opcional" style={{ ...inputSt, resize: 'vertical' }} />
                            </div>

                            {error && (
                                <div style={{ color: '#C2185B', fontSize: 13, background: '#FDF0F5', borderRadius: 10, padding: '10px 14px' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button type="button" onClick={() => setStep(3)} className="btn-ghost" style={{ flex: 1 }}>
                                    ← Atrás
                                </button>
                                <button type="submit" disabled={submitting} className="btn-primary"
                                    style={{ flex: 2, opacity: submitting ? 0.7 : 1 }}>
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

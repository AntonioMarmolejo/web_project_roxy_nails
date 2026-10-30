import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices } from '../api/services'
import { fetchSlots, createBooking } from '../api/bookings'
import '../styles/Booking.css'
import { brand } from '../config/brand'
import { categoryIcon, formatPrice, formatDuration, hasPrice } from '../config/services'
import PaymentMethods, { PREPAID_OPTIONS } from '../components/PaymentMethods'
import { PAYMENT_LABELS, isPrepaid, receiptWhatsappUrl } from '../config/payments'
import { drawTicket, saveTicket } from '../utils/bookingTicket'
import { bookingCode, bookingQrDataUrl } from '../utils/turnos'

// ─── Calendar helpers ────────────────────────────────────────────
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const ALL_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

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

// "10:00" + 90 min → "10:00 – 11:30" (solo la hora de inicio si no hay duración)
function timeRange(slot, duration) {
    if (!slot || !duration) return slot
    const total = Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3)) + duration
    const end = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
    return `${slot} – ${end}`
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
        <div className="booking-stepper">
            {labels.map((label, i) => {
                const n = i + 1
                const done = step > n
                const active = step === n
                return (
                    <div key={n} className="booking-stepper__step">
                        <div className="booking-stepper__circle-wrap">
                            <div className={`booking-stepper__circle${(done || active) ? ' booking-stepper__circle--filled' : ''}${active ? ' booking-stepper__circle--active' : ''}`}>
                                {done ? '✓' : n}
                            </div>
                            <span className={`booking-stepper__label${active ? ' booking-stepper__label--active' : ''}`}>
                                {label}
                            </span>
                        </div>
                        {i < 3 && (
                            <div className={`booking-stepper__line${step > n ? ' booking-stepper__line--done' : ''}`} />
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
    const location = useLocation()

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
    const [slotNotice, setSlotNotice] = useState('')

    const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
    const [prepay, setPrepay] = useState(false)               // ¿paga por adelantado?
    const [payMethod, setPayMethod] = useState('qr_deuna')
    const [savingTicket, setSavingTicket] = useState(false)
    const [qrImage, setQrImage] = useState(null)              // QR del comprobante (lo escanea el local)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!result) { setQrImage(null); return }
        bookingQrDataUrl(bookingCode(result)).then(setQrImage).catch(() => setQrImage(null))
    }, [result])

    useEffect(() => {
        fetchServices().then(({ data }) => setServices(data)).catch(() => { })
    }, [])

    // Al cambiar de paso, subir hasta el inicio del formulario (si no, se queda a mitad de página)
    const containerRef = useRef(null)
    const firstStep = useRef(true)
    useEffect(() => {
        if (firstStep.current) { firstStep.current = false; return }
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [step])

    useEffect(() => {
        const id = location.state?.serviceId
        if (!id || services.length === 0) return
        const match = services.find(s => s._id === id)
        if (!match) return
        setSelSvc(match)
        // Llevar la vista al servicio elegido desde la tarjeta, para que se vea sin buscarlo
        const timer = setTimeout(() => {
            document.querySelector(`[data-service-id="${id}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)
        return () => clearTimeout(timer)
    }, [services, location.state])

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
            const { data } = await fetchSlots(dateStr, selSvc?._id)
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
        setSlotNotice('')
    }

    // Las horas libres dependen de la fecha y de cuánto dura el servicio elegido
    useEffect(() => {
        if (!selDate || !selSvc) return
        setSelSlot(null)
        loadSlots(selDate)
    }, [selDate, selSvc?._id])

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
                paymentMethod: prepay && hasPrice(selSvc) ? payMethod : 'local',
            })
            setResult(data)
        } catch (err) {
            const message = err.response?.data?.message
            if (err.response?.status === 409) {
                // Otra persona tomó esa hora mientras tanto: volver a elegir con la disponibilidad al día
                setSelSlot(null)
                setSlotNotice(message)
                setStep(3)
                loadSlots(selDate)
                return
            }
            setError(message || 'Error al crear la cita. Intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    const resetWizard = () => {
        setResult(null); setStep(1); setSelSvc(null)
        setSelDate(null); setSelSlot(null); setError(''); setSlotNotice(''); setPrepay(false)
    }

    // ── Pantalla de éxito ─────────────────────────────────────────
    if (result) {
        const dateFormatted = new Date(result.date).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
        })
        const prepaid = isPrepaid(result.paymentMethod)
        const serviceName = result.service?.name || selSvc?.name
        const time = timeRange(result.timeSlot, selSvc?.duration)
        const code = bookingCode(result)
        const rows = [
            ['Servicio', serviceName],
            ['Fecha', dateFormatted],
            ['Hora', time],
            ['Cliente', result.client?.name],
            prepaid ? ['Pago adelantado', PAYMENT_LABELS[result.paymentMethod]] : ['Pago', 'En el local'],
        ]

        const downloadTicket = async () => {
            setSavingTicket(true)
            try {
                const blob = await drawTicket({
                    rows: rows.map(([k, v]) => [k, k === 'Fecha' ? v.charAt(0).toUpperCase() + v.slice(1) : v]),
                    code,
                    qr: qrImage,
                    note: prepaid ? 'Recuerda enviar tu comprobante de pago por WhatsApp' : '',
                })
                await saveTicket(blob, `cita-captains-${result.date.slice(0, 10)}-${result.timeSlot.replace(':', 'h')}.png`)
            } finally {
                setSavingTicket(false)
            }
        }
        const receiptText = `Hola, envío el comprobante de pago de mi cita en ${brand.fullName}: ${serviceName}, ${dateFormatted} a las ${result.timeSlot}, a nombre de ${result.client?.name} (código ${code}).`
        return (
            <div className="booking__success-wrap">
                <div className="booking__success-card">
                    <div className="booking__success-icon">✂️</div>
                    <h2 className="booking__success-title">
                        ¡Cita agendada!
                    </h2>
                    <p className="booking__success-sub">
                        Te esperamos con muchas ganas.
                    </p>
                    {qrImage && (
                        <div className="booking__qr">
                            <img src={qrImage} alt={`Código QR de la cita ${code}`} />
                            <p>Muestra este QR al llegar · <strong>{code}</strong></p>
                        </div>
                    )}
                    <div className="booking__summary-box">
                        {[...rows, ['Código', code]].map(([k, v]) => (
                            <div key={k} className="booking__summary-row">
                                <span className="booking__summary-key">{k}</span>
                                <span className="booking__summary-value">{v}</span>
                            </div>
                        ))}
                    </div>
                    <p className="booking__success-email-note">
                        Tu cita queda <strong>pendiente</strong>: te la confirmaremos por WhatsApp al <strong>{result.client?.phone}</strong>
                        {(result.client?.email || user?.email) && <> y por correo a <strong>{result.client?.email || user.email}</strong></>}.
                    </p>
                    <div className="booking__success-actions">
                        <button onClick={downloadTicket} disabled={savingTicket} className="btn btn--primary">
                            {savingTicket ? 'Preparando...' : '⬇ Descargar comprobante'}
                        </button>
                        {prepaid && (
                            <a href={receiptWhatsappUrl(receiptText)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                                📲 Enviar comprobante de pago
                            </a>
                        )}
                        <button onClick={resetWizard} className="btn btn--ghost">
                            Agendar otra cita
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>{`Agendar cita — ${brand.fullName}`}</title>
                <meta name="description" content={`Agenda tu cita en ${brand.fullName}: tratamientos capilares, uñas, cejas y pestañas.`} />
            </Helmet>

            <PageHeader
                label="Tu próxima sesión"
                title="Agendar cita"
                subtitle="Elige tu servicio, fecha y hora favorita en minutos."
            />

            <div ref={containerRef} className={`booking__container${step === 1 && selSvc ? ' booking__container--floating-next' : ''}`}>
                <Stepper step={step} />

                {/* ── Paso 1: Servicio ─────────────────────────── */}
                {step === 1 && (
                    <div>
                        <h2 className="booking__step-title">
                            ¿Qué servicio deseas?
                        </h2>
                        <div className="booking__services-grid">
                            {services.map(svc => (
                                <div key={svc._id} data-service-id={svc._id} onClick={() => setSelSvc(svc)} className={`booking__service-option${selSvc?._id === svc._id ? ' booking__service-option--selected' : ''}`}>
                                    <div className="booking__service-image">
                                        {svc.image
                                            ? <img src={svc.image} alt={svc.name} />
                                            : categoryIcon(svc.category)
                                        }
                                    </div>
                                    <div className="booking__service-body">
                                        <div className="booking__service-name">{svc.name}</div>
                                        <div className="booking__service-meta">
                                            <span className="booking__service-price">{formatPrice(svc.price)}</span>
                                            <span className="booking__service-duration">{formatDuration(svc.duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Al elegir un servicio aparece fijo abajo, para no tener que bajar hasta el final de la lista */}
                        {selSvc && (
                            <button onClick={() => setStep(2)} className="btn btn--primary booking__floating-next">
                                <span className="booking__floating-next-name">{selSvc.name}</span>
                                <span className="booking__floating-next-label">Siguiente →</span>
                            </button>
                        )}
                    </div>
                )}

                {/* ── Paso 2: Fecha (Calendario) ───────────────── */}
                {step === 2 && (
                    <div>
                        <h2 className="booking__step-title">
                            ¿Qué día te viene bien?
                        </h2>
                        <div className="booking__calendar-card">
                            {/* Navegación mes */}
                            <div className="booking__calendar-nav">
                                <button onClick={() => { const d = new Date(calYear, calMonth - 1, 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                                    className="booking__calendar-nav-btn">‹</button>
                                <span className="booking__calendar-month-label">{MONTHS[calMonth]} {calYear}</span>
                                <button onClick={() => { const d = new Date(calYear, calMonth + 1, 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                                    className="booking__calendar-nav-btn">›</button>
                            </div>

                            {/* Headers días */}
                            <div className="booking__calendar-days-header">
                                {DAYS.map(d => (
                                    <div key={d} className="booking__calendar-day-label">{d}</div>
                                ))}
                            </div>

                            {/* Grid días */}
                            <div className="booking__calendar-grid">
                                {getDaysGrid(calYear, calMonth).map((day, i) => {
                                    if (!day) return <div key={i} />
                                    const dateStr = toDateStr(calYear, calMonth, day)
                                    const disabled = isPastOrSunday(calYear, calMonth, day)
                                    const selected = dateStr === selDate
                                    return (
                                        <button key={i} onClick={() => !disabled && pickDate(day)} disabled={disabled}
                                            className={`booking__calendar-day${selected ? ' booking__calendar-day--selected' : ''}`}
                                        >{day}</button>
                                    )
                                })}
                            </div>
                            <p className="booking__calendar-note">
                                Abrimos Lunes–Sábado. Los domingos estamos cerrados.
                            </p>
                        </div>
                        <div className="booking__nav-row booking__nav-row--with-margin">
                            <button onClick={() => setStep(1)} className="btn btn--ghost booking__btn-flex1">← Atrás</button>
                            <button onClick={() => setStep(3)} disabled={!selDate} className={`btn btn--primary booking__btn-flex2${!selDate ? ' btn--disabled' : ''}`}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 3: Horario ─────────────────────────── */}
                {step === 3 && (
                    <div>
                        <h2 className="booking__step-title" style={{ marginBottom: 6 }}>
                            ¿A qué hora?
                        </h2>
                        <p className="booking__step-sub">
                            {new Date(selDate + 'T00:00:00').toLocaleDateString('es-ES', {
                                weekday: 'long', day: 'numeric', month: 'long',
                            })}
                        </p>
                        {selSvc?.duration > 60 && (
                            <p className="booking__step-sub">
                                {selSvc.name} dura {formatDuration(selSvc.duration)}: solo se muestran las horas en las que alcanza a terminar.
                            </p>
                        )}

                        {slotNotice && (
                            <div className="booking__error-box" style={{ marginBottom: 14 }}>{slotNotice}</div>
                        )}

                        {loadingSlots ? (
                            <p className="booking__loading-note">
                                Consultando disponibilidad...
                            </p>
                        ) : (
                            <>
                                <div className="booking__slots-grid">
                                    {ALL_SLOTS.map(slot => {
                                        const avail = slots.available.includes(slot)
                                        const selected = slot === selSlot
                                        return (
                                            <button key={slot} onClick={() => { if (avail) { setSelSlot(slot); setSlotNotice('') } }}
                                                className={`booking__slot-btn${selected ? ' booking__slot-btn--selected' : ''}${!avail ? ' booking__slot-btn--unavailable' : ''}`}>
                                                {slot}
                                                {!avail && <div className="booking__slot-unavailable-label">No disponible</div>}
                                            </button>
                                        )
                                    })}
                                </div>
                                {slots.available.length === 0 && (
                                    <p className="booking__slots-empty-note">
                                        No hay horarios disponibles este día. Por favor elige otra fecha.
                                    </p>
                                )}
                            </>
                        )}

                        <div className="booking__nav-row">
                            <button onClick={() => { setStep(2); setSelSlot(null) }} className="btn btn--ghost booking__btn-flex1">← Atrás</button>
                            <button onClick={() => setStep(4)} disabled={!selSlot} className={`btn btn--primary booking__btn-flex2${!selSlot ? ' btn--disabled' : ''}`}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 4: Datos de contacto ────────────────── */}
                {step === 4 && (
                    <div>
                        <h2 className="booking__step-title" style={{ marginBottom: 6 }}>
                            Tus datos de contacto
                        </h2>
                        <p className="booking__step-sub">
                            Te avisaremos para recordarte la cita.
                        </p>

                        {/* Resumen */}
                        <div className="booking__summary-box">
                            {[
                                ['Servicio', selSvc?.name],
                                ['Fecha', new Date(selDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })],
                                ['Hora', timeRange(selSlot, selSvc?.duration)],
                                ['Precio', formatPrice(selSvc?.price)],
                            ].map(([k, v]) => (
                                <div key={k} className="booking__summary-row">
                                    <span className="booking__summary-key">{k}</span>
                                    <span className="booking__summary-value">{v}</span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={submit} className="booking__form">
                            {[
                                { name: 'name', label: 'Nombre completo *', type: 'text', placeholder: 'Tu nombre', required: true },
                                { name: 'phone', label: 'Teléfono / WhatsApp *', type: 'tel', placeholder: '+1 234 567 8900', required: true },
                                { name: 'email', label: 'Email (para confirmación)', type: 'email', placeholder: 'opcional', required: false },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="booking__field-label">{f.label}</label>
                                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleForm}
                                        placeholder={f.placeholder} required={f.required} className="booking__input" />
                                </div>
                            ))}

                            <div>
                                <label className="booking__field-label">
                                    Notas (alergias, diseño, color…)
                                </label>
                                <textarea name="notes" value={form.notes} onChange={handleForm} rows={3}
                                    placeholder="Opcional" className="booking__input" style={{ resize: 'vertical' }} />
                            </div>

                            {/* Pago por adelantado (opcional) */}
                            <div className="checkout__payment-box" style={{ marginTop: 0 }}>
                                {hasPrice(selSvc) ? (
                                    <>
                                        <button type="button" onClick={() => setPrepay(p => !p)}
                                            className={`checkout__payment-option${prepay ? ' checkout__payment-option--active' : ''}`}>
                                            <span className="checkout__payment-option-icon">💳</span>
                                            <span className="checkout__payment-option-label">
                                                ¿Deseas pagar por adelantado? <strong>{formatPrice(selSvc.price)}</strong>
                                            </span>
                                            <span className="checkout__payment-option-badge">{prepay ? 'Sí' : 'No'}</span>
                                        </button>
                                        {prepay ? (
                                            <div style={{ marginTop: 10 }}>
                                                <PaymentMethods options={PREPAID_OPTIONS} value={payMethod} onChange={setPayMethod} amount={selSvc.price} />
                                            </div>
                                        ) : (
                                            <p className="booking__pay-note">Si no, pagas en el local el día de tu cita.</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="booking__pay-note" style={{ marginTop: 0 }}>
                                        💵 Este servicio no tiene precio fijo: el pago se hace en el local.
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="booking__error-box">
                                    {error}
                                </div>
                            )}

                            <div className="booking__nav-row" style={{ marginTop: 4 }}>
                                <button type="button" onClick={() => setStep(3)} className="btn btn--ghost booking__btn-flex1">
                                    ← Atrás
                                </button>
                                <button type="submit" disabled={submitting} className={`btn btn--primary booking__btn-flex2${submitting ? ' btn--disabled' : ''}`}>
                                    {submitting ? 'Confirmando...' : 'Confirmar cita'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

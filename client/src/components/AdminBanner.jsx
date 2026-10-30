import { useEffect, useState } from 'react'
import { fetchBannerAdmin, saveBanner } from '../api/banner'
import PromoBanner from './PromoBanner'
import '../styles/Home.css'
import { SkeletonList } from './Skeleton'

const EMPTY = { active: false, emoji: '', highlight: '', message: '', linkText: '', linkTo: '', startsAt: '', endsAt: '' }

// ISO → 'YYYY-MM-DD' en hora local (para <input type="date">)
const toDateInput = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
// 'YYYY-MM-DD' → ISO: inicio al empezar el día, fin al terminarlo (hora local)
const fromDateInput = (value, endOfDay) =>
    value ? new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString() : null

const fmt = (iso) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export default function AdminBanner({ showToast }) {
    const [form, setForm] = useState(EMPTY)
    const [saved, setSaved] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const load = (data) => {
        setSaved(data)
        setForm({
            active: !!data.active, emoji: data.emoji || '', highlight: data.highlight || '', message: data.message || '',
            linkText: data.linkText || '', linkTo: data.linkTo || '',
            startsAt: toDateInput(data.startsAt), endsAt: toDateInput(data.endsAt),
        })
    }

    useEffect(() => {
        fetchBannerAdmin()
            .then(({ data }) => load(data))
            .catch(() => showToast('Error al cargar el banner'))
            .finally(() => setLoading(false))
    }, [])

    const handle = (e) => {
        const { name, value, type, checked } = e.target
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }

    const submit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            const { data } = await saveBanner({
                ...form,
                startsAt: fromDateInput(form.startsAt, false),
                endsAt: fromDateInput(form.endsAt, true),
            })
            load(data)
            showToast(data.visibleNow ? 'Banner guardado y visible en el inicio ✓' : 'Banner guardado (no visible ahora) ✓')
        } catch (err) { showToast(err.response?.data?.message || 'Error al guardar') }
        finally { setSaving(false) }
    }

    if (loading) return <SkeletonList count={2} label="Cargando banner" />

    // Estado actual según lo guardado
    let status = { label: 'Oculto', color: 'var(--color-neutral)', bg: 'var(--color-neutral-bg)' }
    if (saved?.visibleNow) status = { label: 'Visible ahora en el inicio', color: 'var(--color-success)', bg: 'var(--color-success-bg)' }
    else if (saved?.active && saved?.startsAt && new Date(saved.startsAt) > new Date()) status = { label: `Programado desde el ${fmt(saved.startsAt)}`, color: 'var(--color-info)', bg: 'var(--color-info-bg)' }
    else if (saved?.active && saved?.endsAt && new Date(saved.endsAt) < new Date()) status = { label: `Terminó el ${fmt(saved.endsAt)}`, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' }

    const hasText = form.highlight || form.message

    return (
        <div className="admin__split">
            {/* Vista previa */}
            <div>
                <h2 className="admin__list-title">Banner del inicio</h2>
                <p style={{ marginBottom: 12 }}>
                    <span className="admin__item-badge" style={{ '--badge-bg': status.bg, '--badge-color': status.color }}>{status.label}</span>
                </p>
                <p className="admin__hint" style={{ marginBottom: 8 }}>Vista previa (con los cambios sin guardar):</p>
                <div className="admin__banner-preview">
                    {hasText
                        ? <PromoBanner banner={form} />
                        : <div className="admin__list-empty">Escribe un texto para ver la vista previa.</div>}
                </div>
                <p className="admin__hint" style={{ marginTop: 12 }}>
                    El banner aparece arriba del todo en la página de inicio. Si pones fechas, se muestra y se oculta solo.
                </p>
            </div>

            {/* Formulario */}
            <div className="admin__form-panel">
                <h2 className="admin__form-title">Editar banner</h2>
                <form onSubmit={submit} className="admin__form">
                    <label className="admin__checkbox-label">
                        <input type="checkbox" name="active" checked={form.active} onChange={handle} />
                        Mostrar el banner en el inicio
                    </label>
                    <div className="admin__form-row">
                        <div style={{ maxWidth: 90 }}><label className="admin__label">Emoji</label><input name="emoji" value={form.emoji} onChange={handle} className="admin__input" placeholder="🎉" maxLength={8} /></div>
                        <div><label className="admin__label">Texto destacado</label><input name="highlight" value={form.highlight} onChange={handle} className="admin__input" placeholder="Julio: 20% OFF" maxLength={60} /></div>
                    </div>
                    <div><label className="admin__label">Mensaje</label><input name="message" value={form.message} onChange={handle} className="admin__input" placeholder="en laminado de cejas + pestañas por punto" maxLength={160} /></div>
                    <div className="admin__form-row">
                        <div><label className="admin__label">Texto del enlace</label><input name="linkText" value={form.linkText} onChange={handle} className="admin__input" placeholder="Agenda tu cita hoy" maxLength={40} /></div>
                        <div><label className="admin__label">Destino del enlace</label><input name="linkTo" value={form.linkTo} onChange={handle} className="admin__input" placeholder="/agendar" maxLength={300} /></div>
                    </div>
                    <p className="admin__hint">Destino: una página del sitio (/agendar, /servicios, /tienda, /talleres) o una URL que empiece por https://. Déjalo vacío si no quieres enlace.</p>
                    <div className="admin__form-row">
                        <div><label className="admin__label">Desde (opcional)</label><input type="date" name="startsAt" value={form.startsAt} onChange={handle} className="admin__input" /></div>
                        <div><label className="admin__label">Hasta (opcional)</label><input type="date" name="endsAt" value={form.endsAt} onChange={handle} className="admin__input" /></div>
                    </div>
                    <div className="admin__form-actions">
                        <button type="submit" disabled={saving} className="admin__submit-btn">
                            {saving ? 'Guardando...' : 'Guardar banner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

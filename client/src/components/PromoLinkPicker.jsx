import { useState } from 'react'
import { brand } from '../config/brand'

// Páginas del sitio que se pueden elegir como destino de una promoción (portada y banner)
export const PROMO_PAGES = [
    { to: '/agendar', label: 'Agendar (sin servicio elegido)' },
    { to: '/servicios', label: 'Servicios' },
    { to: '/galeria', label: 'Galería' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/talleres', label: 'Talleres' },
]

const WA_PREFIX = `${brand.whatsappUrl}?text=`
const SERVICE_PREFIX = '/agendar?servicio='

// Enlace a WhatsApp del local con un mensaje que nombra la promoción
export const promoWhatsappLink = (title) => WA_PREFIX + encodeURIComponent(
    `Hola, vi en www.roxynail.com la promoción "${title.trim() || 'de la portada'}" y me interesa. ¿Me pueden dar más información?`
)
export const isPromoWhatsappLink = (link = '') => link.startsWith(WA_PREFIX)

// Qué tipo de destino es un enlace guardado: '', una página, un servicio, WhatsApp u otro
function kindOf(link) {
    if (!link) return ''
    if (PROMO_PAGES.some(p => p.to === link) || link.startsWith(SERVICE_PREFIX)) return link
    if (isPromoWhatsappLink(link)) return 'whatsapp'
    return 'other'
}

// Selector del destino de un botón o enlace de promoción: página, servicio para agendar, WhatsApp u otro enlace escrito a mano
export default function PromoLinkPicker({ name, value, onChange, services, title }) {
    const [custom, setCustom] = useState(kindOf(value) === 'other')
    const kind = custom ? 'other' : kindOf(value)
    const set = (link) => onChange({ target: { name, value: link } })

    const pick = (e) => {
        const v = e.target.value
        setCustom(v === 'other')
        if (v === 'other') set(kindOf(value) === 'other' ? value : '')
        else if (v === 'whatsapp') set(promoWhatsappLink(title))
        else set(v)
    }

    // Un servicio guardado que ya no está activo sigue apareciendo, para no perderlo al editar
    const savedId = value.startsWith(SERVICE_PREFIX) ? value.slice(SERVICE_PREFIX.length) : null
    const missing = savedId && services && !services.some(s => s._id === savedId)

    return (
        <>
            <select value={kind} onChange={pick} className="admin__input">
                <option value="">Sin enlace</option>
                <optgroup label="Páginas">
                    {PROMO_PAGES.map(p => <option key={p.to} value={p.to}>{p.label}</option>)}
                </optgroup>
                <optgroup label="Agendar un servicio">
                    {!services && <option disabled>Cargando servicios…</option>}
                    {services?.map(s => <option key={s._id} value={SERVICE_PREFIX + s._id}>{s.name}</option>)}
                    {missing && <option value={value}>Servicio ya no disponible</option>}
                </optgroup>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Otro enlace…</option>
            </select>
            {kind === 'other' && (
                <input name={name} value={value} onChange={onChange} className="admin__input" style={{ marginTop: 6 }}
                    placeholder="https://… o /ruta" maxLength={600} />
            )}
        </>
    )
}

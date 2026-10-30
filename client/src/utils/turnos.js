// Turnos: código de reserva, QR del comprobante y "¿le toca ahora?".
import QRCode from 'qrcode'

const SHOP_TZ = 'Pacific/Galapagos'

// Código de reserva de una cita (igual que en el servidor): el suyo propio o, en citas
// anteriores a los códigos, los últimos 6 caracteres del id
export const bookingCode = (b) => b?.code || String(b?._id || '').slice(-6).toUpperCase()

// El QR lleva un enlace al admin: el dueño puede leerlo con el escáner del panel
// o con la cámara normal del teléfono (abre la cita directamente si ya inició sesión)
export const bookingQrUrl = (code) => `${window.location.origin}/admin?turno=${code}`

export const bookingQrDataUrl = (code, size = 320) =>
    QRCode.toDataURL(bookingQrUrl(code), { width: size, margin: 1, errorCorrectionLevel: 'M' })

// Lo leído por el escáner (enlace del QR o código escrito a mano) → código, o null
export function parseScannedCode(text) {
    const raw = String(text || '').trim()
    try {
        const fromUrl = new URL(raw).searchParams.get('turno')
        if (fromUrl) return parseScannedCode(fromUrl)
    } catch { /* no es un enlace */ }
    const code = raw.toUpperCase()
    return /^[0-9A-Z]{6}$/.test(code) ? code : null
}

const toMinutes = (slot) => Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3))
const fmtMinutes = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// Fecha y minuto actuales en el local
export function shopNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: SHOP_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(p => [p.type, p.value]))
    return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

const fmtDay = (day) => new Date(`${day}T00:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

// ¿Le toca ahora? → { tone: 'ok' | 'early' | 'late' | 'warn', text }
export function arrivalStatus(b) {
    if (b.status === 'cancelled') return { tone: 'warn', text: 'Esta cita está cancelada.' }
    if (b.status === 'completed') return { tone: 'warn', text: 'Esta cita ya fue atendida.' }

    const day = String(b.date).slice(0, 10)
    const start = toMinutes(b.timeSlot)
    const end = start + (b.service?.duration || 60)
    const now = shopNow()

    if (day !== now.day) {
        return day > now.day
            ? { tone: 'warn', text: `Su cita NO es hoy: es el ${fmtDay(day)} a las ${b.timeSlot}.` }
            : { tone: 'warn', text: `Su cita era el ${fmtDay(day)} a las ${b.timeSlot} (ya pasó).` }
    }
    const diff = now.minutes - start
    if (diff < -30) return { tone: 'early', text: `Llegó ${-diff} min antes. Su turno es a las ${b.timeSlot}.` }
    if (diff <= 10) return { tone: 'ok', text: `A tiempo: su turno es a las ${b.timeSlot}.` }
    if (now.minutes < end) return { tone: 'late', text: `Llegó ${diff} min tarde (su turno era a las ${b.timeSlot}).` }
    return { tone: 'warn', text: `Su horario ya terminó (${b.timeSlot} – ${fmtMinutes(end)}).` }
}

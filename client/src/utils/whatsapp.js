import { brand } from '../config/brand'
import { bookingCode } from './turnos'

// Número escrito por el cliente → formato internacional para wa.me (Ecuador por defecto).
// "0961540543", "096 154 0543", "+593 96 154 0543" → "593961540543". Devuelve null si no parece válido.
export function toWhatsappNumber(phone) {
    let d = String(phone || '').replace(/\D/g, '')
    if (d.startsWith('00')) d = d.slice(2)                       // 00593…
    if (d.length === 10 && d.startsWith('0')) d = `593${d.slice(1)}`   // 09XXXXXXXX
    else if (d.length === 9 && d.startsWith('9')) d = `593${d}`        // 9XXXXXXXX
    return d.length >= 11 && d.length <= 15 ? d : null
}

export const whatsappUrl = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`

// Mensaje de "cita confirmada" que el local envía al cliente desde el panel
export function bookingConfirmedMessage(b) {
    const date = new Date(b.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    const end = b.service?.duration
        ? (() => {
            const t = Number(b.timeSlot.slice(0, 2)) * 60 + Number(b.timeSlot.slice(3)) + b.service.duration
            return ` – ${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
        })()
        : ''
    return [
        `Hola ${b.client?.name} 👋`,
        `Tu cita en *${brand.fullName}* está *CONFIRMADA* ✅`,
        '',
        `✂️ Servicio: ${b.service?.name}`,
        `📅 Fecha: ${date}`,
        `🕐 Hora: ${b.timeSlot}${end}`,
        `📍 ${brand.address}`,
        `🔖 Código: ${bookingCode(b)}`,
        '',
        'Si necesitas cambiarla o cancelarla, respóndenos por aquí. ¡Te esperamos!',
    ].join('\n')
}

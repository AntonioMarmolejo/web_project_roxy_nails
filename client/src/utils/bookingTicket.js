// Comprobante de cita en imagen (PNG) para que el cliente lo guarde y lo muestre al llegar.
// Se dibuja en un canvas con los colores y fuentes de la marca: no depende de librerías externas.
import { brand } from '../config/brand'

const W = 1080, H = 1820
const C = {
    bg: '#0B0A08', card: '#16140F', row: '#1F1C16', border: '#3A3326',
    gold: '#C9A24B', goldLight: '#E8CB82', text: '#F5EFE3', muted: '#B8AE9C',
}
const HEADING = 'Cinzel, serif'
const BODY = 'Montserrat, sans-serif'

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

// Recorta el texto con "…" si no cabe en maxWidth
function fit(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text
    let t = text
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
    return t + '…'
}

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
})

// rows: [[etiqueta, valor], ...] · code: código de reserva · qr: imagen (data URL) del QR · note
export async function drawTicket({ rows, code, qr, note }) {
    // Esperar a que las fuentes de la marca estén listas para el canvas
    await Promise.all([
        document.fonts.load(`700 60px ${HEADING}`),
        document.fonts.load(`400 30px ${BODY}`),
        document.fonts.load(`600 30px ${BODY}`),
    ]).catch(() => {})

    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    // Fondo y tarjeta
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)
    roundRect(ctx, 60, 60, W - 120, H - 120, 40)
    ctx.fillStyle = C.card
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = C.gold
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    // Marca
    ctx.fillStyle = C.gold
    ctx.font = `700 64px ${HEADING}`
    ctx.fillText(brand.name.toUpperCase(), W / 2, 200)
    ctx.fillStyle = C.muted
    ctx.font = `400 28px ${BODY}`
    ctx.fillText(brand.fullName.replace(`${brand.name} `, ''), W / 2, 248)

    // Separador
    ctx.strokeStyle = C.border
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(200, 300); ctx.lineTo(W - 200, 300); ctx.stroke()

    // Título
    ctx.fillStyle = C.goldLight
    ctx.font = `700 58px ${HEADING}`
    ctx.fillText('¡Cita agendada!', W / 2, 395)
    ctx.fillStyle = C.muted
    ctx.font = `400 28px ${BODY}`
    ctx.fillText('Comprobante de reserva', W / 2, 445)

    // Filas de datos
    const top = 500, rowH = 92, x = 130, w = W - 260
    roundRect(ctx, x, top, w, rows.length * rowH + 40, 26)
    ctx.fillStyle = C.row
    ctx.fill()
    rows.forEach(([label, value], i) => {
        const y = top + 20 + i * rowH + rowH / 2 + 10
        ctx.textAlign = 'left'
        ctx.fillStyle = C.muted
        ctx.font = `400 30px ${BODY}`
        ctx.fillText(label, x + 40, y)
        const labelWidth = ctx.measureText(label).width
        ctx.textAlign = 'right'
        ctx.fillStyle = C.text
        ctx.font = `600 30px ${BODY}`
        // El valor ocupa lo que deja libre su etiqueta (con 30px de separación)
        ctx.fillText(fit(ctx, String(value ?? ''), w - 80 - labelWidth - 30), x + w - 40, y)
    })

    // QR (para que el local lo escanee al llegar), código y nota
    let y = top + rows.length * rowH + 40 + 50
    ctx.textAlign = 'center'
    if (qr) {
        const size = 300, pad = 18
        roundRect(ctx, W / 2 - size / 2 - pad, y, size + pad * 2, size + pad * 2, 24)
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()
        ctx.drawImage(await loadImage(qr), W / 2 - size / 2, y + pad, size, size)
        y += size + pad * 2 + 60
    }
    if (code) {
        ctx.fillStyle = C.muted
        ctx.font = `400 26px ${BODY}`
        ctx.fillText('Código de reserva', W / 2, y)
        ctx.fillStyle = C.gold
        ctx.font = `700 46px ${HEADING}`
        ctx.fillText(code, W / 2, y + 56)
        y += 120
    }
    if (note) {
        ctx.fillStyle = C.goldLight
        ctx.font = `600 26px ${BODY}`
        ctx.fillText(fit(ctx, note, W - 260), W / 2, y)
    }

    // Pie: dirección y contacto
    ctx.fillStyle = C.muted
    ctx.font = `400 26px ${BODY}`
    ctx.fillText(`📍 ${brand.address}   ·   📞 ${brand.phone}`, W / 2, H - 150)
    ctx.fillText('Presenta este comprobante al llegar', W / 2, H - 108)

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

// Guarda la imagen: en el celular abre el menú de compartir (para "Guardar imagen"),
// en la computadora la descarga directamente.
export async function saveTicket(blob, filename) {
    const file = new File([blob], filename, { type: 'image/png' })
    const touch = window.matchMedia?.('(pointer: coarse)').matches
    if (touch && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'Comprobante de cita' })
            return
        } catch (err) {
            if (err.name === 'AbortError') return   // el cliente cerró el menú
        }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

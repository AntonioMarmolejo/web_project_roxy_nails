import { useCallback, useEffect, useState } from 'react'
import { fetchTodayQueue, fetchBookingByCode, markBookingArrived, callBookingTurn, updateBookingStatus } from '../api/bookings'
import { bookingCode, parseScannedCode, arrivalStatus } from '../utils/turnos'
import { PAYMENT_LABELS, isPrepaid } from '../config/payments'
import QrScanner from './QrScanner'
import '../styles/AdminQueue.css'
import { SkeletonList } from './Skeleton'

const REFRESH_MS = 20000

const endTime = (b) => {
    const t = Number(b.timeSlot.slice(0, 2)) * 60 + Number(b.timeSlot.slice(3)) + (b.service?.duration || 60)
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
const clock = (iso) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
const longDay = (iso) => new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

// Botones según el momento de la cita
function Actions({ b, busy, act }) {
    const off = busy === b._id
    if (b.status === 'pending') {
        return <button disabled={off} onClick={() => act(b, 'confirm')} className="queue__btn queue__btn--ok">Confirmar</button>
    }
    if (b.status !== 'confirmed') return null
    return b.calledAt ? (
        <>
            <button disabled={off} onClick={() => act(b, 'done')} className="queue__btn queue__btn--ok">✔ Atendido</button>
            <button disabled={off} onClick={() => act(b, 'call')} className="queue__btn">📢 Volver a llamar</button>
        </>
    ) : (
        <>
            <button disabled={off} onClick={() => act(b, 'call')} className="queue__btn queue__btn--primary">📢 Llamar</button>
            <button disabled={off} onClick={() => act(b, 'arrive')} className="queue__btn">
                {b.arrivedAt ? 'Deshacer llegada' : '✅ Llegó'}
            </button>
        </>
    )
}

function Row({ b, busy, act }) {
    return (
        <div className={`queue__row${b.calledAt && b.status === 'confirmed' ? ' queue__row--serving' : ''}`}>
            <div className="queue__code">{bookingCode(b)}</div>
            <div className="queue__info">
                <div className="queue__name">{b.client?.name}</div>
                <div className="queue__meta">
                    <span>🕐 {b.timeSlot} – {endTime(b)}</span>
                    <span>✂️ {b.service?.name}</span>
                    {b.status === 'confirmed' && (b.calledAt
                        ? <span className="queue__chip queue__chip--serving">🔔 Atendiendo desde {clock(b.calledAt)}</span>
                        : b.arrivedAt
                            ? <span className="queue__chip queue__chip--here">✅ En el local desde {clock(b.arrivedAt)}</span>
                            : <span className="queue__chip">⏳ No ha llegado</span>)}
                </div>
            </div>
            <div className="queue__actions"><Actions b={b} busy={busy} act={act} /></div>
        </div>
    )
}

// Pestaña "Turnos" del panel: escanear el QR del comprobante y sala de espera de hoy
export default function AdminQueue({ showToast, initialCode }) {
    const [queue, setQueue] = useState({ date: '', bookings: [] })
    const [loading, setLoading] = useState(true)
    const [scanning, setScanning] = useState(false)
    const [codeInput, setCodeInput] = useState('')
    const [found, setFound] = useState(null)
    const [busy, setBusy] = useState(null)

    const load = useCallback(() => fetchTodayQueue()
        .then(({ data }) => setQueue(data))
        .catch(() => {})
        .finally(() => setLoading(false)), [])

    useEffect(() => {
        load()
        const t = setInterval(load, REFRESH_MS)
        return () => clearInterval(t)
    }, [load])

    const lookup = useCallback(async (raw) => {
        const code = parseScannedCode(raw)
        if (!code) return showToast('Ese QR o código no es de una cita (deben ser 6 caracteres).')
        setCodeInput(code)
        try {
            const { data } = await fetchBookingByCode(code)
            setFound(data)
        } catch (err) {
            setFound(null)
            showToast(err.response?.data?.message || 'No se encontró la cita')
        }
    }, [showToast])

    useEffect(() => { if (initialCode) lookup(initialCode) }, [initialCode, lookup])

    const onScan = useCallback((text) => { setScanning(false); lookup(text) }, [lookup])

    const ACTIONS = {
        confirm: [(id) => updateBookingStatus(id, 'confirmed'), 'Cita confirmada ✓'],
        arrive:  [markBookingArrived, 'Llegada actualizada ✓'],
        call:    [callBookingTurn, 'Llamado en la pantalla 📢'],
        done:    [(id) => updateBookingStatus(id, 'completed'), 'Cita atendida ✓'],
    }
    const act = async (b, name) => {
        const [fn, msg] = ACTIONS[name]
        setBusy(b._id)
        try {
            const { data } = await fn(b._id)
            setFound(f => (f && f._id === data._id ? { ...f, ...data } : f))
            await load()
            showToast(msg)
        } catch (err) {
            showToast(err.response?.data?.message || 'No se pudo actualizar la cita')
        } finally {
            setBusy(null)
        }
    }

    const list = queue.bookings || []
    const serving = list.filter(b => b.status === 'confirmed' && b.calledAt).sort((a, b) => new Date(b.calledAt) - new Date(a.calledAt))
    const waiting = list.filter(b => b.status === 'confirmed' && !b.calledAt)
    const pending = list.filter(b => b.status === 'pending')
    const done = list.filter(b => b.status === 'completed')
    const status = found && arrivalStatus(found)

    return (
        <div className="queue">
            {/* Barra: escanear, buscar, pantalla del local */}
            <div className="queue__toolbar">
                <button onClick={() => setScanning(true)} className="queue__scan-btn">📷 Escanear QR</button>
                <form className="queue__search" onSubmit={(e) => { e.preventDefault(); lookup(codeInput) }}>
                    <input value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        placeholder="Código (ej. AEC48D)" maxLength={6} className="admin__input" aria-label="Código de reserva" />
                    <button type="submit" className="queue__btn">Buscar</button>
                </form>
                <a href="/turnos" target="_blank" rel="noopener noreferrer" className="queue__btn">🖥️ Pantalla del local</a>
            </div>

            {/* Cita encontrada por QR o código */}
            {found && (
                <div className={`queue__found queue__found--${status.tone}`}>
                    <div className="queue__found-head">
                        <div>
                            <div className="queue__found-code">{bookingCode(found)}</div>
                            <div className="queue__found-name">{found.client?.name}</div>
                        </div>
                        <button onClick={() => setFound(null)} className="queue__close" aria-label="Cerrar">×</button>
                    </div>
                    <p className="queue__found-status">{status.text}</p>
                    <div className="queue__meta">
                        <span>✂️ {found.service?.name}</span>
                        <span>📅 {longDay(found.date)}</span>
                        <span>🕐 {found.timeSlot} – {endTime(found)}</span>
                        <span>📱 {found.client?.phone}</span>
                        <span>{isPrepaid(found.paymentMethod) ? `💳 Pagó por adelantado · ${PAYMENT_LABELS[found.paymentMethod]}` : '💵 Paga en el local'}</span>
                    </div>
                    <div className="queue__actions"><Actions b={found} busy={busy} act={act} /></div>
                </div>
            )}

            <h2 className="admin__list-title">
                Sala de espera — hoy{queue.date ? `, ${longDay(queue.date)}` : ''}
            </h2>
            {loading ? (
                <SkeletonList count={3} label="Cargando sala de espera" />
            ) : list.length === 0 ? (
                <div className="admin__list-empty">No hay citas para hoy.</div>
            ) : (
                <>
                    {serving.length > 0 && <h3 className="queue__section">🔔 Atendiendo</h3>}
                    {serving.map(b => <Row key={b._id} b={b} busy={busy} act={act} />)}

                    <h3 className="queue__section">⏳ Próximos turnos ({waiting.length})</h3>
                    {waiting.length === 0
                        ? <p className="queue__empty">No hay más turnos confirmados para hoy.</p>
                        : waiting.map(b => <Row key={b._id} b={b} busy={busy} act={act} />)}

                    {pending.length > 0 && <h3 className="queue__section">📝 Sin confirmar ({pending.length})</h3>}
                    {pending.map(b => <Row key={b._id} b={b} busy={busy} act={act} />)}

                    {done.length > 0 && <h3 className="queue__section">✔ Atendidos hoy ({done.length})</h3>}
                    {done.map(b => <Row key={b._id} b={b} busy={busy} act={act} />)}
                </>
            )}

            {scanning && <QrScanner onResult={onScan} onClose={() => setScanning(false)} />}
        </div>
    )
}

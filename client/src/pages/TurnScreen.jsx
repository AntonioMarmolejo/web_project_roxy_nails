import { useCallback, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchPublicQueue } from '../api/bookings'
import { brand } from '../config/brand'
import '../styles/TurnScreen.css'

const REFRESH_MS = 8000
// Hora del local (Galápagos), aunque el TV o la tablet tengan otra zona horaria
const clockText = (d) => d.toLocaleTimeString('es-ES', { timeZone: 'Pacific/Galapagos', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
const MAX_NEXT = 8

// Aviso sonoro al llamar un turno (dos tonos, sin archivos de audio)
function chime(audioCtx) {
    if (!audioCtx) return
    ;[[880, 0], [660, 0.28]].forEach(([freq, at]) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + at)
        gain.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + at + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + at + 0.6)
        osc.connect(gain).connect(audioCtx.destination)
        osc.start(audioCtx.currentTime + at)
        osc.stop(audioCtx.currentTime + at + 0.65)
    })
}

// Pantalla de turnos para un TV o tablet del local (pública, sin datos personales)
export default function TurnScreen() {
    const [queue, setQueue] = useState(null)
    const [offline, setOffline] = useState(false)
    const [now, setNow] = useState(new Date())
    const [flash, setFlash] = useState(false)
    const [soundOn, setSoundOn] = useState(false)
    const audioRef = useRef(null)
    const lastCallRef = useRef(null)

    const load = useCallback(async () => {
        try {
            const { data } = await fetchPublicQueue()
            setOffline(false)
            setQueue(data)
            // ¿Se acaba de llamar un turno nuevo? → sonido y destello
            const latest = data.serving[0] ? `${data.serving[0].code}@${data.serving[0].calledAt}` : null
            if (lastCallRef.current !== null && latest && latest !== lastCallRef.current) {
                chime(audioRef.current)
                setFlash(true)
                setTimeout(() => setFlash(false), 4000)
            }
            lastCallRef.current = latest || ''
        } catch {
            setOffline(true)
        }
    }, [])

    useEffect(() => {
        load()
        const poll = setInterval(load, REFRESH_MS)
        const tick = setInterval(() => setNow(new Date()), 1000)
        return () => { clearInterval(poll); clearInterval(tick) }
    }, [load])

    // Los navegadores solo permiten sonido después de un toque en la pantalla
    const enableSound = () => {
        audioRef.current ||= new (window.AudioContext || window.webkitAudioContext)()
        audioRef.current.resume()
        chime(audioRef.current)
        setSoundOn(true)
        document.documentElement.requestFullscreen?.().catch(() => {})
    }

    const serving = queue?.serving || []
    const next = (queue?.next || []).slice(0, MAX_NEXT)

    return (
        <div className={`turns${flash ? ' turns--flash' : ''}`}>
            <Helmet><title>{`Turnos — ${brand.fullName}`}</title></Helmet>

            <header className="turns__header">
                <div className="turns__brand">{brand.logo.main} <em>{brand.logo.accent}</em></div>
                <div className="turns__clock">{clockText(now)}</div>
            </header>

            <main className="turns__body">
                <section className="turns__serving">
                    <h2 className="turns__label">Atendiendo ahora</h2>
                    {serving.length === 0 ? (
                        <p className="turns__idle">En un momento llamamos al siguiente turno</p>
                    ) : (
                        <div className="turns__serving-list">
                            {serving.map(s => (
                                <div key={s.code} className="turns__serving-item">
                                    <span className="turns__serving-code">{s.code}</span>
                                    <span className="turns__serving-time">Turno de las {s.timeSlot}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="turns__next">
                    <h2 className="turns__label">Próximos turnos</h2>
                    {next.length === 0 ? (
                        <p className="turns__idle turns__idle--small">No hay más turnos por hoy</p>
                    ) : (
                        <ol className="turns__next-list">
                            {next.map(n => (
                                <li key={n.code} className="turns__next-item">
                                    <span className="turns__next-time">{n.timeSlot}</span>
                                    <span className="turns__next-code">{n.code}</span>
                                    {n.arrived && <span className="turns__next-here">En el local</span>}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </main>

            <footer className="turns__footer">
                {offline ? '⚠️ Sin conexión: reintentando…' : 'Muestra el QR de tu comprobante al llegar · Tu código aparece aquí cuando sea tu turno'}
            </footer>

            {!soundOn && (
                <button onClick={enableSound} className="turns__sound-btn">🔔 Toca para activar el sonido y pantalla completa</button>
            )}
        </div>
    )
}

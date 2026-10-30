import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import '../styles/QrScanner.css'

// Lector de QR con la cámara (trasera si existe). Usa el lector del navegador cuando lo hay
// (Chrome en Android) y, si no (iPhone), jsQR. Llama a onResult(texto) al leer un código.
export default function QrScanner({ onResult, onClose }) {
    const videoRef = useRef(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let stream = null
        let frame = null
        let stopped = false
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        const detector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null
        let last = 0

        const scan = async (t) => {
            if (stopped) return
            frame = requestAnimationFrame(scan)
            const video = videoRef.current
            if (!video || video.readyState < 2 || t - last < 200) return   // ~5 lecturas por segundo
            last = t
            try {
                let text = null
                if (detector) {
                    const codes = await detector.detect(video)
                    text = codes[0]?.rawValue || null
                } else {
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    ctx.drawImage(video, 0, 0)
                    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    text = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })?.data || null
                }
                if (text && !stopped) {
                    stopped = true
                    navigator.vibrate?.(80)
                    onResult(text)
                }
            } catch { /* fotograma no legible: se sigue intentando */ }
        }

        ;(async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError('Este navegador no permite usar la cámara. Escribe el código a mano.')
                return
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
                if (stopped) return
                videoRef.current.srcObject = stream
                await videoRef.current.play()
                frame = requestAnimationFrame(scan)
            } catch (err) {
                setError(err.name === 'NotAllowedError'
                    ? 'Necesitamos permiso para usar la cámara. Actívalo en el navegador (icono del candado junto a la dirección) o escribe el código a mano.'
                    : 'No se pudo abrir la cámara. Escribe el código a mano.')
            }
        })()

        return () => {
            stopped = true
            if (frame) cancelAnimationFrame(frame)
            stream?.getTracks().forEach(t => t.stop())
        }
    }, [onResult])

    return (
        <div className="qr-scanner" role="dialog" aria-label="Escanear código QR">
            <div className="qr-scanner__box">
                <div className="qr-scanner__header">
                    <span>📷 Apunta al QR del comprobante</span>
                    <button type="button" onClick={onClose} className="qr-scanner__close" aria-label="Cerrar">×</button>
                </div>
                {error ? (
                    <p className="qr-scanner__error">{error}</p>
                ) : (
                    <div className="qr-scanner__view">
                        <video ref={videoRef} muted playsInline className="qr-scanner__video" />
                        <div className="qr-scanner__frame" aria-hidden="true" />
                    </div>
                )}
            </div>
        </div>
    )
}

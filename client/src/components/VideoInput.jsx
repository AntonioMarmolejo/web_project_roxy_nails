import { useState, useRef } from 'react'
import { uploadToCloudinary } from '../api/upload'
import { VIDEO_LIMITS, readVideoDuration, videoPoster, formatSeconds } from '../utils/media'
import '../styles/ImageInput.css'

const ACCEPT = 'video/mp4,video/quicktime,video/webm'

// Subida de videos cortos a Cloudinary (directa desde el navegador, con progreso)
export default function VideoInput({ label = 'Video', value, onChange }) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setError('')
        try {
            if (!file.type.startsWith('video/')) throw new Error('El archivo debe ser un video (MP4, MOV o WEBM)')
            if (file.size > VIDEO_LIMITS.maxBytes) throw new Error(`El video pesa ${(file.size / 1048576).toFixed(1)} MB; el máximo es 50 MB`)
            const seconds = await readVideoDuration(file).catch(() => null)
            // Algunos WebM no traen la duración (Infinity): en ese caso la valida el servidor
            if (Number.isFinite(seconds) && seconds > VIDEO_LIMITS.maxSeconds + 0.5) {
                throw new Error(`El video dura ${formatSeconds(seconds)}; el máximo es ${VIDEO_LIMITS.maxSeconds} segundos`)
            }
            setUploading(true); setProgress(0)
            const { url } = await uploadToCloudinary(file, { resourceType: 'video', onProgress: setProgress })
            onChange(url)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al subir el video')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="image-input">
            <label className="image-input__label">{label}</label>
            <div className="image-input__file-row">
                <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleFile} disabled={uploading} className="image-input__file-input" />
            </div>
            <p className="image-input__hint">MP4, MOV o WEBM · máximo {VIDEO_LIMITS.maxSeconds} segundos y 50 MB</p>

            {uploading && (
                <div className="image-input__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="image-input__progress-bar" style={{ width: `${progress}%` }} />
                    <span className="image-input__progress-label">{progress < 100 ? `Subiendo... ${progress}%` : 'Procesando...'}</span>
                </div>
            )}

            {error && <p className="image-input__error">{error}</p>}

            {value && !uploading && (
                <div className="image-input__preview">
                    <video src={value} poster={videoPoster(value, 400)} controls playsInline className="image-input__preview-img" />
                    <button type="button" onClick={() => onChange('')} className="image-input__remove-btn">Quitar video</button>
                </div>
            )}
        </div>
    )
}

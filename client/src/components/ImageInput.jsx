import { useState, useRef } from 'react'
import { uploadToCloudinary } from '../api/upload'
import { IMAGE_MAX_BYTES } from '../utils/media'
import '../styles/ImageInput.css'


export default function ImageInput({ label = 'Imagen', value, onChange }) {
    const [mode, setMode]         = useState('url')
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError]       = useState('')
    const fileInputRef = useRef(null)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setError('')

        if (!file.type.startsWith('image/')) {
            setError('El archivo debe ser una imagen')
            return
        }
        if (file.size > IMAGE_MAX_BYTES) {
            setError('La imagen no puede superar 10 MB')
            return
        }

        setUploading(true); setProgress(0)
        try {
            // Subida directa a Cloudinary: no pasa por la API (evita el límite de 4,5 MB de Vercel)
            const { url } = await uploadToCloudinary(file, { resourceType: 'image', onProgress: setProgress })
            onChange(url)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al subir la imagen')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="image-input">
            <label className="image-input__label">{label}</label>

            <div className="image-input__tabs">
                <button type="button" onClick={() => setMode('url')} className={`image-input__tab-btn${mode === 'url' ? ' image-input__tab-btn--active' : ''}`}>
                    Enlace URL
                </button>
                <button type="button" onClick={() => setMode('file')} className={`image-input__tab-btn${mode === 'file' ? ' image-input__tab-btn--active' : ''}`}>
                    Subir archivo
                </button>
            </div>

            {mode === 'url' ? (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="image-input__input"
                    placeholder="https://..."
                />
            ) : (
                <div className="image-input__file-row">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="image-input__file-input" />
                    {uploading && <span className="image-input__uploading">Subiendo... {progress}%</span>}
                </div>
            )}

            {error && <p className="image-input__error">{error}</p>}

            {value && (
                <div className="image-input__preview">
                    <img src={value} alt="Vista previa" className="image-input__preview-img" />
                    <button type="button" onClick={() => onChange('')} className="image-input__remove-btn">Quitar imagen</button>
                </div>
            )}
        </div>
    )
}

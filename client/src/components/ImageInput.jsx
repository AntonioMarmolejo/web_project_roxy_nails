import { useState, useRef } from 'react'
import { uploadImage } from '../api/upload'
import '../styles/ImageInput.css'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImageInput({ label = 'Imagen', value, onChange }) {
    const [mode, setMode]         = useState('url')
    const [uploading, setUploading] = useState(false)
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
        if (file.size > MAX_SIZE) {
            setError('La imagen no puede superar 5MB')
            return
        }

        setUploading(true)
        try {
            const { data } = await uploadImage(file)
            onChange(data.url)
        } catch (err) {
            setError(err.response?.data?.message || 'Error al subir la imagen')
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
                    {uploading && <span className="image-input__uploading">Subiendo...</span>}
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

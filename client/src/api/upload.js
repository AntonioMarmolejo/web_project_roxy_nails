import api from './axios'

// Subida a través de la API (limitada a ~4,5 MB en Vercel). Se mantiene por compatibilidad.
export const uploadImage = (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

// Subida directa del navegador a Cloudinary con firma del servidor (sin límite de Vercel).
// resourceType: 'image' | 'video'. onProgress recibe un número de 0 a 100.
// Devuelve { url, duration, bytes }.
export const uploadToCloudinary = async (file, { resourceType = 'image', onProgress } = {}) => {
    const { data: sig } = await api.get('/upload/signature')
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', sig.apiKey)
    form.append('timestamp', sig.timestamp)
    form.append('folder', sig.folder)
    form.append('signature', sig.signature)

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`)
        xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)) }
        xhr.onload = () => {
            let body = {}
            try { body = JSON.parse(xhr.responseText) } catch { /* respuesta no JSON */ }
            if (xhr.status >= 200 && xhr.status < 300) resolve({ url: body.secure_url, duration: body.duration, bytes: body.bytes })
            else reject(new Error(body.error?.message || 'Error al subir el archivo'))
        }
        xhr.onerror = () => reject(new Error('Error de conexión al subir el archivo'))
        xhr.send(form)
    })
}

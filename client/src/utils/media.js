// Utilidades para fotos y videos de la galería

// Deben coincidir con VIDEO_LIMITS en server/config/cloudinary.js
export const VIDEO_LIMITS = { maxSeconds: 60, maxBytes: 50 * 1024 * 1024 }
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024

export const isVideo = (item) =>
    item?.mediaType === 'video' || /\/video\/upload\//.test(typeof item === 'string' ? item : item?.image || item?.src || '')

// Primer fotograma del video como imagen (Cloudinary lo genera a partir de la URL)
export const videoPoster = (url, width = 800) =>
    url.replace('/video/upload/', `/video/upload/so_0,w_${width},c_limit/`).replace(/\.\w+$/, '.jpg')

// Video optimizado para reproducir en web (calidad automática)
export const videoPlaybackUrl = (url) =>
    url.replace('/video/upload/', '/video/upload/q_auto/')

// Lee la duración de un archivo de video en el navegador (segundos)
export const readVideoDuration = (file) => new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const src = URL.createObjectURL(file)
    video.onloadedmetadata = () => { URL.revokeObjectURL(src); resolve(video.duration) }
    video.onerror = () => { URL.revokeObjectURL(src); reject(new Error('No se pudo leer el video')) }
    video.src = src
})

export const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

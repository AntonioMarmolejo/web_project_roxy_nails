import { isVideo, videoPoster, formatSeconds } from '../utils/media'
import '../styles/GalleryMedia.css'

// Miniatura de un elemento de la galería: foto, o primer fotograma del video con icono ▶
export default function GalleryMedia({ item, alt = '' }) {
    if (!isVideo(item)) return <img src={item.image} alt={alt} loading="lazy" />
    return (
        <>
            <img src={videoPoster(item.image)} alt={alt} loading="lazy" />
            <span className="gallery-media__play" aria-label="Video">▶</span>
            {item.duration ? <span className="gallery-media__duration">{formatSeconds(item.duration)}</span> : null}
        </>
    )
}

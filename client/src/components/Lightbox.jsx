import { useEffect } from 'react'
import '../styles/Lightbox.css'

export default function Lightbox({ images, index, onClose, onSelect }) {
    const goPrev = () => onSelect((index - 1 + images.length) % images.length)
    const goNext = () => onSelect((index + 1) % images.length)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [index])

    return (
        <div className="lightbox">
            <div className="lightbox__backdrop" onClick={onClose} />

            <button className="lightbox__close" onClick={onClose} aria-label="Cerrar">✕</button>

            {images.length > 1 && (
                <span className="lightbox__counter">{index + 1} / {images.length}</span>
            )}

            <div className="lightbox__stage">
                {images.length > 1 && (
                    <button className="lightbox__arrow lightbox__arrow--left" onClick={goPrev} aria-label="Anterior">‹</button>
                )}

                <img src={images[index]} alt="" className="lightbox__image" />

                {images.length > 1 && (
                    <button className="lightbox__arrow lightbox__arrow--right" onClick={goNext} aria-label="Siguiente">›</button>
                )}
            </div>

            {images.length > 1 && (
                <div className="lightbox__thumbs">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            className={`lightbox__thumb${i === index ? ' lightbox__thumb--active' : ''}`}
                            onClick={() => onSelect(i)}
                        >
                            <img src={img} alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

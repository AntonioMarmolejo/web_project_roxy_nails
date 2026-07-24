import { useFavoritesStore } from '../store/useFavoritesStore'
import '../styles/LikeButton.css'

export default function LikeButton({ id, className = '' }) {
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const liked = isFavorite(id)

    return (
        <button
            className={`like-btn${liked ? ' like-btn--active' : ''} ${className}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(id) }}
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={liked}
        >
            <svg viewBox="0 0 24 24" className="like-btn__icon">
                <path d="M12 21s-6.7-4.35-9.33-8.2C.89 10.1 1.2 6.6 3.9 4.8c2.2-1.47 4.9-.98 6.5.98L12 7.4l1.6-1.62c1.6-1.96 4.3-2.45 6.5-.98 2.7 1.8 3.01 5.3 1.23 7.99C18.7 16.65 12 21 12 21z" />
            </svg>
        </button>
    )
}

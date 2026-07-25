import { useEffect, useState } from 'react'
import { useFavoritesStore } from '../store/useFavoritesStore'
import '../styles/LikeButton.css'

function formatCount(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' M'
    if (n >= 1000) return Math.round(n / 1000) + ' mil'
    return String(n)
}

export default function LikeButton({ id, count = 0, showCount = false, onLike, className = '' }) {
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const liked = isFavorite(id)
    const [localCount, setLocalCount] = useState(count)

    useEffect(() => setLocalCount(count), [count])

    const handleClick = (e) => {
        e.stopPropagation()
        const nowLiked = !liked
        toggleFavorite(id)
        setLocalCount(c => Math.max(0, c + (nowLiked ? 1 : -1)))
        onLike?.(nowLiked)
    }

    return (
        <button
            className={`like-btn${liked ? ' like-btn--active' : ''}${showCount ? ' like-btn--with-count' : ''} ${className}`}
            onClick={handleClick}
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={liked}
        >
            <svg viewBox="0 0 24 24" className="like-btn__icon">
                <path d="M12 21s-6.7-4.35-9.33-8.2C.89 10.1 1.2 6.6 3.9 4.8c2.2-1.47 4.9-.98 6.5.98L12 7.4l1.6-1.62c1.6-1.96 4.3-2.45 6.5-.98 2.7 1.8 3.01 5.3 1.23 7.99C18.7 16.65 12 21 12 21z" />
            </svg>
            {showCount && (
                <span className="like-btn__count">{formatCount(localCount)}</span>
            )}
        </button>
    )
}

import '../styles/Skeleton.css'

// Siluetas grises animadas que ocupan el lugar del contenido mientras carga.

// Bloque básico: ancho, alto y redondeo opcionales (o por clase)
export function Skeleton({ width, height, radius, className = '', style }) {
    return (
        <span
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius: radius, ...style }}
            aria-hidden="true"
        />
    )
}

// Tarjeta de catálogo (servicio, producto, taller): imagen cuadrada + nombre
export function SkeletonCard() {
    return (
        <div className="skeleton-card" aria-hidden="true">
            <Skeleton className="skeleton-card__image" />
            <Skeleton className="skeleton-card__title" />
            <Skeleton className="skeleton-card__line" />
        </div>
    )
}

// Rejilla de tarjetas o de fotos, usando la misma clase de rejilla que el contenido real
export function SkeletonGrid({ count = 8, className = 'catalog-grid', item = 'card', label = 'Cargando…' }) {
    return (
        <div className={className} role="status" aria-label={label}>
            {Array.from({ length: count }, (_, i) => item === 'tile'
                ? <Skeleton key={i} className="skeleton-tile" />
                : <SkeletonCard key={i} />)}
        </div>
    )
}

// Lista de registros (mis citas, pedidos, talleres y listas del panel)
export function SkeletonList({ count = 3, label = 'Cargando…' }) {
    return (
        <div className="skeleton-list" role="status" aria-label={label}>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="skeleton-row" aria-hidden="true">
                    <div className="skeleton-row__main">
                        <Skeleton className="skeleton-row__title" />
                        <Skeleton className="skeleton-row__line" />
                        <Skeleton className="skeleton-row__line skeleton-row__line--short" />
                    </div>
                    <Skeleton className="skeleton-row__action" />
                </div>
            ))}
        </div>
    )
}

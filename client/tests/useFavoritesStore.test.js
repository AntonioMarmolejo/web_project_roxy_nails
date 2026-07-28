import { describe, it, expect, beforeEach } from 'vitest'
import { useFavoritesStore } from '../src/store/useFavoritesStore'

describe('useFavoritesStore', () => {
    beforeEach(() => {
        useFavoritesStore.setState({ ids: [] })
    })

    it('agrega y quita un id al alternar favorito', () => {
        expect(useFavoritesStore.getState().isFavorite('a')).toBe(false)

        useFavoritesStore.getState().toggleFavorite('a')
        expect(useFavoritesStore.getState().isFavorite('a')).toBe(true)

        useFavoritesStore.getState().toggleFavorite('a')
        expect(useFavoritesStore.getState().isFavorite('a')).toBe(false)
    })

    it('mantiene ids distintos de forma independiente', () => {
        useFavoritesStore.getState().toggleFavorite('a')
        expect(useFavoritesStore.getState().isFavorite('a')).toBe(true)
        expect(useFavoritesStore.getState().isFavorite('b')).toBe(false)
    })
})

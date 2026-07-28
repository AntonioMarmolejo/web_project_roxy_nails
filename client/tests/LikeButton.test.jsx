import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LikeButton from '../src/components/LikeButton'

describe('LikeButton', () => {
    it('formatea el contador en miles cuando se pide mostrarlo', () => {
        render(<LikeButton id="format-test" count={2300} showCount />)
        expect(screen.getByText('2 mil')).toBeInTheDocument()
    })

    it('alterna el estado de "me gusta", actualiza el contador y avisa al padre', () => {
        const onLike = vi.fn()
        render(<LikeButton id="toggle-test" count={5} showCount onLike={onLike} />)
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-pressed', 'false')

        fireEvent.click(button)
        expect(button).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText('6')).toBeInTheDocument()
        expect(onLike).toHaveBeenCalledWith(true)

        fireEvent.click(button)
        expect(button).toHaveAttribute('aria-pressed', 'false')
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(onLike).toHaveBeenCalledWith(false)
    })

    it('vuelve al conteo original tras dar y quitar el like', () => {
        render(<LikeButton id="roundtrip-test" count={0} showCount />)
        const button = screen.getByRole('button')

        fireEvent.click(button)
        expect(screen.getByText('1')).toBeInTheDocument()

        fireEvent.click(button)
        expect(screen.getByText('0')).toBeInTheDocument()
    })
})

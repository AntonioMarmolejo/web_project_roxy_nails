import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import PageHeader from '../src/components/PageHeader'

describe('PageHeader', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('muestra el label, título y subtítulo', () => {
        render(<PageHeader label="Mi historial" title="Mis citas" subtitle="Aquí aparecen tus reservas." />)
        expect(screen.getByText('Mi historial')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Mis citas' })).toBeInTheDocument()
        expect(screen.getByText('Aquí aparecen tus reservas.')).toBeInTheDocument()
    })

    it('se colapsa automáticamente después del tiempo configurado', () => {
        const { container } = render(<PageHeader label="L" title="T" visibleMs={1000} />)
        const header = container.querySelector('.page-header')
        expect(header.className).not.toContain('page-header--collapsed')

        act(() => { vi.advanceTimersByTime(1000) })
        expect(header.className).toContain('page-header--collapsed')
    })
})

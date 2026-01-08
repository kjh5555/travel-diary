import { render, screen } from '@testing-library/react'
import Home from './page'
import { describe, it, expect } from 'vitest'

describe('Home', () => {
    it('renders the main heading', () => {
        render(<Home />)
        const heading = screen.getByText(/My Travel Diary/i)
        expect(heading).toBeDefined()
    })

    it('renders the subtitle', () => {
        render(<Home />)
        const subtitle = screen.getByText(/A journey of a thousand miles begins with a single step/i)
        expect(subtitle).toBeDefined()
    })

    it('renders New Journey card', () => {
        render(<Home />)
        expect(screen.getByText('New Journey')).toBeDefined()
        expect(screen.getByText(/Draft a new adventure plan/i)).toBeDefined()
    })

    it('renders Memories card', () => {
        render(<Home />)
        expect(screen.getByText('Memories')).toBeDefined()
        expect(screen.getByText(/Revisit your favorite spots/i)).toBeDefined()
    })
})

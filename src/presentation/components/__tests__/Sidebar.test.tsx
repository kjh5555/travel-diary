import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

describe('Sidebar', () => {
    it('should render all navigation items', () => {
        render(<Sidebar />)

        expect(screen.getByText('Dashboard')).toBeDefined()
        expect(screen.getByText('Itinerary')).toBeDefined()
        expect(screen.getByText('Saved Places')).toBeDefined()
        expect(screen.getByText('Map')).toBeDefined()
    })

    it('should have correct links for each nav item', () => {
        render(<Sidebar />)

        const dashboardLink = screen.getByText('Dashboard').closest('a')
        const itineraryLink = screen.getByText('Itinerary').closest('a')
        const savedPlacesLink = screen.getByText('Saved Places').closest('a')
        const mapLink = screen.getByText('Map').closest('a')

        expect(dashboardLink?.getAttribute('href')).toBe('/')
        expect(itineraryLink?.getAttribute('href')).toBe('/planner')
        expect(savedPlacesLink?.getAttribute('href')).toBe('/saved')
        expect(mapLink?.getAttribute('href')).toBe('/map')
    })

    it('should be hidden on mobile and visible on large screens', () => {
        const { container } = render(<Sidebar />)
        const aside = container.querySelector('aside')

        expect(aside?.className).toContain('hidden')
        expect(aside?.className).toContain('lg:block')
    })

    it('should have sticky positioning', () => {
        const { container } = render(<Sidebar />)
        const aside = container.querySelector('aside')

        expect(aside?.className).toContain('sticky')
        expect(aside?.className).toContain('top-16')
    })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

vi.mock('next-auth/react', () => ({
    useSession: () => ({ data: null }),
    signOut: vi.fn(),
}))

describe('Sidebar', () => {
    it('should render all navigation items', () => {
        render(<Sidebar />)

        expect(screen.getByText('홈')).toBeDefined()
        expect(screen.getByText('여정')).toBeDefined()
        expect(screen.getByText('테마 여행')).toBeDefined()
        expect(screen.getByText('나만의 테마')).toBeDefined()
        expect(screen.getByText('저장된 장소 지도')).toBeDefined()
    })

    it('should have correct links for each nav item', () => {
        render(<Sidebar />)

        const homeLink = screen.getByText('홈').closest('a')
        const journeysLink = screen.getByText('여정').closest('a')
        const themesLink = screen.getByText('테마 여행').closest('a')
        const myThemesLink = screen.getByText('나만의 테마').closest('a')
        const placesLink = screen.getByText('저장된 장소 지도').closest('a')

        expect(homeLink?.getAttribute('href')).toBe('/')
        expect(journeysLink?.getAttribute('href')).toBe('/journeys')
        expect(themesLink?.getAttribute('href')).toBe('/themes')
        expect(myThemesLink?.getAttribute('href')).toBe('/my-themes')
        expect(placesLink?.getAttribute('href')).toBe('/places')
    })

    it('should be hidden on mobile and visible on large screens', () => {
        const { container } = render(<Sidebar />)
        const aside = container.querySelector('aside')

        expect(aside?.className).toContain('hidden')
        expect(aside?.className).toContain('lg:flex')
    })

    it('should show default user name when not authenticated', () => {
        render(<Sidebar />)

        expect(screen.getByText('여행자')).toBeDefined()
    })
})

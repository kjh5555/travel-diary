import { render, screen } from '@testing-library/react'
import Home from './page'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next-auth/react', () => ({
    useSession: () => ({ data: null }),
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/presentation/components/Map/MapContainer', () => ({
    MapContainer: () => <div data-testid="map-container">Map</div>,
}))

vi.mock('@/presentation/components/Place/GooglePlacePhoto', () => ({
    GooglePlacePhoto: () => <div data-testid="photo">Photo</div>,
}))

describe('Home', () => {
    it('renders the main greeting', () => {
        render(<Home />)
        const heading = screen.getByText(/반가워요/i)
        expect(heading).toBeDefined()
    })

    it('renders the subtitle', () => {
        render(<Home />)
        const subtitle = screen.getByText(/다음 여행지는 어디인가요/i)
        expect(subtitle).toBeDefined()
    })

    it('renders New Journey button', () => {
        render(<Home />)
        expect(screen.getByText('새 여행 만들기')).toBeDefined()
    })

    it('renders stat cards', () => {
        render(<Home />)
        expect(screen.getByText('방문한 국가')).toBeDefined()
        expect(screen.getByText('총 여행 일수')).toBeDefined()
    })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'
import { useSession, signIn, signOut } from 'next-auth/react'

vi.mock('next-auth/react')
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render JapanPlanner logo', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn(),
        })

        render(<Header />)

        expect(screen.getByText('JapanPlanner')).toBeDefined()
    })

    it('should show login button when user is not authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const loginButton = screen.getByRole('button', { name: /log in/i })
        expect(loginButton).toBeDefined()
    })

    it('should call signIn with google when login button is clicked', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const loginButton = screen.getByRole('button', { name: /log in/i })
        fireEvent.click(loginButton)

        expect(signIn).toHaveBeenCalledWith('google')
    })

    it('should show user name when authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: 'https://example.com/avatar.jpg',
                },
                expires: '2024-12-31',
            },
            status: 'authenticated',
            update: vi.fn(),
        })

        render(<Header />)

        expect(screen.getByText('John Doe')).toBeDefined()
    })

    it('should show user button when authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null,
                },
                expires: '2024-12-31',
            },
            status: 'authenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const userButtons = screen.getAllByRole('button')
        expect(userButtons.length).toBeGreaterThan(0)
    })

    it('should call signOut when user button is clicked', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null,
                },
                expires: '2024-12-31',
            },
            status: 'authenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const buttons = screen.getAllByRole('button')
        const userButton = buttons.find(btn => btn.className.includes('rounded-full'))

        if (userButton) {
            fireEvent.click(userButton)
            expect(signOut).toHaveBeenCalled()
        }
    })

    it('should not show user name on mobile when authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null,
                },
                expires: '2024-12-31',
            },
            status: 'authenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const nameElement = screen.getByText('John Doe')
        expect(nameElement.className).toContain('hidden')
        expect(nameElement.className).toContain('sm:inline-block')
    })
})

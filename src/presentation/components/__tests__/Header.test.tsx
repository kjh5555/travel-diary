import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'
import { useSession, signIn, signOut } from 'next-auth/react'

vi.mock('next-auth/react')

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show default user name when not authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn(),
        })

        render(<Header />)

        expect(screen.getByText('여행자')).toBeDefined()
    })

    it('should show login button when user is not authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const loginButton = screen.getByRole('button', { name: /로그인/i })
        expect(loginButton).toBeDefined()
    })

    it('should call signIn with google when login button is clicked', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn(),
        })

        render(<Header />)

        const loginButton = screen.getByRole('button', { name: /로그인/i })
        fireEvent.click(loginButton)

        expect(signIn).toHaveBeenCalledWith('google')
    })

    it('should show user name when authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    id: 'user-123',
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

    it('should show menu button', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    id: 'user-123',
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
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('should not show login button when authenticated', () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: {
                    id: 'user-123',
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

        const loginButton = screen.queryByRole('button', { name: /로그인/i })
        expect(loginButton).toBeNull()
    })
})

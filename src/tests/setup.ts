import { beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

beforeAll(() => {
    // Mock Next.js router
    vi.mock('next/navigation', () => ({
        useRouter: () => ({
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
        }),
        useSearchParams: () => ({
            get: vi.fn(),
        }),
        usePathname: () => '/',
    }))

    // Mock next-auth/react
    vi.mock('next-auth/react', () => ({
        signIn: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        useSession: vi.fn(() => ({
            data: null,
            status: 'unauthenticated',
        })),
        SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    }))
})

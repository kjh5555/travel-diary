import { authOptions } from '@/auth'
import { describe, it, expect } from 'vitest'

describe('Auth Configuration', () => {
    it('should have Google Provider configured', () => {
        const providers = authOptions.providers
        const googleProvider = providers.find((p: any) => p.id === 'google')
        expect(googleProvider).toBeDefined()
        expect(googleProvider?.name).toBe('Google')
    })
})

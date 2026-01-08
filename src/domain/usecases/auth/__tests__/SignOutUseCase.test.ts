import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SignOutUseCase } from '../SignOutUseCase'
import { IAuthRepository } from '@/domain/repositories/IAuthRepository'

describe('SignOutUseCase', () => {
    let mockAuthRepository: IAuthRepository
    let signOutUseCase: SignOutUseCase

    beforeEach(() => {
        mockAuthRepository = {
            signIn: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn(),
        }
        signOutUseCase = new SignOutUseCase(mockAuthRepository)
    })

    it('should call repository signOut', async () => {
        await signOutUseCase.execute()

        expect(mockAuthRepository.signOut).toHaveBeenCalledTimes(1)
    })

    it('should propagate repository errors', async () => {
        const error = new Error('Sign out failed')
        vi.mocked(mockAuthRepository.signOut).mockRejectedValue(error)

        await expect(signOutUseCase.execute()).rejects.toThrow('Sign out failed')
    })
})

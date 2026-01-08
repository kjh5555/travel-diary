import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SignInUseCase } from '../SignInUseCase'
import { IAuthRepository } from '@/domain/repositories/IAuthRepository'

describe('SignInUseCase', () => {
    let mockAuthRepository: IAuthRepository
    let signInUseCase: SignInUseCase

    beforeEach(() => {
        mockAuthRepository = {
            signIn: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn(),
        }
        signInUseCase = new SignInUseCase(mockAuthRepository)
    })

    it('should call repository signIn with provider', async () => {
        await signInUseCase.execute('google')

        expect(mockAuthRepository.signIn).toHaveBeenCalledWith('google')
        expect(mockAuthRepository.signIn).toHaveBeenCalledTimes(1)
    })

    it('should throw error when provider is empty', async () => {
        await expect(signInUseCase.execute('')).rejects.toThrow('Provider is required')
    })

    it('should throw error when provider is whitespace', async () => {
        await expect(signInUseCase.execute('   ')).rejects.toThrow('Provider is required')
    })

    it('should accept different provider names', async () => {
        await signInUseCase.execute('github')

        expect(mockAuthRepository.signIn).toHaveBeenCalledWith('github')
    })

    it('should propagate repository errors', async () => {
        const error = new Error('Network error')
        vi.mocked(mockAuthRepository.signIn).mockRejectedValue(error)

        await expect(signInUseCase.execute('google')).rejects.toThrow('Network error')
    })
})

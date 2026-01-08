import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetSessionUseCase } from '../GetSessionUseCase'
import { IAuthRepository } from '@/domain/repositories/IAuthRepository'
import { AuthSession } from '@/domain/entities/User'

describe('GetSessionUseCase', () => {
    let mockAuthRepository: IAuthRepository
    let getSessionUseCase: GetSessionUseCase

    beforeEach(() => {
        mockAuthRepository = {
            signIn: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn(),
        }
        getSessionUseCase = new GetSessionUseCase(mockAuthRepository)
    })

    it('should return session when user is authenticated', async () => {
        const mockSession: AuthSession = {
            user: {
                id: '123',
                name: 'Test User',
                email: 'test@example.com',
                image: 'https://example.com/avatar.jpg',
            },
            expires: '2024-12-31',
        }

        vi.mocked(mockAuthRepository.getSession).mockResolvedValue(mockSession)

        const result = await getSessionUseCase.execute()

        expect(result).toEqual(mockSession)
        expect(mockAuthRepository.getSession).toHaveBeenCalledTimes(1)
    })

    it('should return null when user is not authenticated', async () => {
        vi.mocked(mockAuthRepository.getSession).mockResolvedValue(null)

        const result = await getSessionUseCase.execute()

        expect(result).toBeNull()
    })

    it('should propagate repository errors', async () => {
        const error = new Error('Session retrieval failed')
        vi.mocked(mockAuthRepository.getSession).mockRejectedValue(error)

        await expect(getSessionUseCase.execute()).rejects.toThrow('Session retrieval failed')
    })
})

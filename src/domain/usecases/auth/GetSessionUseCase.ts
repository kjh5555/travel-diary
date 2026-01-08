import { IAuthRepository } from '../../repositories/IAuthRepository'
import { AuthSession } from '../../entities/User'

export class GetSessionUseCase {
    constructor(private authRepository: IAuthRepository) {}

    async execute(): Promise<AuthSession | null> {
        return await this.authRepository.getSession()
    }
}

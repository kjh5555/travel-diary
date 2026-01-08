import { IAuthRepository } from '../../repositories/IAuthRepository'

export class SignInUseCase {
    constructor(private authRepository: IAuthRepository) {}

    async execute(provider: string): Promise<void> {
        if (!provider || provider.trim() === '') {
            throw new Error('Provider is required')
        }

        await this.authRepository.signIn(provider)
    }
}

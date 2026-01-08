import { IAuthRepository } from '../../repositories/IAuthRepository'

export class SignOutUseCase {
    constructor(private authRepository: IAuthRepository) {}

    async execute(): Promise<void> {
        await this.authRepository.signOut()
    }
}

import { AuthSession } from '../entities/User'

export interface IAuthRepository {
    signIn(provider: string): Promise<void>
    signOut(): Promise<void>
    getSession(): Promise<AuthSession | null>
}

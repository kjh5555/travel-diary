import { signIn, signOut, getSession } from 'next-auth/react'
import { IAuthRepository } from '@/domain/repositories/IAuthRepository'
import { AuthSession } from '@/domain/entities/User'

export class NextAuthRepository implements IAuthRepository {
    async signIn(provider: string): Promise<void> {
        await signIn(provider)
    }

    async signOut(): Promise<void> {
        await signOut()
    }

    async getSession(): Promise<AuthSession | null> {
        const session = await getSession()

        if (!session || !session.user) {
            return null
        }

        return {
            user: {
                id: session.user.email || '',
                name: session.user.name || null,
                email: session.user.email || null,
                image: session.user.image || null,
            },
            expires: session.expires,
        }
    }
}

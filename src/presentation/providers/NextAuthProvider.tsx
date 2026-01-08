"use client"

import { SessionProvider } from "next-auth/react"

export const NextAuthProvider = ({ children }: { children: React.ReactNode }) => {
    // @ts-expect-error SessionProvider type mismatch with React 19
    return <SessionProvider>{children}</SessionProvider>
}

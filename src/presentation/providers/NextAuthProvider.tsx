"use client"

import { SessionProvider } from "next-auth/react"
import React from "react"

const Provider = SessionProvider as React.FC<{ children: React.ReactNode }>

export const NextAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <Provider>{children}</Provider>
}

"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export const Header = () => {
    const { data: session } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="lg:hidden flex items-center justify-between p-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
                <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 bg-gray-200"
                    style={{ 
                        backgroundImage: session?.user?.image 
                            ? `url("${session.user.image}")` 
                            : undefined 
                    }}
                />
                <span className="font-bold text-lg">
                    {session?.user?.name || "여행자"}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                {!session && (
                    <button
                        onClick={() => signIn("google")}
                        className="px-3 py-1.5 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                    >
                        로그인
                    </button>
                )}
                <button 
                    className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] p-4 z-50 shadow-lg">
                    <nav className="flex flex-col gap-2">
                        <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors">
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-sm font-medium">홈</span>
                        </a>
                        <a href="/journeys" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors">
                            <span className="material-symbols-outlined">calendar_month</span>
                            <span className="text-sm font-medium">여정</span>
                        </a>
                        <a href="/themes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors">
                            <span className="material-symbols-outlined">explore</span>
                            <span className="text-sm font-medium">테마 여행</span>
                        </a>
                        <a href="/places" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors">
                            <span className="material-symbols-outlined">map</span>
                            <span className="text-sm font-medium">저장된 장소 지도</span>
                        </a>
                        {session && (
                            <button 
                                onClick={() => signOut()}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-2"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                <span className="text-sm font-medium">로그아웃</span>
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}

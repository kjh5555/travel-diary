"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

interface NavItem {
    label: string;
    icon: string;
    iconFilled: string;
    href: string;
}

const navItems: NavItem[] = [
    { label: "홈", icon: "home", iconFilled: "home", href: "/" },
    { label: "여정", icon: "calendar_month", iconFilled: "calendar_month", href: "/journeys" },
    { label: "테마 여행", icon: "explore", iconFilled: "explore", href: "/themes" },
    { label: "나만의 테마", icon: "collections_bookmark", iconFilled: "collections_bookmark", href: "/my-themes" },
    { label: "저장된 장소 지도", icon: "map", iconFilled: "map", href: "/places" },
]

export const Sidebar = () => {
    const pathname = usePathname()
    const { data: session } = useSession()

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    return (
        <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <div 
                        className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border-2 border-[var(--primary)]/20 bg-gray-200"
                        style={{ 
                            backgroundImage: session?.user?.image 
                                ? `url("${session.user.image}")` 
                                : undefined 
                        }}
                    />
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight">
                            {session?.user?.name || "여행자"}
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-xs font-medium cursor-pointer hover:text-[var(--primary)] transition-colors">
                            프로필 보기
                        </p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    active 
                                        ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] group"
                                }`}
                            >
                                <span className={`material-symbols-outlined ${active ? "filled" : ""} ${!active ? "group-hover:text-[var(--foreground)]" : ""}`}>
                                    {active ? item.iconFilled : item.icon}
                                </span>
                                <span className={`text-sm ${active ? "font-semibold" : "font-medium"} ${!active ? "group-hover:text-[var(--foreground)]" : ""}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 border border-[var(--primary)]/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[var(--primary)] text-xl">tips_and_updates</span>
                        <span className="text-xs font-bold text-[var(--primary)]">여행 팁</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-keep">
                        보조 배터리를 꼭 챙기세요. 멋진 석양을 담을 기회를 놓치면 안 되니까요!
                    </p>
                </div>

                {session ? (
                    <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">로그아웃</span>
                    </button>
                ) : (
                    <button 
                        onClick={() => signIn("google")}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
                    >
                        <span className="material-symbols-outlined">login</span>
                        <span className="text-sm font-medium">로그인</span>
                    </button>
                )}
            </div>
        </aside>
    )
}

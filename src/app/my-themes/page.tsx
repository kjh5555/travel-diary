"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CustomTheme } from "@/domain/types/customTheme";
import { CustomThemeCard } from "@/presentation/components/CustomTheme/CustomThemeCard";
import { CreateCustomThemeModal } from "@/presentation/components/CustomTheme/CreateCustomThemeModal";
import { CustomThemeDetailModal } from "@/presentation/components/CustomTheme/CustomThemeDetailModal";
import { AddPlacesToThemeModal } from "@/presentation/components/CustomTheme/AddPlacesToThemeModal";

export default function MyThemesPage() {
    const { data: session } = useSession();
    const [themes, setThemes] = useState<CustomTheme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<CustomTheme | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddPlacesModalOpen, setIsAddPlacesModalOpen] = useState(false);

    const loadThemes = async () => {
        if (!session?.user?.id) {
            setThemes([]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/custom-themes');
            if (!response.ok) {
                setThemes([]);
                return;
            }
            const result: CustomTheme[] = await response.json();
            setThemes(result.reverse());
        } catch (error) {
            console.error("Failed to load themes:", error);
            setThemes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadThemes();
    }, [session]);

    const handleThemeClick = (theme: CustomTheme) => {
        setSelectedTheme(theme);
        setIsDetailModalOpen(true);
    };

    const handleDeleteTheme = async (themeId: string) => {
        if (!confirm("이 테마를 삭제하시겠습니까?")) return;
        if (!session?.user?.id) return;
        
        try {
            const response = await fetch(`/api/custom-themes/${themeId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                loadThemes();
            }
        } catch (error) {
            console.error("Failed to delete theme:", error);
        }
    };

    const handleAddPlaces = () => {
        setIsDetailModalOpen(false);
        setIsAddPlacesModalOpen(true);
    };

    const handleAddPlacesComplete = async () => {
        setIsAddPlacesModalOpen(false);
        await loadThemes();
        
        if (selectedTheme && session?.user?.id) {
            try {
                const response = await fetch(`/api/custom-themes/${selectedTheme.id}`);
                if (response.ok) {
                    const updated: CustomTheme = await response.json();
                    setSelectedTheme(updated);
                    setIsDetailModalOpen(true);
                }
            } catch (error) {
                console.error("Failed to refresh theme:", error);
            }
        }
    };

    return (
        <>
            <CreateCustomThemeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={loadThemes}
            />

            {selectedTheme && (
                <>
                    <CustomThemeDetailModal
                        theme={selectedTheme}
                        isOpen={isDetailModalOpen}
                        onClose={() => {
                            setIsDetailModalOpen(false);
                            setSelectedTheme(null);
                        }}
                        onUpdate={loadThemes}
                        onAddPlaces={handleAddPlaces}
                    />

                    <AddPlacesToThemeModal
                        theme={selectedTheme}
                        isOpen={isAddPlacesModalOpen}
                        onClose={() => setIsAddPlacesModalOpen(false)}
                        onComplete={handleAddPlacesComplete}
                    />
                </>
            )}

            <section className="p-6">
                <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            나만의 테마 ✨
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-lg">
                            나만의 장소 컬렉션을 만들고 관리하세요
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        새 테마 만들기
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/3] bg-[var(--secondary)] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : themes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/30 mb-4">
                            collections_bookmark
                        </span>
                        <h2 className="text-xl font-bold mb-2">아직 테마가 없어요</h2>
                        <p className="text-[var(--muted-foreground)] mb-6 max-w-md">
                            &quot;오사카 음식 맛집&quot;, &quot;도쿄 카페 투어&quot; 같은<br />
                            나만의 장소 컬렉션을 만들어보세요!
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                        >
                            첫 번째 테마 만들기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {themes.map(theme => (
                            <div key={theme.id} className="relative group">
                                <CustomThemeCard
                                    theme={theme}
                                    onClick={() => handleThemeClick(theme)}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTheme(theme.id);
                                    }}
                                    className="absolute top-3 right-14 p-2 rounded-full bg-white/90 backdrop-blur-sm text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

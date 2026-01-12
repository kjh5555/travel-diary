"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
    ThemeSpot, 
    ThemeCategoryId,
    THEME_CATEGORIES,
    SUB_CATEGORY_LABELS
} from "@/domain/types/themeSpot";
import { LocalStorageThemeSpotRepository } from "@/data/repositories/LocalStorageThemeSpotRepository";
import { GetThemeSpotByIdUseCase } from "@/domain/usecases/themeSpot/GetThemeSpotByIdUseCase";
import { ToggleThemeSpotLikeUseCase } from "@/domain/usecases/themeSpot/ToggleThemeSpotLikeUseCase";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";

export default function ThemeSpotDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.id || "anonymous";
    const themeId = params.themeId as ThemeCategoryId;
    const spotId = params.spotId as string;
    
    const [spot, setSpot] = useState<ThemeSpot | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const themeCategory = THEME_CATEGORIES.find(c => c.id === themeId);

    const repository = new LocalStorageThemeSpotRepository();
    const getByIdUseCase = new GetThemeSpotByIdUseCase(repository);
    const toggleLikeUseCase = new ToggleThemeSpotLikeUseCase(repository);

    useEffect(() => {
        const loadSpot = async () => {
            if (!spotId) return;
            
            setIsLoading(true);
            try {
                const result = await getByIdUseCase.execute(spotId);
                setSpot(result);
            } catch (error) {
                console.error("Failed to load spot:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSpot();
    }, [spotId]);

    const handleToggleLike = async () => {
        if (!spot) return;
        const updated = await toggleLikeUseCase.execute(spot.id, userId);
        if (updated) {
            setSpot(updated);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 w-32 bg-[var(--surface)] rounded mb-6" />
                    <div className="aspect-video bg-[var(--surface)] rounded-2xl mb-6" />
                    <div className="h-10 w-2/3 bg-[var(--surface)] rounded mb-4" />
                    <div className="h-6 w-1/3 bg-[var(--surface)] rounded mb-8" />
                    <div className="h-32 bg-[var(--surface)] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!spot) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4">
                    error_outline
                </span>
                <h2 className="text-2xl font-bold mb-2">장소를 찾을 수 없어요</h2>
                <p className="text-[var(--muted-foreground)] mb-6">요청하신 장소가 존재하지 않습니다.</p>
                <Link 
                    href={`/themes/${themeId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span>뒤로가기</span>
            </button>

            <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
                <div className="aspect-video relative overflow-hidden">
                    <GooglePlacePhoto
                        query={`${spot.title} ${spot.location}`}
                        location={{ lat: spot.lat, lng: spot.lng }}
                        className="absolute inset-0 w-full h-full"
                        maxWidth={800}
                        maxHeight={450}
                        fallback={
                            <div className={`absolute inset-0 bg-gradient-to-br ${themeCategory?.gradient || 'from-slate-600 to-slate-800'} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white/30 text-8xl">
                                    {themeCategory?.icon || 'place'}
                                </span>
                            </div>
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {spot.location}
                    </div>

                    <button
                        onClick={handleToggleLike}
                        className={`absolute top-4 right-4 p-3 rounded-full transition-all ${
                            spot.isLiked 
                                ? "bg-red-500 text-white" 
                                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/40"
                        }`}
                    >
                        <span className={`material-symbols-outlined text-xl ${spot.isLiked ? "filled" : ""}`}>
                            favorite
                        </span>
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold px-3 py-1 rounded-full">
                            {SUB_CATEGORY_LABELS[spot.subCategory] || spot.subCategory}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-500 filled">star</span>
                            <span className="font-bold">{spot.rating}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">{spot.title}</h1>
                    <h2 className="text-xl text-[var(--muted-foreground)] mb-6">{spot.subtitle}</h2>

                    {spot.description && (
                        <p className="text-[var(--foreground)] leading-relaxed mb-8">
                            {spot.description}
                        </p>
                    )}

                    <div className="bg-[var(--background)] rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[var(--primary)]">tips_and_updates</span>
                            <h3 className="font-bold">방문 팁</h3>
                        </div>
                        <p className="text-[var(--muted-foreground)]">{spot.tip}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-[var(--background)] rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[var(--primary)]">map</span>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--muted-foreground)]">좌표</p>
                                <p className="font-medium">{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</p>
                            </div>
                        </div>
                        <div className="bg-[var(--background)] rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[var(--primary)]">category</span>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--muted-foreground)]">테마</p>
                                <p className="font-medium">{themeCategory?.name || '테마 여행'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-colors shadow-lg shadow-[var(--primary)]/20">
                            <span className="material-symbols-outlined">add</span>
                            내 여행에 추가
                        </button>
                        <button className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] rounded-xl font-semibold hover:bg-[var(--secondary)] transition-colors">
                            <span className="material-symbols-outlined">directions</span>
                            길찾기
                        </button>
                        <button className="px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-colors">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

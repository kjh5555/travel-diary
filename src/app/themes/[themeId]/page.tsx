"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    ThemeSpot, 
    ThemeCategoryId, 
    ThemeSubCategory,
    THEME_CATEGORIES,
    SUB_CATEGORY_FILTERS,
    SUB_CATEGORY_LABELS,
    SUB_CATEGORY_COLORS
} from "@/domain/types/themeSpot";
import { LocalStorageThemeSpotRepository } from "@/data/repositories/LocalStorageThemeSpotRepository";
import { GetThemeSpotListUseCase } from "@/domain/usecases/themeSpot/GetThemeSpotListUseCase";
import { FilterThemeSpotsBySubCategoryUseCase } from "@/domain/usecases/themeSpot/FilterThemeSpotsBySubCategoryUseCase";
import { SearchThemeSpotsUseCase } from "@/domain/usecases/themeSpot/SearchThemeSpotsUseCase";
import { ToggleThemeSpotLikeUseCase } from "@/domain/usecases/themeSpot/ToggleThemeSpotLikeUseCase";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";

export default function ThemeListPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.id || "anonymous";
    const themeId = params.themeId as ThemeCategoryId;
    
    const [spots, setSpots] = useState<ThemeSpot[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<ThemeSubCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const themeCategory = THEME_CATEGORIES.find(c => c.id === themeId);
    const filters = SUB_CATEGORY_FILTERS[themeId] || [];

    const repository = new LocalStorageThemeSpotRepository();
    const getListUseCase = new GetThemeSpotListUseCase(repository);
    const filterUseCase = new FilterThemeSpotsBySubCategoryUseCase(repository);
    const searchUseCase = new SearchThemeSpotsUseCase(repository);
    const toggleLikeUseCase = new ToggleThemeSpotLikeUseCase(repository);

    const loadSpots = async () => {
        setIsLoading(true);
        try {
            let result: ThemeSpot[];
            
            if (searchQuery.trim()) {
                result = await searchUseCase.execute(searchQuery, themeId);
            } else if (selectedSubCategory !== 'all') {
                result = await filterUseCase.execute(themeId, selectedSubCategory);
            } else {
                result = await getListUseCase.execute(themeId);
            }
            
            setSpots(result);
        } catch (error) {
            console.error("Failed to load spots:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (themeId) {
            loadSpots();
        }
    }, [themeId, selectedSubCategory, searchQuery]);

    const handleToggleLike = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const updated = await toggleLikeUseCase.execute(id, userId);
        if (updated) {
            setSpots(prev => prev.map(s => s.id === id ? updated : s));
        }
    };

    if (!themeCategory) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4">
                    error_outline
                </span>
                <h2 className="text-2xl font-bold mb-2">테마를 찾을 수 없어요</h2>
                <p className="text-[var(--muted-foreground)] mb-6">요청하신 테마가 존재하지 않습니다.</p>
                <Link 
                    href="/themes"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    테마 목록으로
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto">
            <button 
                onClick={() => router.push('/themes')}
                className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span>테마 목록</span>
            </button>

            <section className="mb-8 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeCategory.gradient} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white text-2xl">
                            {themeCategory.icon}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            {themeCategory.name}
                        </h1>
                        <p className="text-[var(--muted-foreground)]">
                            {themeCategory.description}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <div className="relative max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="장소, 지역 검색..."
                        className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]"
                    />
                </div>
            </section>

            <section className="mb-8 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setSelectedSubCategory(filter.value as ThemeSubCategory | 'all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                selectedSubCategory === filter.value
                                    ? "bg-[var(--primary)] text-white shadow-md"
                                    : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </section>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-[var(--surface)] rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : spots.length === 0 ? (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4">
                        search_off
                    </span>
                    <h3 className="text-xl font-bold mb-2">검색 결과가 없어요</h3>
                    <p className="text-[var(--muted-foreground)]">다른 키워드로 검색해보세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {spots.map((spot) => (
                        <Link
                            key={spot.id}
                            href={`/themes/${themeId}/${spot.id}`}
                            className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                        >
                            <GooglePlacePhoto
                                query={`${spot.title} ${spot.location}`}
                                location={{ lat: spot.lat, lng: spot.lng }}
                                className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                                maxWidth={400}
                                maxHeight={533}
                                fallback={
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 transition-transform duration-500 group-hover:scale-110" />
                                }
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {spot.location}
                            </div>

                            <button
                                onClick={(e) => handleToggleLike(spot.id, e)}
                                className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                                    spot.isLiked 
                                        ? "bg-red-500 text-white" 
                                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/40"
                                }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${spot.isLiked ? "filled" : ""}`}>
                                    favorite
                                </span>
                            </button>

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <span className={`${SUB_CATEGORY_COLORS[spot.subCategory] || 'bg-gray-500/90'} text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block`}>
                                    {SUB_CATEGORY_LABELS[spot.subCategory] || spot.subCategory}
                                </span>
                                
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="material-symbols-outlined text-yellow-400 text-sm filled">star</span>
                                    <span className="text-white text-sm font-bold">{spot.rating}</span>
                                </div>

                                <h3 className="text-white font-bold text-lg leading-tight mb-1">
                                    {spot.title}
                                </h3>
                                <p className="text-gray-300 text-sm line-clamp-2">
                                    {spot.subtitle}
                                </p>
                            </div>
                        </Link>
                    ))}

                    <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-center p-6 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer group">
                        <span className="material-symbols-outlined text-5xl text-[var(--muted-foreground)] group-hover:text-[var(--primary)] mb-4">
                            add_circle
                        </span>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)]">새로운 장소 추천</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            알고 있는 좋은 장소를 추천해주세요
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

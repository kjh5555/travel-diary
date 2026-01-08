"use client"

import Link from "next/link";
import { THEME_CATEGORIES, ThemeCategoryId } from "@/domain/types/themeSpot";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";

const CATEGORY_PHOTO_QUERIES: Record<ThemeCategoryId, { query: string; location: { lat: number; lng: number } }> = {
    animation: { query: "Studio Ghibli Museum Mitaka", location: { lat: 35.6962, lng: 139.5704 } },
    food: { query: "Tsukiji Fish Market Tokyo", location: { lat: 35.6654, lng: 139.7707 } },
    sightseeing: { query: "Fushimi Inari Shrine Kyoto", location: { lat: 34.9671, lng: 135.7727 } },
    history: { query: "Himeji Castle Japan", location: { lat: 34.8394, lng: 134.6939 } },
};

export default function ThemesPage() {
    return (
        <div className="max-w-[1400px] mx-auto">
            <section className="mb-12 animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                    테마 여행
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">
                    나만의 특별한 테마로 여행을 계획해보세요.
                </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {THEME_CATEGORIES.map((category) => {
                    const photoConfig = CATEGORY_PHOTO_QUERIES[category.id];
                    return (
                        <Link
                            key={category.id}
                            href={`/themes/${category.id}`}
                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <GooglePlacePhoto
                                query={photoConfig.query}
                                location={photoConfig.location}
                                className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                                maxWidth={600}
                                maxHeight={450}
                                fallback={
                                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} transition-transform duration-500 group-hover:scale-110`} />
                                }
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                <span className="material-symbols-outlined text-6xl mb-4 drop-shadow-lg group-hover:scale-110 transition-transform">
                                    {category.icon}
                                </span>
                                <h2 className="text-2xl font-bold mb-2 drop-shadow-md">
                                    {category.name}
                                </h2>
                                <p className="text-sm text-white/80 text-center line-clamp-2">
                                    {category.description}
                                </p>
                            </div>

                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white bg-white/20 rounded-full p-2 backdrop-blur-sm">
                                    arrow_forward
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/*  */}
        </div>
    );
}

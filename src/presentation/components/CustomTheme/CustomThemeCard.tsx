"use client"

import React from "react";
import { CustomTheme, CUSTOM_THEME_COLORS } from "@/domain/types/customTheme";

interface CustomThemeCardProps {
    theme: CustomTheme;
    onClick: () => void;
}

export const CustomThemeCard: React.FC<CustomThemeCardProps> = ({ theme, onClick }) => {
    const colorConfig = CUSTOM_THEME_COLORS.find(c => c.value === theme.color) || CUSTOM_THEME_COLORS[4];
    const placeCount = theme.places.length;
    const firstPlacePhoto = theme.coverImage || theme.places[0]?.place.photos?.[0];

    return (
        <div
            onClick={onClick}
            className="relative group cursor-pointer overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:shadow-lg transition-all duration-300"
        >
            <div className="aspect-[4/3] relative overflow-hidden">
                {firstPlacePhoto ? (
                    <img
                        src={firstPlacePhoto}
                        alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${colorConfig.gradient}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3">
                    <div className={`${theme.color} p-2 rounded-xl text-white shadow-lg`}>
                        <span className="material-symbols-outlined">{theme.icon}</span>
                    </div>
                </div>

                <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {placeCount}곳
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)] transition-colors">
                    {theme.name}
                </h3>
                {theme.description && (
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {theme.description}
                    </p>
                )}
                {!theme.description && placeCount > 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                        {theme.places.slice(0, 3).map(p => p.place.name).join(", ")}
                        {placeCount > 3 && " 외"}
                    </p>
                )}
            </div>
        </div>
    );
};

"use client"

import React from "react";
import { CustomThemePlace } from "@/domain/types/customTheme";

interface CustomThemePlaceCardProps {
    themePlace: CustomThemePlace;
    onRemove?: () => void;
    showRemoveButton?: boolean;
}

export const CustomThemePlaceCard: React.FC<CustomThemePlaceCardProps> = ({ 
    themePlace, 
    onRemove,
    showRemoveButton = true
}) => {
    const { place, note } = themePlace;
    const photo = place.photos?.[0];

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden group hover:shadow-md transition-all">
            <div className="flex gap-4 p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[var(--secondary)]">
                    {photo ? (
                        <img
                            src={photo}
                            alt={place.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[var(--muted-foreground)]">photo</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base mb-1 truncate">{place.name}</h4>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2 line-clamp-1">
                        {place.address}
                    </p>
                    
                    <div className="flex items-center gap-3">
                        {place.rating && (
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-yellow-500 text-sm filled">star</span>
                                <span className="text-sm font-medium">{place.rating}</span>
                                {place.user_ratings_total && (
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                        ({place.user_ratings_total.toLocaleString()})
                                    </span>
                                )}
                            </div>
                        )}
                        {place.types?.[0] && (
                            <span className="text-xs px-2 py-0.5 bg-[var(--secondary)] rounded-full text-[var(--muted-foreground)]">
                                {place.types[0].replace(/_/g, " ")}
                            </span>
                        )}
                    </div>

                    {note && (
                        <p className="text-xs text-[var(--primary)] mt-2 italic">
                            &quot;{note}&quot;
                        </p>
                    )}
                </div>

                {showRemoveButton && onRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="self-start p-2 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                )}
            </div>
        </div>
    );
};

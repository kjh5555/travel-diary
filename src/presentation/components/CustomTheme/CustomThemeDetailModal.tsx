"use client"

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CustomTheme, CUSTOM_THEME_COLORS } from "@/domain/types/customTheme";
import { CustomThemePlaceCard } from "./CustomThemePlaceCard";

interface CustomThemeDetailModalProps {
    theme: CustomTheme;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    onAddPlaces?: () => void;
}

export const CustomThemeDetailModal: React.FC<CustomThemeDetailModalProps> = ({
    theme: initialTheme,
    isOpen,
    onClose,
    onUpdate,
    onAddPlaces,
}) => {
    const { data: session } = useSession();
    const [theme, setTheme] = useState<CustomTheme>(initialTheme);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    useEffect(() => {
        setTheme(initialTheme);
    }, [initialTheme]);

    const colorConfig = CUSTOM_THEME_COLORS.find(c => c.value === theme.color) || CUSTOM_THEME_COLORS[4];

    const handleRemovePlace = async (placeId: string) => {
        if (!session?.user?.id) return;
        
        setIsRemoving(placeId);
        try {
            const response = await fetch(`/api/custom-themes/${theme.id}/places?placeId=${placeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const refreshResponse = await fetch(`/api/custom-themes/${theme.id}`);
                if (refreshResponse.ok) {
                    const updated: CustomTheme = await refreshResponse.json();
                    setTheme(updated);
                    onUpdate?.();
                }
            }
        } catch (error) {
            console.error("Failed to remove place:", error);
        } finally {
            setIsRemoving(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden flex flex-col m-4">
                <div className={`relative h-32 bg-gradient-to-br ${colorConfig.gradient}`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    
                    <div className="absolute bottom-4 left-6 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                            <span className="material-symbols-outlined text-2xl">{theme.icon}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{theme.name}</h2>
                            {theme.description && (
                                <p className="text-white/80 text-sm">{theme.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[var(--primary)]">location_on</span>
                            <span className="font-medium">{theme.places.length}개의 장소</span>
                        </div>
                        {onAddPlaces && (
                            <button
                                onClick={onAddPlaces}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                장소 추가
                            </button>
                        )}
                    </div>

                    {theme.places.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="material-symbols-outlined text-5xl text-[var(--muted-foreground)]/50 mb-4">
                                add_location
                            </span>
                            <h3 className="text-lg font-bold mb-2">아직 장소가 없어요</h3>
                            <p className="text-[var(--muted-foreground)] text-sm mb-4">
                                마음에 드는 장소를 추가해보세요
                            </p>
                            {onAddPlaces && (
                                <button
                                    onClick={onAddPlaces}
                                    className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
                                >
                                    장소 추가하기
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {theme.places.map((themePlace) => (
                                <CustomThemePlaceCard
                                    key={themePlace.id}
                                    themePlace={themePlace}
                                    onRemove={() => handleRemovePlace(themePlace.place.id)}
                                    showRemoveButton={isRemoving !== themePlace.place.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

"use client"

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { CustomTheme, CUSTOM_THEME_COLORS } from "@/domain/types/customTheme";
import { Place } from "@/domain/types/place";
import { MapContainer } from "@/presentation/components/Map/MapContainer";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";


interface AddPlacesToThemeModalProps {
    theme: CustomTheme;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export const AddPlacesToThemeModal: React.FC<AddPlacesToThemeModalProps> = ({
    theme,
    isOpen,
    onClose,
    onComplete,
}) => {
    const { data: session } = useSession();
    const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [searchUseCase, setSearchUseCase] = useState<SearchPlacesUseCase | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const colorConfig = CUSTOM_THEME_COLORS.find(c => c.value === theme.color) || CUSTOM_THEME_COLORS[4];
    const existingPlaceIds = theme.places.map(p => p.place.id);

    useEffect(() => {
        if (map) {
            const repository = new GooglePlaceRepository(map);
            setSearchUseCase(new SearchPlacesUseCase(repository));
        }
    }, [map]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!map) return;

        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const markerColor = colorConfig.value.includes("rose") ? "#f43f5e" :
                          colorConfig.value.includes("orange") ? "#f97316" :
                          colorConfig.value.includes("amber") ? "#f59e0b" :
                          colorConfig.value.includes("emerald") ? "#10b981" :
                          colorConfig.value.includes("teal") ? "#14b8a6" :
                          colorConfig.value.includes("sky") ? "#0ea5e9" :
                          colorConfig.value.includes("indigo") ? "#6366f1" :
                          colorConfig.value.includes("purple") ? "#a855f7" : "#64748b";

        selectedPlaces.forEach((place, index) => {
            const marker = new google.maps.Marker({
                position: place.location,
                map,
                label: {
                    text: String(index + 1),
                    color: "white",
                    fontWeight: "bold",
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: markerColor,
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                    scale: 14,
                },
            });
            markersRef.current.push(marker);
        });

        if (selectedPlaces.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            selectedPlaces.forEach(place => bounds.extend(place.location));
            map.fitBounds(bounds, 50);
        }
    }, [map, selectedPlaces, colorConfig]);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (!val.trim() || !searchUseCase) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const center = map?.getCenter();
            const results = await searchUseCase.execute({
                query: val,
                location: center ? { lat: center.lat(), lng: center.lng() } : undefined,
            });
            setSearchResults(results);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddPlace = (place: Place) => {
        if (selectedPlaces.some(p => p.id === place.id) || existingPlaceIds.includes(place.id)) return;
        setSelectedPlaces(prev => [...prev, place]);
        setSearchResults([]);
        setQuery("");
    };

    const handleRemovePlace = (placeId: string) => {
        setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
    };

    const handleSave = async () => {
        if (selectedPlaces.length === 0) return;
        if (!session?.user?.id) {
            alert("로그인이 필요합니다.");
            return;
        }

        setIsSaving(true);
        try {
            for (const place of selectedPlaces) {
                const response = await fetch(`/api/custom-themes/${theme.id}/places`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ place }),
                });

                if (!response.ok) {
                    throw new Error("장소 추가에 실패했습니다.");
                }
            }

            onComplete?.();
            handleClose();
        } catch (error) {
            console.error("Failed to add places:", error);
            alert("장소 추가에 실패했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setSelectedPlaces([]);
        setQuery("");
        setSearchResults([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />
            
            <div className="relative flex w-full max-w-5xl m-auto bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
                <div className="w-2/5 flex flex-col border-r border-[var(--border)]">
                    <div className={`p-6 bg-gradient-to-r ${colorConfig.gradient}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                                    <span className="material-symbols-outlined">{theme.icon}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{theme.name}</h2>
                                    <p className="text-white/80 text-sm">장소 추가하기</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[var(--primary)]">add_location</span>
                                추가할 장소 ({selectedPlaces.length})
                            </h3>
                        </div>

                        {selectedPlaces.length === 0 ? (
                            <div className="text-center py-12 text-[var(--muted-foreground)]">
                                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">search</span>
                                <p className="text-sm">지도에서 장소를 검색하고 추가하세요</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedPlaces.map((place, index) => (
                                    <div
                                        key={place.id}
                                        className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl group"
                                    >
                                        <div className={`w-7 h-7 rounded-full ${theme.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{place.name}</div>
                                            <div className="text-xs text-[var(--muted-foreground)] truncate">{place.address}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemovePlace(place.id)}
                                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-[var(--border)]">
                        <button
                            onClick={handleSave}
                            disabled={selectedPlaces.length === 0 || isSaving}
                            className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    추가 중...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">add</span>
                                    {selectedPlaces.length}개 장소 추가하기
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="w-3/5 flex flex-col">
                    <div className="p-4 border-b border-[var(--border)]" ref={dropdownRef}>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                                search
                            </span>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="장소 검색..."
                                className="w-full h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-xl pl-12 pr-4 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                            />
                            {isSearching && (
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--muted-foreground)]">
                                    progress_activity
                                </span>
                            )}

                            {searchResults.length > 0 && (
                                <ul className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                    {searchResults.map(place => {
                                        const isExisting = existingPlaceIds.includes(place.id);
                                        const isAdded = selectedPlaces.some(p => p.id === place.id);
                                        const isDisabled = isExisting || isAdded;
                                        
                                        return (
                                            <li
                                                key={place.id}
                                                onClick={() => !isDisabled && handleAddPlace(place)}
                                                className={`px-4 py-3 border-b border-[var(--border)] last:border-0 ${
                                                    isDisabled 
                                                        ? "opacity-50 cursor-not-allowed bg-[var(--secondary)]" 
                                                        : "hover:bg-[var(--secondary)] cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold truncate">{place.name}</div>
                                                        <div className="text-xs text-[var(--muted-foreground)] truncate">{place.address}</div>
                                                    </div>
                                                    {isExisting ? (
                                                        <span className="text-xs text-[var(--muted-foreground)] ml-2">이미 추가됨</span>
                                                    ) : isAdded ? (
                                                        <span className="material-symbols-outlined text-[var(--primary)] ml-2">check_circle</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[var(--muted-foreground)] ml-2">add_circle</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <MapContainer
                            onMapLoad={setMap}
                            center={{ lat: 35.6762, lng: 139.6503 }}
                            zoom={10}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

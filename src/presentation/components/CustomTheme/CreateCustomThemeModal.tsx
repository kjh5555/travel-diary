"use client"

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
    CUSTOM_THEME_COLORS, 
    CUSTOM_THEME_ICONS,
    DEFAULT_THEME_COLOR,
    DEFAULT_THEME_ICON 
} from "@/domain/types/customTheme";
import { Place } from "@/domain/types/place";
import { MapContainer } from "@/presentation/components/Map/MapContainer";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";
import { CustomTheme } from "@/domain/types/customTheme";

interface CreateCustomThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

export const CreateCustomThemeModal: React.FC<CreateCustomThemeModalProps> = ({
    isOpen,
    onClose,
    onCreated,
}) => {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(DEFAULT_THEME_COLOR);
    const [selectedIcon, setSelectedIcon] = useState(DEFAULT_THEME_ICON);
    const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
    
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [searchUseCase, setSearchUseCase] = useState<SearchPlacesUseCase | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                    fillColor: selectedColor.value.replace("bg-", "").includes("rose") ? "#f43f5e" :
                              selectedColor.value.includes("orange") ? "#f97316" :
                              selectedColor.value.includes("amber") ? "#f59e0b" :
                              selectedColor.value.includes("emerald") ? "#10b981" :
                              selectedColor.value.includes("teal") ? "#14b8a6" :
                              selectedColor.value.includes("sky") ? "#0ea5e9" :
                              selectedColor.value.includes("indigo") ? "#6366f1" :
                              selectedColor.value.includes("purple") ? "#a855f7" : "#64748b",
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
    }, [map, selectedPlaces, selectedColor]);

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
        if (selectedPlaces.some(p => p.id === place.id)) return;
        setSelectedPlaces(prev => [...prev, place]);
        setSearchResults([]);
        setQuery("");
    };

    const handleRemovePlace = (placeId: string) => {
        setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
    };

    const handleSave = async () => {
        if (!name.trim() || selectedPlaces.length === 0 || !session?.user?.id) return;

        setIsSaving(true);
        try {
            const createResponse = await fetch('/api/custom-themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    color: selectedColor.value,
                    icon: selectedIcon,
                }),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create theme');
            }

            const theme: CustomTheme = await createResponse.json();

            for (const place of selectedPlaces) {
                await fetch(`/api/custom-themes/${theme.id}/places`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ place }),
                });
            }

            onCreated?.();
            handleClose();
        } catch (error) {
            console.error("Failed to save theme:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setSelectedColor(DEFAULT_THEME_COLOR);
        setSelectedIcon(DEFAULT_THEME_ICON);
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
            
            <div className="relative flex w-full max-w-6xl m-auto bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
                <div className="w-1/2 flex flex-col border-r border-[var(--border)]">
                    <div className="p-6 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">나만의 테마 만들기</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowIconPicker(!showIconPicker)}
                                        className={`${selectedColor.value} p-3 rounded-xl text-white shadow-lg hover:opacity-90 transition-opacity`}
                                    >
                                        <span className="material-symbols-outlined text-2xl">{selectedIcon}</span>
                                    </button>
                                    
                                    {showIconPicker && (
                                        <div className="absolute top-full left-0 mt-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-10 w-64">
                                            <div className="text-xs font-bold text-[var(--muted-foreground)] mb-2">아이콘</div>
                                            <div className="grid grid-cols-6 gap-1 mb-3">
                                                {CUSTOM_THEME_ICONS.map(icon => (
                                                    <button
                                                        key={icon}
                                                        onClick={() => setSelectedIcon(icon)}
                                                        className={`p-2 rounded-lg transition-all ${
                                                            selectedIcon === icon 
                                                                ? "bg-[var(--primary)] text-white" 
                                                                : "hover:bg-[var(--secondary)]"
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">{icon}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="text-xs font-bold text-[var(--muted-foreground)] mb-2">색상</div>
                                            <div className="flex gap-2 flex-wrap">
                                                {CUSTOM_THEME_COLORS.map(color => (
                                                    <button
                                                        key={color.id}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-7 h-7 rounded-full ${color.value} transition-transform ${
                                                            selectedColor.id === color.id 
                                                                ? "ring-2 ring-offset-2 ring-[var(--primary)] scale-110" 
                                                                : "hover:scale-110"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="테마 이름 (예: 오사카 음식 맛집)"
                                    maxLength={50}
                                    className="flex-1 h-12 bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-medium"
                                />
                            </div>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="테마 설명 (선택)"
                                rows={2}
                                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[var(--primary)]">location_on</span>
                                선택한 장소 ({selectedPlaces.length})
                            </h3>
                        </div>

                        {selectedPlaces.length === 0 ? (
                            <div className="text-center py-12 text-[var(--muted-foreground)]">
                                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">add_location</span>
                                <p className="text-sm">지도에서 장소를 검색하고 추가하세요</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedPlaces.map((place, index) => (
                                    <div
                                        key={place.id}
                                        className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl group"
                                    >
                                        <div className={`w-7 h-7 rounded-full ${selectedColor.value} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
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
                            disabled={!name.trim() || selectedPlaces.length === 0 || isSaving}
                            className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    저장 중...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">check</span>
                                    테마 저장하기
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="w-1/2 flex flex-col">
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
                                        const isAdded = selectedPlaces.some(p => p.id === place.id);
                                        return (
                                            <li
                                                key={place.id}
                                                onClick={() => !isAdded && handleAddPlace(place)}
                                                className={`px-4 py-3 border-b border-[var(--border)] last:border-0 ${
                                                    isAdded 
                                                        ? "opacity-50 cursor-not-allowed bg-[var(--secondary)]" 
                                                        : "hover:bg-[var(--secondary)] cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold truncate">{place.name}</div>
                                                        <div className="text-xs text-[var(--muted-foreground)] truncate">{place.address}</div>
                                                    </div>
                                                    {isAdded ? (
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

import React, { useState, useEffect, useRef } from 'react';
import { Place } from "@/domain/types/place";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";

interface PlaceSearchSectionProps {
    searchUseCase: SearchPlacesUseCase | null;
    currentDay: number;
    searchCenterLocation?: google.maps.LatLngLiteral;
    onAddPlace: (place: Place, transportMode: 'TRANSIT' | 'DRIVING' | 'WALKING') => void;
}

export const PlaceSearchSection: React.FC<PlaceSearchSectionProps> = ({
    searchUseCase,
    currentDay,
    searchCenterLocation,
    onAddPlace
}) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Place[]>([]);
    const [recommendations, setRecommendations] = useState<Place[]>([]);
    const [candidatePlace, setCandidatePlace] = useState<Place | null>(null);
    const [transportMode, setTransportMode] = useState<'TRANSIT' | 'DRIVING' | 'WALKING'>('TRANSIT');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setResults([]);
                setRecommendations([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (!val.trim() || !searchUseCase) {
            setResults([]);
            setRecommendations([]);
            return;
        }

        try {
            const res = await searchUseCase.execute({
                query: val,
                location: searchCenterLocation
            });

            const isBroad = !val.includes(" ") && res.length >= 3;
            if (isBroad && searchCenterLocation) {
                setRecommendations(res.slice(0, 3));
                setResults([]);
            } else {
                setResults(res);
                setRecommendations([]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const selectCandidate = (place: Place) => {
        setCandidatePlace(place);
        setResults([]);
        setQuery("");
        setRecommendations([]);
    };

    return (
        <div className="space-y-4 relative z-10" ref={dropdownRef}>
            <h3 className="text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">add_location</span>
                {currentDay === 0 ? "방문할 장소 추가" : `${currentDay + 1}일차 일정`}
            </h3>

            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={`${currentDay + 1}일차 장소 검색...`}
                    className="w-full h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-4 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                />

                {results.length > 0 && (
                    <ul className="absolute top-13 left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                        {results.map(place => (
                            <li
                                key={place.id}
                                onClick={() => selectCandidate(place)}
                                className="px-4 py-3 hover:bg-[var(--secondary)] cursor-pointer border-b border-[var(--border)] last:border-0"
                            >
                                <div className="font-bold">{place.name}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">{place.address}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {candidatePlace && (
                <div className="p-4 bg-[var(--surface)] border-2 border-[var(--primary)] rounded-xl shadow-md">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-xs font-bold text-[var(--primary)] mb-1">새 장소</div>
                            <h4 className="font-bold text-lg">{candidatePlace.name}</h4>
                            <p className="text-xs text-[var(--muted-foreground)]">{candidatePlace.address}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-sm text-[var(--muted-foreground)] font-medium">이동 수단</div>
                        <div className="flex gap-2">
                            {(['TRANSIT', 'DRIVING', 'WALKING'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setTransportMode(mode)}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                                        transportMode === mode
                                            ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md'
                                            : 'border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {mode === 'TRANSIT' ? 'subway' : mode === 'DRIVING' ? 'local_taxi' : 'directions_walk'}
                                    </span>
                                    <span>{mode === 'TRANSIT' ? '대중교통' : mode === 'DRIVING' ? '택시' : '도보'}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setCandidatePlace(null)}
                                className="flex-1 py-3 border border-[var(--border)] text-[var(--muted-foreground)] font-medium rounded-lg hover:bg-[var(--secondary)] transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (candidatePlace) {
                                        onAddPlace(candidatePlace, transportMode);
                                        setCandidatePlace(null);
                                    }
                                }}
                                className="flex-[2] py-3 bg-[var(--primary)] text-white font-bold rounded-lg shadow-md hover:bg-[var(--primary-dark)] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span>
                                <span>일정에 추가</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {recommendations.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide">추천 장소</div>
                    <div className="grid grid-cols-1 gap-2">
                        {recommendations.map((place, index) => (
                            <div
                                key={place.id}
                                onClick={() => selectCandidate(place)}
                                className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-lg cursor-pointer hover:border-[var(--primary)] hover:shadow-md transition-all group flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{place.name}</div>
                                    <div className="text-xs text-[var(--muted-foreground)] truncate">{place.address}</div>
                                </div>
                                <span className="material-symbols-outlined text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
                                    chevron_right
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

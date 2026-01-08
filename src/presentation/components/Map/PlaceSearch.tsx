"use client"

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Place } from "@/domain/types/place";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";

interface PlaceSearchProps {
    onPlaceSelect: (place: Place) => void;
    map?: google.maps.Map | null;
}

export const PlaceSearch = ({ onPlaceSelect, map }: PlaceSearchProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Place[]>([]);
    const [searchUseCase, setSearchUseCase] = useState<SearchPlacesUseCase | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (map && !searchUseCase) {
            const repository = new GooglePlaceRepository(map);
            setSearchUseCase(new SearchPlacesUseCase(repository));
        }
    }, [map, searchUseCase]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !searchUseCase) return;

        setLoading(true);
        setError(null);
        try {
            const places = await searchUseCase.execute({ query });
            setResults(places);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Search failed";
            setError(errorMessage);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-10">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for places (e.g. Osaka Castle)"
                    disabled={loading || !searchUseCase}
                    className="w-full rounded-full border border-gray-300 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700"
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </form>

            {error && (
                <div className="absolute mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <ul className="absolute mt-2 w-full rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    {results.map((place) => (
                        <li
                            key={place.id}
                            onClick={() => {
                                onPlaceSelect(place);
                                setResults([]);
                                setQuery("");
                            }}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                        >
                            <div className="font-medium">{place.name}</div>
                            <div className="text-xs text-gray-500 truncate">{place.address}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

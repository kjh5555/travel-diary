"use client"

import { useState, useEffect } from "react";
import { Place } from "@/domain/types/place";
import { FindSimilarPlacesUseCase } from "@/domain/usecases/place/FindSimilarPlacesUseCase";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";
import { MapPin, Star } from "lucide-react";

interface SimilarPlacesRecommendationProps {
    place: Place;
    map?: google.maps.Map | null;
    onPlaceSelect?: (place: Place) => void;
}

export const SimilarPlacesRecommendation = ({
    place,
    map,
    onPlaceSelect
}: SimilarPlacesRecommendationProps) => {
    const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [useCase, setUseCase] = useState<FindSimilarPlacesUseCase | null>(null);

    useEffect(() => {
        if (map && !useCase) {
            const repository = new GooglePlaceRepository(map);
            setUseCase(new FindSimilarPlacesUseCase(repository));
        }
    }, [map, useCase]);

    useEffect(() => {
        const loadSimilarPlaces = async () => {
            if (!useCase) return;

            setLoading(true);
            try {
                const results = await useCase.execute(place, 3);
                setSimilarPlaces(results);
            } catch (error) {
                console.error('Failed to load similar places:', error);
                setSimilarPlaces([]);
            } finally {
                setLoading(false);
            }
        };

        loadSimilarPlaces();
    }, [place, useCase]);

    if (loading) {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
                <p className="text-sm text-gray-500">Loading recommendations...</p>
            </div>
        );
    }

    if (similarPlaces.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg dark:bg-blue-950/20">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Similar Places Nearby
            </h4>
            <div className="space-y-2">
                {similarPlaces.map((similarPlace) => (
                    <div
                        key={similarPlace.id}
                        onClick={() => onPlaceSelect?.(similarPlace)}
                        className="flex items-start gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-blue-100 transition-colors dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{similarPlace.name}</p>
                            <p className="text-xs text-gray-500 truncate">{similarPlace.address}</p>
                            {similarPlace.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {similarPlace.rating}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

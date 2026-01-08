import { useState, useEffect } from "react";
import { Place } from "@/domain/types/place";
import { GetRecommendationsUseCase } from "@/domain/usecases/place/GetRecommendationsUseCase";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";

export const useRecommendations = (place: Place | null, map: google.maps.Map | null) => {
    const [recommendations, setRecommendations] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!place || !map) return;

        const fetchRecs = async () => {
            setLoading(true);
            try {
                const repo = new GooglePlaceRepository(map);
                const useCase = new GetRecommendationsUseCase(repo);
                const res = await useCase.execute(place);
                setRecommendations(res);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, [place, map]);

    return { recommendations, loading };
};

"use client";

import { useState, useCallback } from "react";
import { Place } from "@/domain/types/place";
import { SavedItinerary } from "@/domain/types/itinerary";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { FindMatchingJourneysForPlaceUseCase, MatchingJourneysResult } from "@/domain/usecases/itinerary/FindMatchingJourneysForPlaceUseCase";
import { AddPlaceToJourneyUseCase, AddPlaceToJourneyParams } from "@/domain/usecases/itinerary/AddPlaceToJourneyUseCase";

interface UseAddPlaceToJourneyReturn {
    isLoading: boolean;
    matchingJourneys: SavedItinerary[];
    placeCountry: string | null;
    hasOngoingJourneys: boolean;
    findMatchingJourneys: (place: Place) => Promise<MatchingJourneysResult>;
    addPlaceToJourney: (params: AddPlaceToJourneyParams) => Promise<SavedItinerary>;
    reset: () => void;
}

export function useAddPlaceToJourney(): UseAddPlaceToJourneyReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [matchingJourneys, setMatchingJourneys] = useState<SavedItinerary[]>([]);
    const [placeCountry, setPlaceCountry] = useState<string | null>(null);
    const [hasOngoingJourneys, setHasOngoingJourneys] = useState(false);

    const findMatchingJourneys = useCallback(async (place: Place): Promise<MatchingJourneysResult> => {
        setIsLoading(true);
        try {
            const repository = new LocalStorageItineraryRepository();
            const useCase = new FindMatchingJourneysForPlaceUseCase(repository);
            const result = await useCase.execute(place);
            
            setMatchingJourneys(result.journeys);
            setPlaceCountry(result.placeCountry);
            setHasOngoingJourneys(result.hasOngoingJourneys);
            
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addPlaceToJourney = useCallback(async (params: AddPlaceToJourneyParams): Promise<SavedItinerary> => {
        setIsLoading(true);
        try {
            const repository = new LocalStorageItineraryRepository();
            const useCase = new AddPlaceToJourneyUseCase(repository);
            return await useCase.execute(params);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setMatchingJourneys([]);
        setPlaceCountry(null);
        setHasOngoingJourneys(false);
    }, []);

    return {
        isLoading,
        matchingJourneys,
        placeCountry,
        hasOngoingJourneys,
        findMatchingJourneys,
        addPlaceToJourney,
        reset
    };
}

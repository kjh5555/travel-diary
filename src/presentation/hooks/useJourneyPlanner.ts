import { useState, useMemo, useEffect } from 'react';
import { Place } from "@/domain/types/place";
import { Route, SavedItinerary, SavedItineraryPlace } from "@/domain/types/itinerary";
import { GoogleRouteRepository } from "@/data/repositories/GoogleRouteRepository";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { CalculateRouteUseCase } from "@/domain/usecases/itinerary/CalculateRouteUseCase";
import { SaveTripItineraryUseCase } from "@/domain/usecases/itinerary/SaveTripItineraryUseCase";

export type ViewMode = 'planning' | 'itinerary';
export type TransportMode = 'TRANSIT' | 'DRIVING' | 'WALKING';

export interface WishlistItem {
    id: string;
    type: 'place';
    data: Place;
    routeToNext?: Route;
}

export interface AirportItem {
    place: Place;
    routeToNext?: Route;
}

export interface ItineraryItemWrapper {
    place: Place;
    routeToNext?: Route;
    day: number;
    isDayTransition?: boolean;
}

export const useJourneyPlanner = (initialData?: SavedItinerary | null, onClose?: () => void) => {
    // Basic Info
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentDay, setCurrentDay] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('planning');
    const [isEditingDate, setIsEditingDate] = useState(false);

    // Data State
    const [selectedAirport, setSelectedAirport] = useState<AirportItem | null>(null);
    const [departureAirport, setDepartureAirport] = useState<AirportItem | null>(null);
    const [dailyWishlists, setDailyWishlists] = useState<Record<number, WishlistItem[]>>({});

    // Itinerary Result State
    const [itineraryItems, setItineraryItems] = useState<ItineraryItemWrapper[]>([]);
    const [calculatingRoutes, setCalculatingRoutes] = useState(false);

    // Settings
    const [transportMode, setTransportMode] = useState<TransportMode>('TRANSIT');

    // Initialization
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "My Trip");
            setStartDate(initialData.startDate);
            setEndDate(initialData.endDate);

            if (initialData.arrivalAirport) {
                setSelectedAirport({ place: initialData.arrivalAirport });
            }
            if (initialData.departureAirport) {
                setDepartureAirport({ place: initialData.departureAirport });
            }

            // Reconstruct dailyWishlists
            const newWishlists: Record<number, WishlistItem[]> = {};
            initialData.items.forEach(item => {
                if (!newWishlists[item.day]) newWishlists[item.day] = [];
                newWishlists[item.day].push({
                    id: crypto.randomUUID(),
                    type: 'place',
                    data: item.place,
                    routeToNext: item.routeToNext
                });
            });
            setDailyWishlists(newWishlists);
            setItineraryItems(initialData.items);
            setViewMode('itinerary');
        } else {
            // Reset
            setTitle("");
            setStartDate("");
            setEndDate("");
            setDailyWishlists({});
            setSelectedAirport(null);
            setDepartureAirport(null);
            setItineraryItems([]);
            setViewMode('planning');
        }
    }, [initialData]);

    // Derived Data
    const daysCount = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }, [startDate, endDate]);

    const currentWishlist = dailyWishlists[currentDay] || [];

    const prevDayLastPlace = useMemo(() => {
        if (currentDay > 0) {
            const prevDayList = dailyWishlists[currentDay - 1] || [];
            return prevDayList.length > 0 ? prevDayList[prevDayList.length - 1].data : null;
        }
        return null;
    }, [currentDay, dailyWishlists]);

    const isFormValid = useMemo(() => {
        return title.trim().length > 0 && startDate !== '' && endDate !== '';
    }, [title, startDate, endDate]);

    // Actions
    const addPlaceToWishlist = (place: Place) => {
        const newItem: WishlistItem = {
            id: crypto.randomUUID(),
            type: 'place',
            data: place
        };
        setDailyWishlists(prev => ({
            ...prev,
            [currentDay]: [...(prev[currentDay] || []), newItem]
        }));
    };

    const removePlaceFromWishlist = (itemId: string) => {
        setDailyWishlists(prev => ({
            ...prev,
            [currentDay]: (prev[currentDay] || []).filter(i => i.id !== itemId)
        }));
    };

    const handleCalculateRoutes = async () => {
        setCalculatingRoutes(true);
        const routeRepo = new GoogleRouteRepository();
        const routeUseCase = new CalculateRouteUseCase(routeRepo);

        // Build Sequence
        const sequence: { place: Place, day: number, isAirport?: boolean }[] = [];

        // 1. Arrival Airport
        if (selectedAirport) {
            sequence.push({ place: selectedAirport.place, day: 0, isAirport: true });
        }

        // 2. Daily Items
        for (let i = 0; i < daysCount; i++) {
            const dayItems = dailyWishlists[i] || [];
            dayItems.forEach(item => {
                sequence.push({ place: item.data, day: i });
            });
        }

        // 3. Departure Airport
        if (departureAirport) {
            sequence.push({ place: departureAirport.place, day: daysCount - 1, isAirport: true });
        }

        if (sequence.length < 2) {
            console.warn('Not enough places to calculate route');
            setItineraryItems(sequence.map(s => ({ place: s.place, day: s.day })));
            setViewMode('itinerary');
            setCalculatingRoutes(false);
            return;
        }

        const routeItems: ItineraryItemWrapper[] = [];
        let hasTransitFailure = false;

        try {
            for (let i = 0; i < sequence.length; i++) {
                const current = sequence[i];
                const next = sequence[i + 1];

                let routeToNext: Route | undefined = undefined;
                let isDayTransition = false;

                if (next) {
                    isDayTransition = current.day !== next.day;
                    let route = await routeUseCase.execute(current.place, next.place, transportMode);

                    if (route) {
                        routeToNext = route;
                    } else if (transportMode === 'TRANSIT') {
                        hasTransitFailure = true;
                        const drivingRoute = await routeUseCase.execute(current.place, next.place, 'DRIVING');
                        if (drivingRoute) routeToNext = drivingRoute;
                    }
                }

                routeItems.push({
                    place: current.place,
                    routeToNext,
                    day: current.day,
                    isDayTransition
                });
            }

            if (hasTransitFailure) {
                alert('일부 구간은 지하철 정보가 없어 택시 경로로 대체되었습니다.');
            }

            setItineraryItems(routeItems);
            setViewMode('itinerary');
        } catch (error) {
            console.error("Failed to calculate routes", error);
        } finally {
            setCalculatingRoutes(false);
        }
    };

    const handleSaveItinerary = async () => {
        if (!startDate || !endDate) return;

        const repository = new LocalStorageItineraryRepository();
        const saveUseCase = new SaveTripItineraryUseCase(repository);

        const itemsToSave: SavedItineraryPlace[] = itineraryItems.map(item => ({
            place: item.place,
            routeToNext: item.routeToNext,
            day: item.day,
            isDayTransition: item.isDayTransition
        }));

        const itineraryToSave: SavedItinerary = {
            id: initialData?.id || crypto.randomUUID(),
            title: title,
            startDate,
            endDate,
            arrivalAirport: selectedAirport?.place,
            departureAirport: departureAirport?.place,
            items: itemsToSave,
            createdAt: new Date().toISOString()
        };

        await saveUseCase.execute(itineraryToSave);
        if (onClose) onClose();
    };

    return {
        state: {
            title, setTitle,
            startDate, setStartDate,
            endDate, setEndDate,
            isEditingDate, setIsEditingDate,
            currentDay, setCurrentDay,
            viewMode, setViewMode,
            daysCount,
            dailyWishlists,
            currentWishlist,
            selectedAirport,
            departureAirport,
            itineraryItems,
            calculatingRoutes,
            transportMode, setTransportMode,
            prevDayLastPlace,
            isFormValid
        },
        actions: {
            setSelectedAirport,
            setDepartureAirport,
            addPlaceToWishlist,
            removePlaceFromWishlist,
            handleCalculateRoutes,
            handleSaveItinerary
        }
    };
};

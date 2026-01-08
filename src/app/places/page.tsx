"use client"

import { useEffect, useState } from "react";
import { SavedItineraryPlace } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { GetTripItinerariesUseCase } from "@/domain/usecases/itinerary/GetTripItinerariesUseCase";
import { MapContainer } from "@/presentation/components/Map/MapContainer";
import { PlaceImage } from "@/presentation/components/Place/PlaceImage";
import { PlaceDetailModal } from "@/presentation/components/Place/PlaceDetailModal";
import { JourneySelectionModal } from "@/presentation/components/Place/JourneySelectionModal";
import { useAddPlaceToJourney } from "@/presentation/hooks/useAddPlaceToJourney";

type FilterType = 'all' | 'restaurant' | 'lodging' | 'attraction';

const FILTERS: { label: string; value: FilterType }[] = [
    { label: "전체", value: "all" },
    { label: "음식점", value: "restaurant" },
    { label: "숙소", value: "lodging" },
    { label: "명소", value: "attraction" },
];

export default function PlacesPage() {
    const [likedPlaces, setLikedPlaces] = useState<SavedItineraryPlace[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<SavedItineraryPlace | null>(null);
    const [modalPlace, setModalPlace] = useState<SavedItineraryPlace | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJourneySelectionOpen, setIsJourneySelectionOpen] = useState(false);
    const [placeToAdd, setPlaceToAdd] = useState<Place | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const { 
        matchingJourneys, 
        placeCountry, 
        hasOngoingJourneys,
        findMatchingJourneys, 
        addPlaceToJourney,
        reset: resetJourneyState 
    } = useAddPlaceToJourney();

    useEffect(() => {
        const loadPlaces = async () => {
            setIsLoading(true);
            try {
                const repository = new LocalStorageItineraryRepository();
                const useCase = new GetTripItinerariesUseCase(repository);
                const itineraries = await useCase.execute();

                const allLiked: SavedItineraryPlace[] = [];
                itineraries.forEach(trip => {
                    trip.items.forEach(item => {
                        if (item.memory?.isLiked) {
                            allLiked.push(item);
                        }
                    });
                });
                setLikedPlaces(allLiked.reverse());
            } catch (error) {
                console.error("Failed to load places:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPlaces();
    }, []);

    const getPlaceCategory = (types: string[] = []): FilterType => {
        if (types.some(t => ['restaurant', 'food', 'cafe', 'bar', 'bakery'].includes(t))) {
            return 'restaurant';
        }
        if (types.some(t => ['lodging', 'hotel', 'resort'].includes(t))) {
            return 'lodging';
        }
        return 'attraction';
    };

    const getCategoryLabel = (types: string[] = []): { label: string; colorClass: string } => {
        const category = getPlaceCategory(types);
        switch (category) {
            case 'restaurant':
                return { label: "음식점", colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" };
            case 'lodging':
                return { label: "숙소", colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
            default:
                return { label: "명소", colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" };
        }
    };

    const filteredPlaces = likedPlaces.filter(place => {
        if (selectedFilter === 'all') return true;
        return getPlaceCategory(place.place.types) === selectedFilter;
    });

    const mapCenter = filteredPlaces[0]?.place.location || { lat: 35.6762, lng: 139.6503 };

    const openPlaceDetail = (place: SavedItineraryPlace) => {
        setModalPlace(place);
        setIsModalOpen(true);
    };

    const closePlaceDetail = () => {
        setIsModalOpen(false);
        setTimeout(() => setModalPlace(null), 300);
    };

    const handleUnlike = () => {
        if (modalPlace) {
            setLikedPlaces(prev => prev.filter(p => p !== modalPlace));
            closePlaceDetail();
        }
    };

    const handleAddToItinerary = async () => {
        if (!modalPlace) return;
        
        closePlaceDetail();
        setPlaceToAdd(modalPlace.place);
        await findMatchingJourneys(modalPlace.place);
        setIsJourneySelectionOpen(true);
    };

    const handleAddFromCard = async (e: React.MouseEvent, place: Place) => {
        e.stopPropagation();
        setPlaceToAdd(place);
        await findMatchingJourneys(place);
        setIsJourneySelectionOpen(true);
    };

    const handleJourneySelectionClose = () => {
        setIsJourneySelectionOpen(false);
        setPlaceToAdd(null);
        resetJourneyState();
    };

    const handleConfirmAddToJourney = async (journeyId: string, day: number) => {
        if (!placeToAdd) return;
        
        try {
            const updatedJourney = await addPlaceToJourney({
                place: placeToAdd,
                journeyId,
                day
            });
            
            handleJourneySelectionClose();
            
            const journeyTitle = updatedJourney.title || "나의 여행";
            setSuccessMessage(`'${placeToAdd.name}'이(가) '${journeyTitle}'의 ${day + 1}일차에 추가되었습니다.`);
            
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Failed to add place to journey:", error);
        }
    };

    return (
        <div className="flex flex-col h-full -m-6 md:-m-10 overflow-hidden">
            <header className="w-full px-6 py-8 md:px-10 md:py-10 shrink-0 z-10 bg-[var(--background)]/95 backdrop-blur-sm sticky top-0">
                <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                            저장된 장소
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-base">
                            좋아요를 누른 여행지 목록입니다. 지도에서 위치를 확인하고 일정에 추가해보세요.
                        </p>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setSelectedFilter(filter.value)}
                                className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-sm font-medium transition-colors ${
                                    selectedFilter === filter.value
                                        ? "bg-[var(--foreground)] text-[var(--background)] font-bold"
                                        : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--secondary)]"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-10 md:px-10">
                <div className="max-w-[1280px] mx-auto h-full">
                    <div className="flex flex-col lg:flex-row gap-6 h-full">
                        <div className="flex flex-col gap-4 flex-1 min-w-0">
                            {isLoading ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-40 bg-[var(--surface)] rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredPlaces.length === 0 ? (
                                <div className="bg-[var(--surface)] rounded-xl p-12 text-center border border-[var(--border)]">
                                    <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4">
                                        favorite_border
                                    </span>
                                    <h3 className="text-xl font-bold mb-2">저장된 장소가 없어요</h3>
                                    <p className="text-[var(--muted-foreground)]">
                                        여행 일정에서 마음에 드는 장소에 좋아요를 눌러보세요!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {filteredPlaces.map((item, index) => {
                                        const categoryInfo = getCategoryLabel(item.place.types);
                                        const isSelected = selectedPlace === item;
                                        
                                        return (
                                            <div 
                                                key={index}
                                                onClick={() => {
                                                    setSelectedPlace(item);
                                                    openPlaceDetail(item);
                                                }}
                                                className={`group flex flex-col sm:flex-row items-stretch gap-4 rounded-xl bg-[var(--surface)] p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                                                    isSelected
                                                        ? "border-[var(--primary)] shadow-md"
                                                        : "border-[var(--border)]"
                                                }`}
                                            >
                                                <div className="w-full sm:w-48 aspect-video sm:aspect-square rounded-lg shrink-0 overflow-hidden bg-[var(--secondary)]">
                                                    {item.memory?.images && item.memory.images.length > 0 ? (
                                                        <img 
                                                            src={item.memory.images[0]} 
                                                            alt={item.place.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <PlaceImage 
                                                            placeName={item.place.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex flex-col flex-1 justify-between gap-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${categoryInfo.colorClass}`}>
                                                                    {categoryInfo.label}
                                                                </span>
                                                                {item.place.rating && (
                                                                    <div className="flex items-center text-yellow-500 text-xs">
                                                                        <span className="material-symbols-outlined filled text-[16px]">star</span>
                                                                        <span className="ml-1 font-medium text-[var(--muted-foreground)]">
                                                                            {item.place.rating}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <h3 className="text-lg font-bold leading-tight">
                                                                {item.place.name}
                                                            </h3>
                                                            
                                                            <p className="text-[var(--muted-foreground)] text-sm">
                                                                {item.place.address}
                                                            </p>
                                                        </div>
                                                        
                                                        <button className="text-[var(--primary)] hover:scale-110 transition-transform">
                                                            <span className="material-symbols-outlined filled">favorite</span>
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-end pt-2">
                                                        <button 
                                                            onClick={(e) => handleAddFromCard(e, item.place)}
                                                            className="flex items-center justify-center rounded-lg h-9 px-4 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] transition-colors gap-1.5 text-sm font-bold w-full sm:w-auto"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                                            <span>일정에 추가</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    <div className="py-4 text-center">
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            모든 저장된 장소를 확인했습니다.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden lg:block w-[45%] sticky top-0 h-[calc(100vh-200px)] rounded-2xl overflow-hidden shadow-md border border-[var(--border)]">
                            <div className="relative w-full h-full">
                                <MapContainer
                                    onMapLoad={setMap}
                                    center={selectedPlace?.place.location || mapCenter}
                                    zoom={selectedPlace ? 15 : 10}
                                />
                                
                                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                                    <button 
                                        onClick={() => map?.setZoom((map.getZoom() || 10) + 1)}
                                        className="w-10 h-10 bg-[var(--surface)] rounded-lg shadow-lg flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                    <button 
                                        onClick={() => map?.setZoom((map.getZoom() || 10) - 1)}
                                        className="w-10 h-10 bg-[var(--surface)] rounded-lg shadow-lg flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                                    >
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (navigator.geolocation && map) {
                                                navigator.geolocation.getCurrentPosition((position) => {
                                                    map.setCenter({
                                                        lat: position.coords.latitude,
                                                        lng: position.coords.longitude
                                                    });
                                                    map.setZoom(14);
                                                });
                                            }
                                        }}
                                        className="w-10 h-10 bg-[var(--surface)] rounded-lg shadow-lg flex items-center justify-center text-[var(--primary)] hover:bg-[var(--secondary)] transition-colors mt-2"
                                    >
                                        <span className="material-symbols-outlined filled">my_location</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PlaceDetailModal
                place={modalPlace}
                isOpen={isModalOpen}
                onClose={closePlaceDetail}
                onUnlike={handleUnlike}
                onAddToItinerary={handleAddToItinerary}
            />

            {placeToAdd && (
                <JourneySelectionModal
                    isOpen={isJourneySelectionOpen}
                    onClose={handleJourneySelectionClose}
                    place={placeToAdd}
                    matchingJourneys={matchingJourneys}
                    placeCountry={placeCountry}
                    hasOngoingJourneys={hasOngoingJourneys}
                    onConfirm={handleConfirmAddToJourney}
                />
            )}

            {successMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}
        </div>
    );
}

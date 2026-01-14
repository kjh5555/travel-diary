"use client"

import React, { useEffect, useState } from "react";
import { SavedItinerary } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";
import { useJourneyPlanner } from "@/presentation/hooks/useJourneyPlanner";

import { JourneyMapPanel } from "./JourneyMapPanel";
import { DateSelector } from "./DateSelector";
import { DayTabs } from "./DayTabs";
import { PlaceSearchSection } from "./PlaceSearchSection";
import { DailyScheduleList } from "./DailyScheduleList";
import { RouteInfoCard } from "./RouteInfoCard";
import { ShareJourneyModal } from "@/presentation/components/Share/ShareJourneyModal";

interface NewJourneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: SavedItinerary | null;
    readOnly?: boolean;
}

export const NewJourneyModal = ({ isOpen, onClose, initialData, readOnly = false }: NewJourneyModalProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [searchUseCase, setSearchUseCase] = useState<SearchPlacesUseCase | null>(null);
    const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | undefined>(undefined);

    const [focusedPlace, setFocusedPlace] = useState<Place | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const { state, actions } = useJourneyPlanner(initialData, onClose);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            setFocusedPlace(null); // Reset focus when closing
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!map) return;
        const placeRepo = new GooglePlaceRepository(map);
        setSearchUseCase(new SearchPlacesUseCase(placeRepo));
    }, [map]);

    useEffect(() => {
        if (isOpen && !initialData && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error(error)
            );
        } else if (initialData) {
            const firstLocation = initialData.arrivalAirport?.location 
                || initialData.items.find(i => !i.isDayTransition)?.place.location;
            if (firstLocation) {
                setMapCenter(firstLocation);
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (state.currentDay > 0 && state.prevDayLastPlace) {
            setMapCenter(state.prevDayLastPlace.location);
        } else if (state.currentDay === 0 && state.selectedAirport) {
            setMapCenter(state.selectedAirport.place.location);
        }
    }, [state.currentDay, state.prevDayLastPlace, state.selectedAirport]);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleAirportSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !searchUseCase) return;
        setIsSearching(true);
        try {
            const res = await searchUseCase.execute({ query: searchQuery, airportsOnly: true });
            setSearchResults(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-6xl h-[85vh] bg-[var(--surface)] rounded-2xl shadow-2xl transform transition-all duration-300 flex overflow-hidden border border-[var(--border)] ${isOpen ? "scale-100" : "scale-95"}`}>
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    {initialData && (
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="w-10 h-10 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                            title="여정 공유"
                        >
                            <span className="material-symbols-outlined">group_add</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <JourneyMapPanel
                    currentDay={state.currentDay}
                    travelType={state.travelType}
                    selectedAirport={state.selectedAirport}
                    departureAirport={state.departureAirport}
                    prevDayLastPlace={state.prevDayLastPlace}
                    dailyWishlists={state.dailyWishlists}
                    daysCount={state.daysCount}
                    onMapLoad={setMap}
                    mapCenter={mapCenter}
                    focusedPlace={focusedPlace}
                />

                <div className="w-1/2 h-full flex flex-col relative bg-[var(--background)]">
                    <div className="p-6 pb-4 shrink-0 border-b border-[var(--border)]">
                        {state.viewMode === 'planning' ? (
                            <div className="mb-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={state.title}
                                        onChange={(e) => state.setTitle(e.target.value)}
                                        placeholder="여행 이름을 입력하세요"
                                        className="text-2xl font-black bg-transparent focus:outline-none border-b-2 border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] transition-colors w-full"
                                    />
                                    <span className="material-symbols-outlined text-[var(--muted-foreground)]">edit</span>
                                </div>
                                {!state.title.trim() && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        여행 이름은 필수입니다
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    type="text"
                                    value={state.title}
                                    onChange={(e) => state.setTitle(e.target.value)}
                                    placeholder="여행 제목"
                                    className="text-2xl font-black bg-transparent focus:outline-none border-b-2 border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] transition-colors"
                                />
                                <span className="material-symbols-outlined text-[var(--muted-foreground)]">edit</span>
                            </div>
                        )}
                        <p className="text-sm text-[var(--muted-foreground)]">일정을 계획하고 장소를 추가하세요</p>

                        {state.viewMode === 'planning' && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => state.setTravelType('domestic')}
                                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                        state.travelType === 'domestic'
                                            ? 'bg-[var(--primary)] text-white shadow-md'
                                            : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">home</span>
                                    국내여행
                                </button>
                                <button
                                    type="button"
                                    onClick={() => state.setTravelType('international')}
                                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                        state.travelType === 'international'
                                            ? 'bg-[var(--primary)] text-white shadow-md'
                                            : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">flight</span>
                                    해외여행
                                </button>
                            </div>
                        )}

                        <div className="mt-4">
                            <DateSelector
                                startDate={state.startDate}
                                endDate={state.endDate}
                                isEditingDate={state.isEditingDate}
                                onStartDateChange={state.setStartDate}
                                onEndDateChange={state.setEndDate}
                                onToggleEdit={() => state.setIsEditingDate(true)}
                                onFinishEdit={() => state.setIsEditingDate(false)}
                                required={state.viewMode === 'planning'}
                            />
                        </div>
                    </div>

                    {state.viewMode === 'planning' ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <DayTabs
                                daysCount={state.daysCount}
                                currentDay={state.currentDay}
                                onDayChange={state.setCurrentDay}
                            />

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {state.currentDay === 0 && state.travelType === 'international' && (
                                    <div className="p-5 border border-[var(--border)] rounded-xl bg-[var(--surface)] relative z-20">
                                        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[var(--primary)]">flight_takeoff</span>
                                            도착 공항
                                        </h3>
                                        <form onSubmit={handleAirportSearch} className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="공항 검색..."
                                                className="w-full h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-4 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full"></div>
                                                </div>
                                            )}
                                            {searchResults.length > 0 && (
                                                <ul className="absolute top-13 left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                                    {searchResults.map(place => (
                                                        <li
                                                            key={place.id}
                                                            onClick={() => {
                                                                actions.setSelectedAirport({ place });
                                                                setSearchResults([]);
                                                                setSearchQuery(place.name);
                                                                setMapCenter(place.location);
                                                            }}
                                                            className="px-4 py-3 hover:bg-[var(--secondary)] cursor-pointer border-b border-[var(--border)] last:border-0"
                                                        >
                                                            <div className="font-bold">{place.name}</div>
                                                            <div className="text-xs text-[var(--muted-foreground)]">{place.address}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </form>
                                    </div>
                                )}

                                <PlaceSearchSection
                                    searchUseCase={searchUseCase}
                                    currentDay={state.currentDay}
                                    searchCenterLocation={mapCenter}
                                    onAddPlace={(place) => actions.addPlaceToWishlist(place)}
                                />

                                <DailyScheduleList
                                    currentDay={state.currentDay}
                                    daysCount={state.daysCount}
                                    travelType={state.travelType}
                                    selectedAirport={state.selectedAirport}
                                    departureAirport={state.departureAirport}
                                    prevDayLastPlace={state.prevDayLastPlace}
                                    currentWishlist={state.currentWishlist}
                                    onRemovePlace={actions.removePlaceFromWishlist}
                                    onDepartureAirportSelect={(place) => actions.setDepartureAirport({ place })}
                                    onPlaceClick={(place) => {
                                        setMapCenter(place.location);
                                        setFocusedPlace(place);
                                    }}
                                    searchUseCase={searchUseCase}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6">
                            {state.itineraryItems.map((item, index) => {
                                const prevItem = index > 0 ? state.itineraryItems[index - 1] : null;
                                const showDayHeader = !prevItem || prevItem.day !== item.day;

                                return (
                                    <div key={index}>
                                        {showDayHeader && (
                                            <div className="mb-6 mt-6 first:mt-0">
                                                <div className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                                                    <span>{item.day + 1}일차</span>
                                                    {state.startDate && (
                                                        <span className="opacity-80">
                                                            {new Date(new Date(state.startDate).getTime() + item.day * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className={`relative pl-8 border-l-2 border-[var(--primary)] ${index === state.itineraryItems.length - 1 ? 'border-transparent' : ''} pb-8 ml-2`}>
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--primary)] border-4 border-[var(--background)] z-10"></div>
                                            <div
                                                className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => {
                                                    setMapCenter(item.place.location);
                                                    setFocusedPlace(item.place);
                                                }}
                                            >
                                                <h3 className="font-bold text-base">{item.place.name}</h3>
                                                <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {item.place.address}
                                                </p>
                                            </div>

                                            {item.isDayTransition && (
                                                <div className="ml-4 mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-sm flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">bedtime</span>
                                                    <div className="font-bold text-purple-700 dark:text-purple-300">숙박</div>
                                                </div>
                                            )}

                                            {!item.isDayTransition && item.routeToNext && (
                                                <RouteInfoCard route={item.routeToNext} />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="p-4 shrink-0 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end gap-3">
                        {readOnly ? (
                            <button onClick={onClose} className="px-5 py-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors">
                                닫기
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={state.viewMode === 'planning' ? onClose : () => state.setViewMode('planning')}
                                    className="px-5 py-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
                                >
                                    {state.viewMode === 'planning' ? '취소' : '편집으로 돌아가기'}
                                </button>
                                <div className="flex items-center gap-3">
                                    {state.viewMode === 'planning' && !state.isFormValid && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            여행 이름과 날짜를 입력해주세요
                                        </p>
                                    )}
                                    <button
                                        onClick={state.viewMode === 'planning' ? actions.handleCalculateRoutes : actions.handleSaveItinerary}
                                        disabled={state.calculatingRoutes || (state.viewMode === 'planning' && !state.isFormValid)}
                                        className="px-6 py-2.5 bg-[var(--primary)] text-white font-bold rounded-lg shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {state.calculatingRoutes ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                <span>계산 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">{state.viewMode === 'planning' ? 'route' : 'save'}</span>
                                                <span>{state.viewMode === 'planning' ? '경로 계산' : '저장하기'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {initialData && (
                <ShareJourneyModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    itineraryId={initialData.id}
                    itineraryTitle={initialData.title}
                />
            )}
        </div>
    );
};

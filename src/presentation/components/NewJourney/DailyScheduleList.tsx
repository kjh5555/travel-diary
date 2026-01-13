import React from 'react';
import { Place } from "@/domain/types/place";
import { TravelType } from "@/domain/types/itinerary";
import { AirportItem, WishlistItem } from "@/presentation/hooks/useJourneyPlanner";
import { SearchPlacesUseCase } from '@/domain/usecases/place/SearchPlacesUseCase';

interface DailyScheduleListProps {
    currentDay: number;
    daysCount: number;
    travelType: TravelType;
    selectedAirport: AirportItem | null;
    departureAirport: AirportItem | null;
    prevDayLastPlace: Place | null;
    currentWishlist: WishlistItem[];
    onRemovePlace: (id: string) => void;
    onDepartureAirportSelect: (place: Place) => void;
    onPlaceClick: (place: Place) => void;
    searchUseCase: SearchPlacesUseCase | null;
}

export const DailyScheduleList: React.FC<DailyScheduleListProps> = ({
    currentDay,
    daysCount,
    travelType,
    selectedAirport,
    departureAirport,
    prevDayLastPlace,
    currentWishlist,
    onRemovePlace,
    onDepartureAirportSelect,
    onPlaceClick,
    searchUseCase
}) => {
    const [depQuery, setDepQuery] = React.useState("");
    const [depResults, setDepResults] = React.useState<Place[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const depRef = React.useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (depRef.current && !depRef.current.contains(event.target as Node)) {
                setDepResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDepSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depQuery.trim() || !searchUseCase) return;
        setIsLoading(true);
        try {
            const res = await searchUseCase.execute({ query: depQuery, airportsOnly: true });
            setDepResults(res);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative pl-6 border-l-2 border-[var(--border)] space-y-4 pb-8 mt-4">
            {currentDay === 0 && travelType === 'international' && selectedAirport && (
                <div className="relative group">
                    <div className="absolute -left-[29px] top-3 w-4 h-4 rounded-full border-4 border-[var(--background)] z-10 bg-red-500"></div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-red-500">flight_land</span>
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">도착</span>
                                </div>
                                <h4 className="font-bold">{selectedAirport.place.name}</h4>
                                <p className="text-xs text-[var(--muted-foreground)]">{selectedAirport.place.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentDay > 0 && prevDayLastPlace && (
                <div className="relative group">
                    <div className="absolute -left-[29px] top-3 w-4 h-4 rounded-full border-4 border-[var(--background)] z-10 bg-purple-500"></div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800 opacity-70">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-purple-500">hotel</span>
                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">{currentDay}일차에서 이어짐</span>
                                </div>
                                <h4 className="font-bold">{prevDayLastPlace.name}</h4>
                                <p className="text-xs text-[var(--muted-foreground)]">{prevDayLastPlace.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentWishlist.length === 0 && !selectedAirport && !prevDayLastPlace && (
                <div className="p-6 text-center text-[var(--muted-foreground)] bg-[var(--secondary)] rounded-xl border border-dashed border-[var(--border)]">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">add_location</span>
                    <p className="text-sm">{currentDay + 1}일차 일정이 비어있습니다</p>
                    <p className="text-xs mt-1">위에서 장소를 검색해 추가하세요</p>
                </div>
            )}

            {currentWishlist.map((item, idx) => (
                <div key={item.id} className="relative group">
                    <div className={`absolute -left-[29px] top-3 w-4 h-4 rounded-full border-4 border-[var(--background)] z-10 bg-[var(--primary)]`}></div>
                    <div
                        className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onPlaceClick(item.data)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate">{item.data.name}</h4>
                                <p className="text-xs text-[var(--muted-foreground)] truncate">{item.data.address}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemovePlace(item.id);
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {currentDay === daysCount - 1 && travelType === 'international' && (
                <div className="p-5 border border-[var(--border)] rounded-xl bg-[var(--surface)] relative z-20 mt-6">
                    <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">flight_takeoff</span>
                        출발 공항
                    </h3>
                    <form onSubmit={handleDepSearch} className="relative" ref={depRef}>
                        <input
                            type="text"
                            value={depQuery}
                            onChange={(e) => setDepQuery(e.target.value)}
                            placeholder="출발 공항 검색..."
                            className="w-full h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-4 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                            disabled={isLoading}
                        />
                        {isLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full"></div>
                            </div>
                        )}
                        {depResults.length > 0 && (
                            <ul className="absolute top-13 left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                {depResults.map(place => (
                                    <li
                                        key={place.id}
                                        onClick={() => {
                                            onDepartureAirportSelect(place);
                                            setDepQuery(place.name);
                                            setDepResults([]);
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
                    {departureAirport && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400">flight_takeoff</span>
                            </div>
                            <div>
                                <div className="font-bold">{departureAirport.place.name}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">출발 공항</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

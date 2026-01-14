"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SavedItinerary, SavedItineraryWithShare } from "@/domain/types/itinerary";
import { groupItinerariesByStatus, getItineraryStatus } from "@/domain/utils/dateUtils";
import { NewJourneyModal } from "@/presentation/components/NewJourney/NewJourneyModal";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";
import { TripImageSlideshow } from "@/presentation/components/common/TripImageSlideshow";

type TabType = 'all' | 'upcoming' | 'ongoing' | 'past';

const TABS: { label: string; value: TabType }[] = [
    { label: "전체", value: "all" },
    { label: "예정됨", value: "upcoming" },
    { label: "진행 중", value: "ongoing" },
    { label: "완료됨", value: "past" },
];

export default function JourneysPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [itineraries, setItineraries] = useState<SavedItineraryWithShare[]>([]);
    const [selectedTab, setSelectedTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState<SavedItineraryWithShare | null>(null);

    const loadItineraries = async () => {
        if (!session?.user?.id) {
            setItineraries([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const [myResponse, sharedResponse] = await Promise.all([
                fetch('/api/itineraries'),
                fetch('/api/itineraries/shared')
            ]);

            const myItineraries: SavedItineraryWithShare[] = myResponse.ok
                ? (await myResponse.json()).map((it: SavedItinerary) => ({ ...it, shareInfo: undefined }))
                : [];

            const sharedItineraries: SavedItineraryWithShare[] = sharedResponse.ok
                ? await sharedResponse.json()
                : [];

            const allItineraries = [...myItineraries, ...sharedItineraries];
            allItineraries.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setItineraries(allItineraries);
        } catch (error) {
            console.error("Failed to load itineraries:", error);
            setItineraries([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItineraries();
    }, [session]);

    const { ongoing, upcoming, past } = groupItinerariesByStatus(itineraries);

    const getFilteredItineraries = (): SavedItineraryWithShare[] => {
        let filtered: SavedItineraryWithShare[];

        switch (selectedTab) {
            case 'all':
                filtered = itineraries;
                break;
            case 'upcoming':
                filtered = upcoming;
                break;
            case 'ongoing':
                filtered = ongoing;
                break;
            case 'past':
                filtered = past;
                break;
            default:
                filtered = itineraries;
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(it =>
                it.title?.toLowerCase().includes(query) ||
                it.items.some(item => item.place.name.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const handleOpenItinerary = (itinerary: SavedItineraryWithShare) => {
        const status = getItineraryStatus(itinerary.startDate, itinerary.endDate);
        if (status === 'past' || status === 'ongoing') {
            router.push(`/journeys/${itinerary.id}`);
        } else {
            setSelectedItinerary(itinerary);
            setIsModalOpen(true);
        }
    };

    const filteredItineraries = getFilteredItineraries();

    return (
        <>
            <NewJourneyModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItinerary(null);
                    loadItineraries();
                }}
                initialData={selectedItinerary}
            />

            <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            나의 여행
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-base">
                            다가오는 모험과 지난 추억을 관리하세요.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors text-white text-sm font-bold shadow-md shadow-[var(--primary)]/20"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                        <span>새 여행</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mt-2">
                    <div className="flex border-b border-[var(--border)] w-full md:w-auto overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setSelectedTab(tab.value)}
                                className={`flex flex-col items-center justify-center border-b-[3px] pb-[10px] px-4 min-w-[80px] transition-colors ${selectedTab === tab.value
                                    ? "border-b-[var(--primary)] text-[var(--foreground)]"
                                    : "border-b-transparent text-[var(--muted-foreground)] hover:border-b-gray-300"
                                    }`}
                            >
                                <p className={`text-sm tracking-[0.015em] whitespace-nowrap ${selectedTab === tab.value ? "font-bold" : "font-bold"
                                    }`}>
                                    {tab.label}
                                </p>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[var(--muted-foreground)]">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="도시 또는 날짜 검색..."
                            className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-none bg-[var(--secondary)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)]/50 text-sm font-medium transition-all"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 mt-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-[var(--surface)] rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredItineraries.length === 0 ? (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl border-2 border-dashed border-[var(--border)] bg-transparent flex flex-col items-center justify-center p-8 gap-3 cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all group"
                    >
                        <div className="size-12 rounded-full bg-[var(--secondary)] flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                            <span className="material-symbols-outlined text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" style={{ fontSize: '24px' }}>
                                add_location_alt
                            </span>
                        </div>
                        <p className="text-[var(--muted-foreground)] font-medium">
                            {searchQuery ? '검색 결과가 없습니다' : '새로운 여정을 시작해보세요'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 mt-2">
                        {filteredItineraries.map((itinerary) => (
                            <JourneyCard
                                key={itinerary.id}
                                itinerary={itinerary}
                                onClick={() => handleOpenItinerary(itinerary)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function JourneyCard({ itinerary, onClick }: { itinerary: SavedItineraryWithShare; onClick: () => void }) {
    const status = getItineraryStatus(itinerary.startDate, itinerary.endDate);
    const startDate = new Date(itinerary.startDate);
    const endDate = new Date(itinerary.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysSince = Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

    const getStatusBadge = () => {
        switch (status) {
            case 'ongoing':
                return {
                    color: "bg-green-100 text-green-700 border-green-200",
                    darkColor: "dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                    stripColor: "bg-green-500",
                    text: "진행 중",
                    timeText: "D-Day",
                    icon: "calendar_today"
                };
            case 'upcoming':
                return {
                    color: "bg-sky-100 text-sky-700 border-sky-200",
                    darkColor: "dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
                    stripColor: "bg-[var(--primary)]",
                    text: "예정됨",
                    timeText: `D-${daysUntil}`,
                    icon: "event"
                };
            case 'past':
                return {
                    color: "bg-gray-100 text-gray-600 border-gray-200",
                    darkColor: "dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
                    stripColor: "bg-gray-300 dark:bg-gray-600",
                    text: "완료됨",
                    timeText: daysSince > 365 ? `${Math.floor(daysSince / 365)}년 전` : `${daysSince}일 전`,
                    icon: "check_circle"
                };
        }
    };

    const badge = getStatusBadge();
    const firstPlace = itinerary.items.find(i => !i.isDayTransition)?.place;
    const locationName = firstPlace?.address?.split(',').pop()?.trim() || "여행지";

    const formatDateRange = () => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return `${startDate.toLocaleDateString('ko-KR', options).replace(/\. /g, '. ')} - ${endDate.toLocaleDateString('ko-KR', options).replace(/\./g, '. ').slice(6)}`;
    };

    return (
        <div
            onClick={onClick}
            className={`group relative flex flex-col md:flex-row items-stretch rounded-xl bg-[var(--surface)] shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent dark:border-gray-800 overflow-hidden cursor-pointer ${status === 'past' ? 'opacity-90 hover:opacity-100' : ''
                }`}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${badge.stripColor} z-10`} />

            <div
                className={`w-full md:w-64 h-48 md:h-auto bg-center bg-no-repeat bg-cover relative ${status === 'past' ? 'grayscale group-hover:grayscale-0 transition-all duration-500' : ''
                    }`}
            >
                <TripImageSlideshow
                    itinerary={itinerary}
                    className="absolute inset-0 w-full h-full"
                    interval={5000}
                    includeMemoryPhotos={status === 'past'}
                />
                <div className="absolute top-3 left-3 md:hidden flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.color} border shadow-sm`}>
                        {badge.text}
                    </span>
                    {itinerary.shareInfo?.isShared && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>group</span>
                            공유
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col justify-center gap-2 p-5 flex-1">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.color} ${badge.darkColor} border`}>
                                {badge.text}
                            </span>
                            {itinerary.shareInfo?.isShared && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>group</span>
                                    {itinerary.shareInfo.sharedBy?.name || '친구'}님이 공유
                                </span>
                            )}
                            <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{badge.icon}</span>
                                {badge.timeText}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight">
                            {itinerary.title || "나의 여행"}
                        </h3>
                        <p className="text-[var(--muted-foreground)] text-sm font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                            {locationName}
                        </p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 text-[var(--muted-foreground)] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-700 my-2" />

                <div className="flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-bold">일정</span>
                        <p className="text-sm font-semibold">{formatDateRange()}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className={`flex items-center justify-center rounded-lg h-9 px-4 text-sm font-bold transition-colors ${status === 'ongoing'
                            ? "bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)]"
                            : status === 'upcoming'
                                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 hover:shadow-lg"
                                : "bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        {status === 'ongoing' ? '상세 보기' : status === 'upcoming' ? '일정 관리' : '기록 보기'}
                    </button>
                </div>
            </div>
        </div>
    );
}

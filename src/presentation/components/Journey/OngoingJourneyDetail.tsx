"use client";

import { useState, useRef, useEffect } from "react";
import { SavedItinerary, PlaceMemory, SavedItineraryPlace } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import { MapContainer } from "../Map/MapContainer";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { ImageCropperModal } from "@/presentation/components/common/ImageCropperModal";
import { GooglePlaceRepository } from "@/data/repositories/GooglePlaceRepository";
import { SearchPlacesUseCase } from "@/domain/usecases/place/SearchPlacesUseCase";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";
import { ShareJourneyModal } from "@/presentation/components/Share/ShareJourneyModal";
import { TripCommentsSection } from "@/presentation/components/Share/TripCommentsSection";
import { SharedPhotosGallery } from "@/presentation/components/Share/SharedPhotosGallery";

interface OngoingJourneyDetailProps {
    itinerary: SavedItinerary;
    onBack: () => void;
    onUpdateMemory: (placeIndex: number, memory: PlaceMemory) => void;
    onUpdateCoverImage: (coverImage: string, thumbnail?: string) => void;
    onUpdateItinerary: (updatedItinerary: SavedItinerary) => void;
    currentUserId?: string;
}

export const OngoingJourneyDetail = ({
    itinerary,
    onBack,
    onUpdateMemory,
    onUpdateCoverImage,
    onUpdateItinerary,
    currentUserId
}: OngoingJourneyDetailProps) => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);
    const [focusedPlace, setFocusedPlace] = useState<Place | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempOriginalImage, setTempOriginalImage] = useState<string | null>(null);
    const [cropStep, setCropStep] = useState<'header' | 'thumbnail'>('header');
    const [tempHeaderImage, setTempHeaderImage] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [candidatePlace, setCandidatePlace] = useState<Place | null>(null);
    const [searchUseCase, setSearchUseCase] = useState<SearchPlacesUseCase | null>(null);

    const markersRef = useRef<google.maps.Marker[]>([]);
    const polylinesRef = useRef<google.maps.Polyline[]>([]);
    const searchDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!map) return;

        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        polylinesRef.current.forEach(p => p.setMap(null));
        polylinesRef.current = [];

        const addMarker = (place: Place, color: string, label?: string, zIndex: number = 100) => {
            const icons: Record<string, string> = {
                red: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                blue: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                green: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                purple: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
                yellow: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            };
            const marker = new google.maps.Marker({
                position: place.location,
                map,
                title: place.name,
                icon: icons[color] || icons.blue,
                label: label ? { text: label, color: "#fff", fontWeight: "bold", fontSize: "12px" } : undefined,
                zIndex
            });
            markersRef.current.push(marker);
        };

        const currentDayItems = itinerary.items.filter(item => item.day === selectedDay && !item.isDayTransition);
        const pathCoordinates: google.maps.LatLngLiteral[] = [];

        currentDayItems.forEach((item, index) => {
            addMarker(item.place, "blue", String(index + 1));
            pathCoordinates.push(item.place.location);
        });

        if (pathCoordinates.length > 1) {
            const polyline = new google.maps.Polyline({
                path: pathCoordinates,
                geodesic: true,
                strokeColor: "#3b82f6",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map
            });
            polylinesRef.current.push(polyline);
        }

        if (focusedPlace) {
            addMarker(focusedPlace, "yellow", undefined, 1000);
            map.panTo(focusedPlace.location);

            const targetZoom = 15;
            const currentZoom = map.getZoom() || 12;

            if (currentZoom !== targetZoom) {
                const animateZoom = () => {
                    const current = map.getZoom() || 12;
                    if (current === targetZoom) return;

                    const step = current < targetZoom ? 1 : -1;
                    const next = current + step;

                    map.setZoom(next);
                    setTimeout(animateZoom, 100);
                };
                animateZoom();
            }
        } else if (markersRef.current.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markersRef.current.forEach(m => {
                const pos = m.getPosition();
                if (pos) bounds.extend(pos);
            });
            map.fitBounds(bounds);
        }

    }, [map, selectedDay, focusedPlace, itinerary]);

    useEffect(() => {
        if (map && !searchUseCase) {
            const repository = new GooglePlaceRepository(map);
            setSearchUseCase(new SearchPlacesUseCase(repository));
        }
    }, [map, searchUseCase]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startDate = new Date(itinerary.startDate);
    const endDate = new Date(itinerary.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days = Array.from({ length: totalDays }, (_, i) => i);

    const dayItems = itinerary.items.filter(item => item.day === selectedDay);
    const totalPhotos = itinerary.items.reduce((acc, item) => acc + (item.memory?.images?.length || 0), 0);

    const initialCenter = itinerary.arrivalAirport?.location ||
        itinerary.items.find(i => !i.isDayTransition)?.place.location;

    const formatDayDate = (dayIndex: number) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayIndex);
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    const formatTime = (index: number) => {
        const baseHour = 10 + Math.floor(index * 1.5);
        const hour = baseHour % 12 || 12;
        const minute = (index % 2) * 30;
        const ampm = baseHour < 12 ? "오전" : "오후";
        return { time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`, ampm };
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, placeIndex: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const currentMemory = itinerary.items[placeIndex].memory || {};
                const newImages = [...(currentMemory.images || []), base64String];
                onUpdateMemory(placeIndex, {
                    ...currentMemory,
                    images: newImages,
                    timestamp: new Date().toISOString(),
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleLike = (placeIndex: number) => {
        const currentMemory = itinerary.items[placeIndex].memory || {};
        onUpdateMemory(placeIndex, {
            ...currentMemory,
            isLiked: !currentMemory.isLiked,
            timestamp: new Date().toISOString(),
        });
    };

    const handleTextChange = (text: string, placeIndex: number) => {
        const currentMemory = itinerary.items[placeIndex].memory || {};
        onUpdateMemory(placeIndex, {
            ...currentMemory,
            text,
            timestamp: new Date().toISOString(),
        });
    };

    const openGallery = (images: string[], startIndex: number) => {
        setGalleryImages(images);
        setGalleryStartIndex(startIndex);
    };

    const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempOriginalImage(reader.result as string);
                setCropStep('header');
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCoverCropComplete = (croppedImage: string) => {
        if (cropStep === 'header') {
            setTempHeaderImage(croppedImage);
            setCropStep('thumbnail');
        } else {
            if (tempHeaderImage) {
                onUpdateCoverImage(tempHeaderImage, croppedImage);
            }
            setIsCropperOpen(false);
            setTempOriginalImage(null);
            setTempHeaderImage(null);
            setCropStep('header');
        }
    };

    const handleMoveUp = (dayItemIndex: number) => {
        if (dayItemIndex === 0) return;

        const currentDayItems = itinerary.items.filter(item => item.day === selectedDay);
        const globalIndexA = itinerary.items.findIndex(i => i === currentDayItems[dayItemIndex]);
        const globalIndexB = itinerary.items.findIndex(i => i === currentDayItems[dayItemIndex - 1]);

        const newItems = [...itinerary.items];
        [newItems[globalIndexA], newItems[globalIndexB]] = [newItems[globalIndexB], newItems[globalIndexA]];

        onUpdateItinerary({
            ...itinerary,
            items: newItems
        });
    };

    const handleMoveDown = (dayItemIndex: number) => {
        const currentDayItems = itinerary.items.filter(item => item.day === selectedDay);
        if (dayItemIndex >= currentDayItems.length - 1) return;

        const globalIndexA = itinerary.items.findIndex(i => i === currentDayItems[dayItemIndex]);
        const globalIndexB = itinerary.items.findIndex(i => i === currentDayItems[dayItemIndex + 1]);

        const newItems = [...itinerary.items];
        [newItems[globalIndexA], newItems[globalIndexB]] = [newItems[globalIndexB], newItems[globalIndexA]];

        onUpdateItinerary({
            ...itinerary,
            items: newItems
        });
    };

    const handleDeletePlace = (dayItemIndex: number) => {
        const currentDayItems = itinerary.items.filter(item => item.day === selectedDay);
        const globalIndex = itinerary.items.findIndex(i => i === currentDayItems[dayItemIndex]);

        const newItems = itinerary.items.filter((_, idx) => idx !== globalIndex);

        onUpdateItinerary({
            ...itinerary,
            items: newItems
        });
    };

    const handleChangeDayForPlace = (dayItemIndex: number, newDay: number) => {
        const currentDayItems = itinerary.items.filter(item => item.day === selectedDay);
        const globalIndex = itinerary.items.findIndex(i => i === currentDayItems[dayItemIndex]);

        const newItems = [...itinerary.items];
        newItems[globalIndex] = {
            ...newItems[globalIndex],
            day: newDay
        };

        onUpdateItinerary({
            ...itinerary,
            items: newItems
        });
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim() || !searchUseCase) {
            setSearchResults([]);
            return;
        }

        try {
            const searchCenter = dayItems[0]?.place.location || initialCenter;
            const results = await searchUseCase.execute({
                query,
                location: searchCenter
            });
            setSearchResults(results);
        } catch (e) {
            console.error("Search failed:", e);
            setSearchResults([]);
        }
    };

    const handleAddPlace = (place: Place) => {
        const newItem: SavedItineraryPlace = {
            place,
            day: selectedDay,
            isDayTransition: false
        };

        const newItems = [...itinerary.items, newItem];

        onUpdateItinerary({
            ...itinerary,
            items: newItems
        });

        setCandidatePlace(null);
        setSearchQuery("");
        setSearchResults([]);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripStart = new Date(itinerary.startDate);
    tripStart.setHours(0, 0, 0, 0);
    const currentTripDay = Math.floor((today.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - currentTripDay - 1;

    return (
        <>
            {galleryImages && (
                <PhotoGalleryModal
                    images={galleryImages}
                    initialIndex={galleryStartIndex}
                    onClose={() => setGalleryImages(null)}
                />
            )}

            {isCropperOpen && tempOriginalImage && (
                <ImageCropperModal
                    isOpen={isCropperOpen}
                    image={tempOriginalImage}
                    onClose={() => {
                        setIsCropperOpen(false);
                        setTempOriginalImage(null);
                        setTempHeaderImage(null);
                        setCropStep('header');
                    }}
                    onCropComplete={handleCoverCropComplete}
                    aspectRatio={cropStep === 'header' ? 16 / 5 : 4 / 3}
                    title={cropStep === 'header' ? "배경 이미지 자르기" : "썸네일 자르기"}
                />
            )}

            <ShareJourneyModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                itineraryId={itinerary.id}
                itineraryTitle={itinerary.title}
            />

            <div className="flex h-full w-full -m-3 md:-m-10">
                <main className="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth relative">
                    <div className="w-full h-64 md:h-80 bg-[var(--secondary)] relative shrink-0 group overflow-hidden">
                        {itinerary.coverImage ? (
                            <img
                                src={itinerary.coverImage}
                                alt="Cover"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <GooglePlacePhoto
                                query={itinerary.items.find(i => !i.isDayTransition)?.place.name || itinerary.title || "travel destination"}
                                location={itinerary.items.find(i => !i.isDayTransition)?.place.location}
                                className="absolute inset-0 w-full h-full"
                                maxWidth={1200}
                                maxHeight={400}
                                fallback={
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/40 to-green-600/20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white/30 text-9xl">flight_takeoff</span>
                                        </div>
                                    </>
                                }
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent opacity-90" />

                        <label className="absolute bottom-4 right-4 z-30 cursor-pointer bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            <span className="text-sm font-bold">배경 변경</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverImageSelect}
                            />
                        </label>
                    </div>

                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        진행 중
                                    </span>
                                    <span className="px-2 py-1 rounded bg-[var(--secondary)] text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wide">
                                        {daysRemaining > 0 ? `D-${daysRemaining}` : '마지막 날'}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black leading-tight">
                                    {itinerary.title || "나의 여행"}
                                </h1>
                                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mt-1">
                                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                                    <span className="text-base font-medium">
                                        {startDate.toLocaleDateString("ko-KR")} - {endDate.toLocaleDateString("ko-KR")}
                                    </span>
                                    <span className="mx-2 opacity-50">•</span>
                                    <span className="material-symbols-outlined text-lg">photo_library</span>
                                    <span className="text-base font-medium">사진 {totalPhotos}장</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--secondary)] px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all border border-[var(--border)]"
                                >
                                    <span className="material-symbols-outlined text-sm">group_add</span>
                                    <span>공유</span>
                                </button>
                                <button
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all border ${isEditMode
                                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                        : "bg-[var(--surface)] hover:bg-[var(--secondary)] border-[var(--border)]"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {isEditMode ? 'check' : 'edit_calendar'}
                                    </span>
                                    <span>{isEditMode ? '편집 완료' : '일정 편집'}</span>
                                </button>
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--secondary)] px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all border border-[var(--border)]"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    <span>목록으로</span>
                                </button>
                            </div>
                        </div>

                        <div className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] mb-8 pt-2">
                            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                {days.map((day) => {
                                    const isToday = day === currentTripDay;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`pb-3 border-b-[3px] font-bold text-sm tracking-wide flex flex-col items-center min-w-[60px] transition-colors relative ${selectedDay === day
                                                ? "border-[var(--primary)] text-[var(--primary)]"
                                                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                                }`}
                                        >
                                            {isToday && (
                                                <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold">
                                                    오늘
                                                </span>
                                            )}
                                            <span className="mt-2">{day + 1}일차</span>
                                            <span className="text-xs font-normal opacity-70">{formatDayDate(day)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="mb-6 space-y-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <span className="material-symbols-outlined">info</span>
                                        <span className="font-medium">편집 모드</span>
                                    </div>
                                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                                        장소를 추가, 삭제하거나 순서를 변경할 수 있습니다. 변경사항은 자동으로 저장됩니다.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl" ref={searchDropdownRef}>
                                    <h3 className="text-base font-bold flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-[var(--primary)]">add_location</span>
                                        {selectedDay + 1}일차에 장소 추가
                                    </h3>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="장소 검색..."
                                            className="w-full h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-4 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                                        />

                                        {searchResults.length > 0 && (
                                            <ul className="absolute top-13 left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                                {searchResults.map(place => (
                                                    <li
                                                        key={place.id}
                                                        onClick={() => {
                                                            setCandidatePlace(place);
                                                            setSearchResults([]);
                                                            setSearchQuery("");
                                                        }}
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
                                        <div className="mt-4 p-4 bg-[var(--secondary)] border-2 border-[var(--primary)] rounded-xl">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="text-xs font-bold text-[var(--primary)] mb-1">선택한 장소</div>
                                                    <h4 className="font-bold text-lg">{candidatePlace.name}</h4>
                                                    <p className="text-xs text-[var(--muted-foreground)]">{candidatePlace.address}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCandidatePlace(null)}
                                                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--muted-foreground)] font-medium rounded-lg hover:bg-[var(--surface)] transition-colors"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleAddPlace(candidatePlace)}
                                                    className="flex-[2] py-2.5 bg-[var(--primary)] text-white font-bold rounded-lg shadow-md hover:bg-[var(--primary-dark)] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add</span>
                                                    <span>일정에 추가</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 flex flex-col">
                                {dayItems.length === 0 ? (
                                    <div className="bg-[var(--surface)] rounded-xl p-12 text-center border border-[var(--border)]">
                                        <span className="material-symbols-outlined text-5xl text-[var(--muted-foreground)]/50 mb-4">
                                            add_location
                                        </span>
                                        <h3 className="text-lg font-bold mb-2">이 날의 일정이 없어요</h3>
                                        <p className="text-[var(--muted-foreground)]">
                                            새로운 장소를 추가해보세요.
                                        </p>
                                    </div>
                                ) : (
                                    dayItems.map((item, index) => {
                                        const globalIndex = itinerary.items.findIndex((i) => i === item);
                                        const timeInfo = formatTime(index);
                                        const isFirst = index === 0;
                                        const hasPhotos = item.memory?.images && item.memory.images.length > 0;

                                        return (
                                            <div key={index} className="flex gap-4 sm:gap-6 group relative pb-12">
                                                {index < dayItems.length - 1 && (
                                                    <div className="absolute left-[83px] sm:left-[99px] top-8 bottom-0 w-0.5 bg-[var(--border)]" />
                                                )}

                                                <div className="w-[70px] sm:w-[80px] shrink-0 flex flex-col items-end pt-1">
                                                    <span className="font-bold text-lg">{timeInfo.time}</span>
                                                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                                                        {timeInfo.ampm}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center pt-2 relative z-10">
                                                    <div
                                                        className={`w-3.5 h-3.5 rounded-full ring-4 ring-[var(--background)] ${isFirst ? "bg-[var(--primary)]" : "bg-[var(--muted-foreground)]/30"
                                                            }`}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className={`bg-[var(--surface)] rounded-xl p-5 shadow-sm border transition-all ${isEditMode
                                                            ? "border-amber-300 dark:border-amber-700"
                                                            : "border-[var(--border)] hover:shadow-md cursor-pointer"
                                                            }`}
                                                        onClick={() => !isEditMode && setFocusedPlace(item.place)}
                                                    >
                                                        {isEditMode && (
                                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border)]">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleMoveUp(index)}
                                                                        disabled={index === 0}
                                                                        className="p-1.5 rounded-lg hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                                        title="위로 이동"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleMoveDown(index)}
                                                                        disabled={index === dayItems.length - 1}
                                                                        className="p-1.5 rounded-lg hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                                        title="아래로 이동"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">arrow_downward</span>
                                                                    </button>
                                                                    <div className="h-4 w-px bg-[var(--border)] mx-1" />
                                                                    <select
                                                                        value={item.day}
                                                                        onChange={(e) => handleChangeDayForPlace(index, parseInt(e.target.value))}
                                                                        className="text-sm bg-[var(--secondary)] border-none rounded-lg px-2 py-1 font-medium"
                                                                    >
                                                                        {days.map((d) => (
                                                                            <option key={d} value={d}>
                                                                                {d + 1}일차로 이동
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeletePlace(index)}
                                                                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                                                    title="삭제"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex flex-col">
                                                                <h3 className="text-lg font-bold leading-tight">
                                                                    {item.place.name}
                                                                </h3>
                                                                <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                                                        location_on
                                                                    </span>
                                                                    {item.place.address?.split(",")[0] || "위치 정보 없음"}
                                                                </span>
                                                            </div>
                                                            {!isEditMode && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleLike(globalIndex);
                                                                    }}
                                                                    className={`p-2 rounded-full transition-colors ${item.memory?.isLiked
                                                                        ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                                                        : "text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                        }`}
                                                                >
                                                                    <span className={`material-symbols-outlined ${item.memory?.isLiked ? "filled" : ""}`}>
                                                                        favorite
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {!isEditMode && (
                                                            <div className="bg-[var(--secondary)]/50 p-4 rounded-lg">
                                                                {hasPhotos ? (
                                                                    <div className="mb-4">
                                                                        <div
                                                                            className={`grid gap-2 overflow-hidden rounded-lg ${item.memory!.images!.length === 1
                                                                                ? "grid-cols-1 h-48"
                                                                                : "grid-cols-2 h-48"
                                                                                }`}
                                                                        >
                                                                            {item.memory!.images!.slice(0, 2).map((img, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        openGallery(item.memory!.images!, i);
                                                                                    }}
                                                                                    className="bg-[var(--secondary)] h-full relative group/img cursor-pointer overflow-hidden"
                                                                                >
                                                                                    <img
                                                                                        src={img}
                                                                                        alt=""
                                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                                                                    />
                                                                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                                                                        <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                                                                            전체 화면
                                                                                        </span>
                                                                                    </div>
                                                                                    {i === 1 && item.memory!.images!.length > 2 && (
                                                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                                                                            <span className="text-white font-bold text-lg">
                                                                                                +{item.memory!.images!.length - 2}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="mt-2 flex justify-end">
                                                                            <label className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer flex items-center gap-1 transition-colors">
                                                                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                                                                                    add_photo_alternate
                                                                                </span>
                                                                                <span>사진 추가</span>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => handleImageUpload(e, globalIndex)}
                                                                                    className="hidden"
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="mb-4 relative h-100">
                                                                        <div className="rounded-lg overflow-hidden relative h-full">
                                                                            <GooglePlacePhoto
                                                                                query={item.place.name}
                                                                                location={item.place.location}
                                                                                className="absolute inset-0 w-full h-full"
                                                                                maxWidth={400}
                                                                                maxHeight={200}
                                                                                fallback={
                                                                                    <div className="w-full h-full bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)]/10 flex items-center justify-center">
                                                                                        <span className="material-symbols-outlined text-[var(--muted-foreground)]/30 text-4xl">photo_camera</span>
                                                                                    </div>
                                                                                }
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/20" />
                                                                        </div>
                                                                        <label className="absolute inset-0 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/30 transition-colors rounded-lg">
                                                                            <span className="material-symbols-outlined text-2xl mb-1 drop-shadow">add_a_photo</span>
                                                                            <span className="text-sm font-medium drop-shadow">내 사진 추가하기</span>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => handleImageUpload(e, globalIndex)}
                                                                                className="hidden"
                                                                            />
                                                                        </label>
                                                                    </div>
                                                                )}

                                                                <textarea
                                                                    placeholder="이 장소에서의 추억을 기록해보세요..."
                                                                    value={item.memory?.text || ""}
                                                                    onChange={(e) => handleTextChange(e.target.value, globalIndex)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="w-full bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:ring-0 resize-none text-sm leading-relaxed"
                                                                    rows={2}
                                                                />

                                                                {currentUserId && (
                                                                    <div onClick={(e) => e.stopPropagation()}>
                                                                        <SharedPhotosGallery
                                                                            placeId={item.place.id}
                                                                            itineraryId={itinerary.id}
                                                                            currentUserId={currentUserId}
                                                                        />
                                                                        <TripCommentsSection
                                                                            placeId={item.place.id}
                                                                            itineraryId={itinerary.id}
                                                                            currentUserId={currentUserId}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="lg:col-span-4 hidden lg:block">
                                <div className="sticky top-24 flex flex-col gap-6">
                                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                                        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                                            <h3 className="font-bold">{selectedDay + 1}일차 경로</h3>
                                            <button className="text-[var(--primary)] text-xs font-bold hover:underline">
                                                크게 보기
                                            </button>
                                        </div>
                                        <div className="w-full aspect-square relative">
                                            <MapContainer onMapLoad={setMap} center={initialCenter} zoom={12} />
                                        </div>
                                        <div className="p-3 bg-[var(--secondary)]">
                                            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                                    pin_drop
                                                </span>
                                                <span>{dayItems.length}곳 방문 예정</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-4">
                                        <h3 className="font-bold mb-3">여행 진행 상황</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-[var(--muted-foreground)]">진행률</span>
                                                    <span className="font-bold">{Math.round(((currentTripDay + 1) / totalDays) * 100)}%</span>
                                                </div>
                                                <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, ((currentTripDay + 1) / totalDays) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[var(--muted-foreground)]">남은 일수</span>
                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                    {daysRemaining > 0 ? `${daysRemaining}일` : '마지막 날!'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-4">
                                        <h3 className="font-bold mb-3">여행 통계</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="text-2xl font-black text-[var(--primary)]">
                                                    {itinerary.items.filter((i) => !i.isDayTransition).length}
                                                </div>
                                                <div className="text-xs text-[var(--muted-foreground)]">계획된 장소</div>
                                            </div>
                                            <div className="text-center p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="text-2xl font-black text-[var(--primary)]">{totalPhotos}</div>
                                                <div className="text-xs text-[var(--muted-foreground)]">저장된 사진</div>
                                            </div>
                                            <div className="text-center p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="text-2xl font-black text-[var(--primary)]">{totalDays}</div>
                                                <div className="text-xs text-[var(--muted-foreground)]">여행 일수</div>
                                            </div>
                                            <div className="text-center p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="text-2xl font-black text-red-500">
                                                    {itinerary.items.filter((i) => i.memory?.isLiked).length}
                                                </div>
                                                <div className="text-xs text-[var(--muted-foreground)]">좋아요</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

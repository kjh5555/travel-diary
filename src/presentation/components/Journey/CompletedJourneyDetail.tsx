"use client";

import { useState, useRef, useEffect } from "react";
import { SavedItinerary, PlaceMemory } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import { MapContainer } from "../Map/MapContainer";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { ImageCropperModal } from "@/presentation/components/common/ImageCropperModal";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";
import { ShareJourneyModal } from "@/presentation/components/Share/ShareJourneyModal";

interface CompletedJourneyDetailProps {
    itinerary: SavedItinerary;
    onBack: () => void;
    onUpdateMemory: (placeIndex: number, memory: PlaceMemory) => void;
    onUpdateCoverImage: (coverImage: string, thumbnail?: string) => void;
}

export const CompletedJourneyDetail = ({
    itinerary,
    onBack,
    onUpdateMemory,
    onUpdateCoverImage
}: CompletedJourneyDetailProps) => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);
    const [focusedPlace, setFocusedPlace] = useState<Place | null>(null);

    // Cover Image State
    // Cover Image State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempOriginalImage, setTempOriginalImage] = useState<string | null>(null);
    const [cropStep, setCropStep] = useState<'header' | 'thumbnail'>('header');
    const [tempHeaderImage, setTempHeaderImage] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const markersRef = useRef<google.maps.Marker[]>([]);
    const polylinesRef = useRef<google.maps.Polyline[]>([]);

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
        // Reset input value to allow selecting same file again
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
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/40 to-[var(--primary)]/20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white/30 text-9xl">photo_album</span>
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
                                    <span className="px-2 py-1 rounded bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-wide">
                                        완료된 여행
                                    </span>
                                    <span className="px-2 py-1 rounded bg-[var(--secondary)] text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wide">
                                        추억 기록
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
                                {days.map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`pb-3 border-b-[3px] font-bold text-sm tracking-wide flex flex-col items-center min-w-[60px] transition-colors ${selectedDay === day
                                            ? "border-[var(--primary)] text-[var(--primary)]"
                                            : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                            }`}
                                    >
                                        <span>{day + 1}일차</span>
                                        <span className="text-xs font-normal opacity-70">{formatDayDate(day)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 flex flex-col">
                                {dayItems.length === 0 ? (
                                    <div className="bg-[var(--surface)] rounded-xl p-12 text-center border border-[var(--border)]">
                                        <span className="material-symbols-outlined text-5xl text-[var(--muted-foreground)]/50 mb-4">
                                            photo_camera
                                        </span>
                                        <h3 className="text-lg font-bold mb-2">이 날의 기록이 없어요</h3>
                                        <p className="text-[var(--muted-foreground)]">
                                            이 날 방문한 장소에 사진과 메모를 추가해보세요.
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
                                                        className="bg-[var(--surface)] rounded-xl p-5 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow cursor-pointer"
                                                        onClick={() => setFocusedPlace(item.place)}
                                                    >
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
                                                        </div>

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
                                                                                onClick={() => openGallery(item.memory!.images!, i)}
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
                                                                className="w-full bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:ring-0 resize-none text-sm leading-relaxed"
                                                                rows={2}
                                                            />
                                                        </div>
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
                                                <span>{dayItems.length}곳 방문</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-4">
                                        <h3 className="font-bold mb-3">오늘의 메모</h3>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex items-start gap-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                                    lightbulb
                                                </span>
                                                {dayItems.length > 0
                                                    ? `${dayItems.length}곳의 장소를 방문했어요! 사진과 메모로 추억을 남겨보세요.`
                                                    : "이 날은 일정이 없습니다."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-4">
                                        <h3 className="font-bold mb-3">여행 통계</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="text-2xl font-black text-[var(--primary)]">
                                                    {itinerary.items.filter((i) => !i.isDayTransition).length}
                                                </div>
                                                <div className="text-xs text-[var(--muted-foreground)]">방문 장소</div>
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

            <ShareJourneyModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                itineraryId={itinerary.id}
                itineraryTitle={itinerary.title}
            />
        </>
    );
};

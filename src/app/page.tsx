"use client"

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NewJourneyModal } from "@/presentation/components/NewJourney/NewJourneyModal";
import { SavedItinerary, SavedItineraryPlace } from "@/domain/types/itinerary";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { GetTripItinerariesUseCase } from "@/domain/usecases/itinerary/GetTripItinerariesUseCase";
import Link from 'next/link';
import { groupItinerariesByStatus } from "@/domain/utils/dateUtils";
import { MapContainer } from "@/presentation/components/Map/MapContainer";
import { ThemeSpot, SUB_CATEGORY_COLORS, SUB_CATEGORY_LABELS } from "@/domain/types/themeSpot";
import { LocalStorageThemeSpotRepository } from "@/data/repositories/LocalStorageThemeSpotRepository";
import { ToggleThemeSpotLikeUseCase } from "@/domain/usecases/themeSpot/ToggleThemeSpotLikeUseCase";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";

interface TravelStats {
  countries: number;
  totalDays: number;
  photos: number;
  cities: number;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isNewJourneyOpen, setIsNewJourneyOpen] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);
  const [stats, setStats] = useState<TravelStats>({ countries: 0, totalDays: 0, photos: 0, cities: 0 });

  const loadItineraries = async () => {
    const repository = new LocalStorageItineraryRepository();
    const useCase = new GetTripItinerariesUseCase(repository);
    const result = await useCase.execute();
    setSavedItineraries(result.reverse());

    const totalDays = result.reduce((acc, itinerary) => {
      const start = new Date(itinerary.startDate);
      const end = new Date(itinerary.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return acc + days;
    }, 0);

    const totalPlaces = result.reduce((acc, itinerary) =>
      acc + itinerary.items.filter(i => !i.isDayTransition).length, 0);

    const totalPhotos = result.reduce((acc, itinerary) =>
      acc + itinerary.items.reduce((sum, item) =>
        sum + (item.memory?.images?.length || 0), 0), 0);

    setStats({
      countries: Math.min(result.length, 12),
      totalDays,
      photos: totalPhotos,
      cities: totalPlaces
    });
  };

  useEffect(() => {
    loadItineraries();
  }, []);

  const handleOpenItinerary = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);
    setIsNewJourneyOpen(true);
  };

  const { ongoing, upcoming, past } = groupItinerariesByStatus(savedItineraries);
  const nextTrip = upcoming[0] || ongoing[0];
  const recentTrips = past.slice(0, 2);

  const userName = session?.user?.name?.split(' ')[0] || "여행자";

  return (
    <>
      <NewJourneyModal
        isOpen={isNewJourneyOpen}
        onClose={() => {
          setIsNewJourneyOpen(false);
          setSelectedItinerary(null);
          loadItineraries();
        }}
        initialData={selectedItinerary}
      />

      <section className="flex flex-wrap justify-between items-end gap-6 animate-fade-in-up m-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            반가워요, {userName}님! 👋
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg">
            다음 여행지는 어디인가요? 모험이 기다리고 있습니다.
          </p>
        </div>
        <button
          onClick={() => setIsNewJourneyOpen(true)}
          className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          새 여행 만들기
        </button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="public" label="방문한 국가" value={stats.countries} />
        <StatCard icon="calendar_today" label="총 여행 일수" value={stats.totalDays} />
        <StatCard icon="photo_camera" label="촬영한 사진" value={stats.photos > 1000 ? `${(stats.photos / 1000).toFixed(1)}k` : stats.photos} />
        <StatCard icon="location_city" label="방문한 도시" value={stats.cities} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 m-4">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">flight_takeoff</span>
              다가오는 여행
            </h2>
            <Link href="/journeys" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] hover:underline">
              모두 보기
            </Link>
          </div>

          {nextTrip ? (
            <UpcomingTripCard trip={nextTrip} onViewDetails={() => handleOpenItinerary(nextTrip)} />
          ) : (
            <EmptyTripCard onCreateTrip={() => setIsNewJourneyOpen(true)} />
          )}

          {recentTrips.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="text-lg font-bold px-1">최근 추억</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentTrips.map((trip) => (
                  <RecentTripCard
                    key={trip.id}
                    trip={trip}
                    onClick={() => router.push(`/journeys/${trip.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">explore</span>
              테마 여행
            </h2>
          </div>
          <ThemeTravelSection />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)]">map</span>
            저장된 장소
          </h2>
        </div>
        <SavedPlacesMapPreview />
      </section>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[var(--muted-foreground)] font-medium text-sm">{label}</span>
        <span className="material-symbols-outlined text-[var(--primary)] bg-[var(--primary)]/10 p-1.5 rounded-lg text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function UpcomingTripCard({ trip, onViewDetails }: { trip: SavedItinerary; onViewDetails: () => void }) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOngoing = startDate <= today && endDate >= today;

  const firstPlace = trip.items.find(i => !i.isDayTransition)?.place;
  const locationName = firstPlace?.address?.split(',').pop()?.trim() || trip.arrivalAirport?.name || "여행지";
  const photoQuery = firstPlace?.name || trip.arrivalAirport?.name || locationName;
  const photoLocation = firstPlace?.location || trip.arrivalAirport?.location;

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return `${startDate.toLocaleDateString('ko-KR', options)} - ${endDate.toLocaleDateString('ko-KR', options)}`;
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-4 shadow-sm border border-[var(--border)]">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/5 aspect-video md:aspect-auto h-64 md:h-auto rounded-xl relative overflow-hidden group cursor-pointer">
          <GooglePlacePhoto
            query={photoQuery}
            location={photoLocation}
            className="absolute inset-0 w-full h-full"
            maxWidth={800}
            maxHeight={600}
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5" />
            }
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" onClick={onViewDetails} />
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {locationName}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between py-2 md:pr-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-1 rounded font-bold ${isOngoing
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
                }`}>
                {isOngoing ? "진행 중" : "예약 확정"}
              </span>
              <span className="text-[var(--muted-foreground)] text-xs font-medium">
                • {isOngoing ? "여행 중!" : daysUntil > 0 ? `${daysUntil}일 남음` : "오늘 출발!"}
              </span>
            </div>
            <h3 className="text-2xl font-bold">{trip.title || "나의 여행"}</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed line-clamp-2 break-keep">
              {trip.items.filter(i => !i.isDayTransition).slice(0, 3).map(i => i.place.name).join(', ')}
              {trip.items.filter(i => !i.isDayTransition).length > 3 && ' 외'}
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 p-2 rounded bg-[var(--background)]">
                <span className="material-symbols-outlined text-[var(--primary)]">calendar_month</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold">날짜</span>
                  <span className="text-sm font-semibold">{formatDateRange()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-[var(--background)]">
                <span className="material-symbols-outlined text-[var(--primary)]">place</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold">장소</span>
                  <span className="text-sm font-semibold">{trip.items.filter(i => !i.isDayTransition).length}곳</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onViewDetails}
              className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm shadow-[var(--primary)]/30"
            >
              일정 상세 보기
            </button>
            <button className="px-4 py-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyTripCard({ onCreateTrip }: { onCreateTrip: () => void }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--border)] flex flex-col items-center justify-center text-center min-h-[200px]">
      <span className="material-symbols-outlined text-5xl text-[var(--muted-foreground)]/50 mb-4">flight_takeoff</span>
      <h3 className="text-lg font-bold mb-2">예정된 여행이 없어요</h3>
      <p className="text-[var(--muted-foreground)] text-sm mb-4">새로운 모험을 시작해보세요!</p>
      <button
        onClick={onCreateTrip}
        className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
      >
        여행 계획하기
      </button>
    </div>
  );
}

function RecentTripCard({ trip, onClick }: { trip: SavedItinerary; onClick: () => void }) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const formatDate = () => {
    return startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  };

  const thumbnailImage = trip.thumbnail || trip.coverImage;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] hover:shadow-md transition-all cursor-pointer"
    >
      <div
        className="h-20 w-20 rounded-lg bg-cover bg-center shrink-0 overflow-hidden"
      >
        {thumbnailImage ? (
          <img
            src={thumbnailImage}
            alt={trip.title || "여행 사진"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--primary)]/50 text-2xl">photo_camera</span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h4 className="font-bold group-hover:text-[var(--primary)] transition-colors">
          {trip.title || "나의 여행"}
        </h4>
        <p className="text-xs text-[var(--muted-foreground)] mb-2">
          {formatDate()} • {days}일
        </p>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[var(--primary)] text-sm">location_on</span>
          <span className="text-xs font-medium">{trip.items.filter(i => !i.isDayTransition).length}곳 방문</span>
        </div>
      </div>
    </div>
  );
}

function ThemeTravelSection() {
  const [spots, setSpots] = useState<ThemeSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSpots = async () => {
      const repository = new LocalStorageThemeSpotRepository();
      const allSpots = await repository.getAll();
      const topSpots = [...allSpots].sort((a, b) => b.rating - a.rating).slice(0, 2);
      setSpots(topSpots);
      setIsLoading(false);
    };
    loadSpots();
  }, []);

  const handleToggleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const repository = new LocalStorageThemeSpotRepository();
    const toggleLikeUseCase = new ToggleThemeSpotLikeUseCase(repository);
    const updated = await toggleLikeUseCase.execute(id);
    if (updated) {
      setSpots(prev => prev.map(s => s.id === id ? updated : s));
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)] flex flex-col gap-5 h-full">
      <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">지금 뜨는 여행</h3>

      {isLoading ? (
        <>
          <div className="aspect-[4/3] w-full bg-[var(--secondary)] rounded-xl animate-pulse" />
          <div className="aspect-[4/3] w-full bg-[var(--secondary)] rounded-xl animate-pulse" />
        </>
      ) : (
        spots.map((spot) => (
          <Link
            key={spot.id}
            href={`/themes/${spot.themeId}/${spot.id}`}
            className="relative group cursor-pointer overflow-hidden rounded-xl"
          >
            <div className="aspect-[4/3] w-full relative overflow-hidden">
              <GooglePlacePhoto
                query={`${spot.title} ${spot.location}`}
                location={{ lat: spot.lat, lng: spot.lng }}
                className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                maxWidth={600}
                maxHeight={450}
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 transition-transform duration-500 group-hover:scale-105" />
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {spot.location}
            </div>
            <button
              onClick={(e) => handleToggleLike(spot.id, e)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                spot.isLiked
                  ? "bg-red-500 text-white"
                  : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/40"
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${spot.isLiked ? "filled" : ""}`}>
                favorite
              </span>
            </button>
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <span className={`${SUB_CATEGORY_COLORS[spot.subCategory] || 'bg-gray-500/90'} text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block`}>
                {SUB_CATEGORY_LABELS[spot.subCategory] || spot.subCategory}
              </span>
              <h4 className="text-white font-bold text-lg leading-tight mb-1">{spot.title}</h4>
              <div className="flex justify-between items-center">
                <p className="text-gray-300 text-xs">{spot.subtitle}</p>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-400 text-sm filled">star</span>
                  <span className="text-white text-xs font-bold">{spot.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}

      <Link
        href="/themes"
        className="mt-auto w-full py-3 rounded-lg border border-[var(--primary)]/20 text-[var(--primary)] font-semibold hover:bg-[var(--primary)]/5 transition-colors text-sm text-center"
      >
        더 많은 테마 보기
      </Link>
    </div>
  );
}

function SavedPlacesMapPreview() {
  const router = useRouter();
  const [likedPlaces, setLikedPlaces] = useState<SavedItineraryPlace[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const loadLikedPlaces = async () => {
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
      setLikedPlaces(allLiked);
    };

    loadLikedPlaces();
  }, []);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (likedPlaces.length === 0) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    likedPlaces.forEach((item) => {
      const marker = new google.maps.Marker({
        position: item.place.location,
        map,
        title: item.place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#6366f1',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        },
      });

      marker.addListener('mouseover', () => {
        const ratingHtml = item.place.rating 
          ? `<div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
              <span style="color: #facc15;">★</span>
              <span style="font-weight: 500;">${item.place.rating}</span>
              ${item.place.user_ratings_total ? `<span style="color: #9ca3af; font-size: 12px;">(${item.place.user_ratings_total})</span>` : ''}
            </div>`
          : '';
        
        const categoryMap: Record<string, string> = {
          restaurant: '음식점', food: '음식점', cafe: '카페', bar: '바',
          lodging: '숙소', hotel: '호텔',
          tourist_attraction: '명소', museum: '박물관', park: '공원'
        };
        const category = item.place.types?.find(t => categoryMap[t]);
        const categoryLabel = category ? categoryMap[category] : '';
        const categoryHtml = categoryLabel 
          ? `<span style="background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">${categoryLabel}</span>`
          : '';

        infoWindowRef.current?.setContent(`
          <div style="padding: 10px 14px; max-width: 200px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              ${categoryHtml}
            </div>
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 2px;">${item.place.name}</div>
            <div style="color: #6b7280; font-size: 12px; line-height: 1.4;">${item.place.address?.split(',').slice(0, 2).join(', ') || ''}</div>
            ${ratingHtml}
          </div>
        `);
        infoWindowRef.current?.open(map, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindowRef.current?.close();
      });

      marker.addListener('click', () => {
        router.push('/places');
      });

      markersRef.current.push(marker);
    });

    if (likedPlaces.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      likedPlaces.forEach((item) => {
        bounds.extend(item.place.location);
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    } else if (likedPlaces.length === 1) {
      map.setCenter(likedPlaces[0].place.location);
      map.setZoom(14);
    }
  }, [map, likedPlaces]);

  const mapCenter = likedPlaces[0]?.place.location || { lat: 35.6762, lng: 139.6503 };

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden relative group border border-[var(--border)] shadow-sm">
      <MapContainer
        onMapLoad={setMap}
        center={mapCenter}
        zoom={likedPlaces.length > 0 ? 10 : 4}
        className="w-full h-full"
      />
      {likedPlaces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="text-center text-white">
            <span className="material-symbols-outlined text-4xl mb-2">favorite_border</span>
            <p className="text-sm font-medium">저장된 장소가 없습니다</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 right-4 z-10">
        <Link
          href="/places"
          className="bg-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">open_in_full</span>
          전체 지도 열기
        </Link>
      </div>
    </div>
  );
}

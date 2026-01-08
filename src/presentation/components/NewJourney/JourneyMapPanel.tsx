import React, { useEffect, useRef } from 'react';
import { MapContainer } from "@/presentation/components/Map/MapContainer";
import { Place } from "@/domain/types/place";
import { AirportItem, WishlistItem } from "@/presentation/hooks/useJourneyPlanner";

interface JourneyMapPanelProps {
    currentDay: number;
    selectedAirport: AirportItem | null;
    departureAirport: AirportItem | null;
    prevDayLastPlace: Place | null;
    dailyWishlists: Record<number, WishlistItem[]>;
    daysCount: number;
    onMapLoad: (map: google.maps.Map | null) => void;
    mapCenter?: google.maps.LatLngLiteral;
    focusedPlace?: Place | null;
}

export const JourneyMapPanel: React.FC<JourneyMapPanelProps> = ({
    currentDay,
    selectedAirport,
    departureAirport,
    prevDayLastPlace,
    dailyWishlists,
    daysCount,
    onMapLoad,
    mapCenter,
    focusedPlace
}) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);

    const currentWishlist = dailyWishlists[currentDay] || [];

    const handleMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
        onMapLoad(map);
    };

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        const addMarker = (place: Place, color: string, zIndex: number = 100) => {
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
                zIndex
            });
            markersRef.current.push(marker);
        };

        if (focusedPlace) {
            addMarker(focusedPlace, "yellow", 1000); // Focused place has highest z-index
        }

        if (selectedAirport && (currentDay === 0 || !prevDayLastPlace)) {
            // Only show airport if not focused on something else, or keep showing it but focused takes priority in z-index
            // We just add it normally
            addMarker(selectedAirport.place, "red");
        }

        if (prevDayLastPlace) {
            addMarker(prevDayLastPlace, "purple");
        }

        currentWishlist.forEach(item => {
            addMarker(item.data, "blue");
        });

        if (currentDay === daysCount - 1 && departureAirport) {
            addMarker(departureAirport.place, "green");
        }

        if (focusedPlace) {
            map.panTo(focusedPlace.location);

            // Smooth zoom effect
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
        } else if (markersRef.current.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            markersRef.current.forEach(m => {
                const pos = m.getPosition();
                if (pos) bounds.extend(pos);
            });
            map.fitBounds(bounds);
        } else if (markersRef.current.length === 1) {
            const pos = markersRef.current[0].getPosition();
            if (pos) {
                map.panTo(pos);
                map.setZoom(12);
            }
        } else if (currentDay === 0 && selectedAirport) {
            map.panTo(selectedAirport.place.location);
            map.setZoom(12);
        }

    }, [currentDay, selectedAirport, departureAirport, prevDayLastPlace, dailyWishlists, daysCount, focusedPlace]);

    return (
        <div className="w-1/2 h-full bg-[var(--secondary)] relative">
            <MapContainer
                onMapLoad={handleMapLoad}
                className="h-full w-full"
                center={mapCenter}
            />
            <div className="absolute bottom-4 left-4 bg-[var(--surface)] rounded-xl p-3 shadow-lg border border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm font-bold mb-2">
                    <span className="material-symbols-outlined text-[var(--primary)]">map</span>
                    {currentDay + 1}일차 경로
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {currentWishlist.length}곳
                    </div>
                </div>
            </div>
        </div>
    );
};

"use client"

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/data/google-maps/useGoogleMaps";

interface MapContainerProps {
    center?: google.maps.LatLngLiteral;
    zoom?: number;
    className?: string;
    onMapLoad?: (map: google.maps.Map) => void;
}

const DEFAULT_CENTER = { lat: 34.6937, lng: 135.5023 }; // Osaka
const DEFAULT_ZOOM = 13;

export const MapContainer = ({
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    className,
    onMapLoad
}: MapContainerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const { isLoaded, loadError } = useGoogleMaps(apiKey);

    useEffect(() => {
        if (isLoaded && mapRef.current && !map) {
            const newMap = new google.maps.Map(mapRef.current, {
                center,
                zoom,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
            setMap(newMap);
            if (onMapLoad) onMapLoad(newMap);
        }
    }, [isLoaded, mapRef, map, center, zoom, onMapLoad]);

    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [center, map]);

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />;

    return <div ref={mapRef} className={`h-full w-full rounded-xl overflow-hidden ${className}`} />;
};

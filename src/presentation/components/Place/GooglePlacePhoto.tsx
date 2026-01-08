"use client"

import { useGoogleMaps } from "@/data/google-maps/useGoogleMaps";
import { useEffect, useRef, useState, ReactNode } from "react";

interface GooglePlacePhotoProps {
    /** Place name or query to search for */
    query: string;
    /** Optional location hint for better search results */
    location?: { lat: number; lng: number };
    /** CSS class for the container */
    className?: string;
    /** Max width for the photo (default: 800) */
    maxWidth?: number;
    /** Max height for the photo (default: 600) */
    maxHeight?: number;
    /** Whether to render as background image style div (default: false) */
    asBackground?: boolean;
    /** Children to render over the background (only when asBackground=true) */
    children?: ReactNode;
    /** Fallback content when no photo found */
    fallback?: ReactNode;
    /** Alt text for the image */
    alt?: string;
    /** onClick handler */
    onClick?: () => void;
}

export const GooglePlacePhoto = ({
    query,
    location,
    className = "",
    maxWidth = 800,
    maxHeight = 600,
    asBackground = false,
    children,
    fallback,
    alt,
    onClick,
}: GooglePlacePhotoProps) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const { isLoaded } = useGoogleMaps(apiKey);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoaded || !divRef.current || !query) {
            setLoading(false);
            return;
        }

        if (!serviceRef.current) {
            serviceRef.current = new google.maps.places.PlacesService(divRef.current);
        }

        setLoading(true);
        setError(false);

        const request: google.maps.places.FindPlaceFromQueryRequest = {
            query: query,
            fields: ['photos'],
            ...(location && {
                locationBias: new google.maps.LatLng(location.lat, location.lng)
            })
        };

        serviceRef.current.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                const photos = results[0].photos;
                if (photos && photos.length > 0) {
                    setPhotoUrl(photos[0].getUrl({ maxWidth, maxHeight }));
                } else {
                    setError(true);
                }
            } else {
                setError(true);
            }
            setLoading(false);
        });

    }, [isLoaded, query, location?.lat, location?.lng, maxWidth, maxHeight]);

    const defaultFallback = (
        <div className={`bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 flex items-center justify-center ${className}`}>
            <span className="material-symbols-outlined text-[var(--primary)]/50 text-4xl">photo_camera</span>
        </div>
    );

    if (!isLoaded || loading) {
        return (
            <>
                <div className={`bg-[var(--secondary)] animate-pulse ${className}`} onClick={onClick} />
                <div ref={divRef} className="hidden" />
            </>
        );
    }

    if (error || !photoUrl) {
        return (
            <>
                {fallback || defaultFallback}
                <div ref={divRef} className="hidden" />
            </>
        );
    }

    if (asBackground) {
        return (
            <>
                <div
                    className={`bg-cover bg-center ${className}`}
                    style={{ backgroundImage: `url(${photoUrl})` }}
                    onClick={onClick}
                >
                    {children}
                </div>
                <div ref={divRef} className="hidden" />
            </>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={photoUrl}
                alt={alt || query}
                className="w-full h-full object-cover"
            />
            <div ref={divRef} className="hidden" />
        </div>
    );
};

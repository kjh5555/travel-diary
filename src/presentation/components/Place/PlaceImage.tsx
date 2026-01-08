"use client"

import { useGoogleMaps } from "@/data/google-maps/useGoogleMaps";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface PlaceImageProps {
    placeName: string;
    className?: string;
    width?: number;
    height?: number;
}

export const PlaceImage = ({ placeName, className, width = 400, height = 300 }: PlaceImageProps) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const { isLoaded } = useGoogleMaps(apiKey);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoaded || !divRef.current || !placeName) return;

        if (!serviceRef.current) {
            serviceRef.current = new google.maps.places.PlacesService(divRef.current);
        }

        const request = {
            query: placeName,
            fields: ['photos']
        };

        serviceRef.current.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                const photos = results[0].photos;
                if (photos && photos.length > 0) {
                    // Start loading the image
                    setPhotoUrl(photos[0].getUrl({ maxWidth: width, maxHeight: height }));
                } else {
                    setPhotoUrl(null);
                }
            } else {
                console.warn(`Place not found or no photos: ${placeName}`, status);
                setPhotoUrl(null);
            }
            setLoading(false);
        });

    }, [isLoaded, placeName, width, height]);

    if (!isLoaded || loading) {
        return (
            <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
                <span className="text-gray-400">Loading...</span>
            </div>
        );
    }

    if (!photoUrl) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center text-gray-300 text-4xl ${className}`}>
                📷
            </div>
        );
    }

    // Using standard img tag because Google Maps URLs might not be configured in next.config.js for Image optimization
    // and they are dynamic.
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={photoUrl}
                alt={placeName}
                className="w-full h-full object-cover"
            />
            {/* Hidden div for PlacesService */}
            <div ref={divRef} className="hidden"></div>
        </div>
    );
};

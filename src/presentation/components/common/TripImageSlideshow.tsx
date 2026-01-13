"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedItinerary } from "@/domain/types/itinerary";
import { GooglePlacePhoto } from "@/presentation/components/Place/GooglePlacePhoto";

interface TripImageSlideshowProps {
    itinerary: SavedItinerary;
    interval?: number;
    className?: string;
    includeMemoryPhotos?: boolean;
}

interface SlideImage {
    type: 'place' | 'memory';
    placeQuery?: string;
    placeLocation?: { lat: number; lng: number };
    memorySrc?: string;
}

export const TripImageSlideshow = ({
    itinerary,
    interval = 4000,
    className = "",
    includeMemoryPhotos = false
}: TripImageSlideshowProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const slides: SlideImage[] = [];

    const places = itinerary.items.filter(item => !item.isDayTransition);
    places.forEach(item => {
        slides.push({
            type: 'place',
            placeQuery: item.place.name,
            placeLocation: item.place.location
        });
    });

    if (includeMemoryPhotos) {
        places.forEach(item => {
            if (item.memory?.images) {
                item.memory.images.forEach(img => {
                    slides.push({
                        type: 'memory',
                        memorySrc: img
                    });
                });
            }
        });
    }

    if (itinerary.arrivalAirport) {
        slides.unshift({
            type: 'place',
            placeQuery: itinerary.arrivalAirport.name,
            placeLocation: itinerary.arrivalAirport.location
        });
    }

    const nextSlide = useCallback(() => {
        if (slides.length <= 1) return;
        
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
            setIsTransitioning(false);
        }, 300);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [slides.length, interval, nextSlide]);

    if (slides.length === 0) {
        return (
            <div className={`bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 flex items-center justify-center ${className}`}>
                <span className="material-symbols-outlined text-[var(--primary)]/50 text-4xl">photo_camera</span>
            </div>
        );
    }

    const currentSlide = slides[currentIndex];

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div
                className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
                {currentSlide.type === 'memory' && currentSlide.memorySrc ? (
                    <img
                        src={currentSlide.memorySrc}
                        alt="Travel memory"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <GooglePlacePhoto
                        query={currentSlide.placeQuery || ''}
                        location={currentSlide.placeLocation}
                        className="w-full h-full"
                        maxWidth={600}
                        maxHeight={400}
                        fallback={
                            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10" />
                        }
                    />
                )}
            </div>

            {slides.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {slides.slice(0, Math.min(slides.length, 5)).map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === currentIndex % Math.min(slides.length, 5)
                                    ? 'bg-white w-3'
                                    : 'bg-white/50'
                            }`}
                        />
                    ))}
                    {slides.length > 5 && (
                        <span className="text-white/70 text-[10px] ml-1">+{slides.length - 5}</span>
                    )}
                </div>
            )}
        </div>
    );
};

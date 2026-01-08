"use client"

import { useEffect, useState } from "react";
import { SavedItineraryPlace } from "@/domain/types/itinerary";

interface PlaceDetailModalProps {
    place: SavedItineraryPlace | null;
    isOpen: boolean;
    onClose: () => void;
    onUnlike?: () => void;
    onAddToItinerary?: () => void;
}

export const PlaceDetailModal = ({ 
    place, 
    isOpen, 
    onClose, 
    onUnlike,
    onAddToItinerary 
}: PlaceDetailModalProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setSelectedImageIndex(0);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isVisible || !place) return null;

    const images = place.memory?.images || [];
    const hasImages = images.length > 0;

    const getCategoryInfo = (types: string[] = []) => {
        if (types.some(t => ['restaurant', 'food', 'cafe', 'bar', 'bakery'].includes(t))) {
            return { label: "음식점", colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" };
        }
        if (types.some(t => ['lodging', 'hotel', 'resort'].includes(t))) {
            return { label: "숙소", colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
        }
        return { label: "명소", colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" };
    };

    const categoryInfo = getCategoryInfo(place.place.types);

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
        >
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={onClose} 
            />

            <div 
                className={`relative bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-transform duration-300 ${
                    isOpen ? "scale-100" : "scale-95"
                }`}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="overflow-y-auto max-h-[90vh]">
                    {hasImages ? (
                        <div className="relative aspect-video bg-[var(--secondary)]">
                            <img 
                                src={images[selectedImageIndex]} 
                                alt={place.place.name}
                                className="w-full h-full object-cover"
                            />
                            
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button 
                                        onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                    
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setSelectedImageIndex(i)}
                                                className={`w-2 h-2 rounded-full transition-colors ${
                                                    i === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-video bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[var(--primary)]/30 text-8xl">photo_camera</span>
                        </div>
                    )}

                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${categoryInfo.colorClass}`}>
                                {categoryInfo.label}
                            </span>
                            {place.place.rating && (
                                <div className="flex items-center text-yellow-500 text-sm">
                                    <span className="material-symbols-outlined filled text-[18px]">star</span>
                                    <span className="ml-1 font-bold text-[var(--foreground)]">
                                        {place.place.rating}
                                    </span>
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-black mb-2">{place.place.name}</h2>
                        
                        <div className="flex items-start gap-1.5 text-[var(--muted-foreground)] mb-4">
                            <span className="material-symbols-outlined text-lg shrink-0">location_on</span>
                            <p className="text-sm">{place.place.address}</p>
                        </div>

                        {place.memory?.text && (
                            <div className="bg-[var(--secondary)] rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[var(--primary)] text-lg">edit_note</span>
                                    <span className="text-sm font-bold">내 메모</span>
                                </div>
                                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                                    {place.memory.text}
                                </p>
                            </div>
                        )}

                        {images.length > 1 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">photo_library</span>
                                    사진 갤러리 ({images.length}장)
                                </h3>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImageIndex(i)}
                                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                                i === selectedImageIndex 
                                                    ? 'border-[var(--primary)]' 
                                                    : 'border-transparent hover:border-[var(--border)]'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                            <button 
                                onClick={onUnlike}
                                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500 transition-colors font-medium"
                            >
                                <span className="material-symbols-outlined">heart_broken</span>
                                <span>좋아요 취소</span>
                            </button>
                            <button 
                                onClick={onAddToItinerary}
                                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors font-bold"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                <span>일정에 추가</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

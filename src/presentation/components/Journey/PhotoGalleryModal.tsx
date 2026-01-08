"use client";

import { useState, useEffect, useCallback } from "react";

interface PhotoGalleryModalProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

export const PhotoGalleryModal = ({ images, initialIndex, onClose }: PhotoGalleryModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goToPrevious();
            if (e.key === "ArrowRight") goToNext();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [onClose, goToPrevious, goToNext]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
                <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <span className="material-symbols-outlined text-3xl">chevron_left</span>
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <span className="material-symbols-outlined text-3xl">chevron_right</span>
                    </button>
                </>
            )}

            <div className="max-w-[90vw] max-h-[85vh] relative">
                <img
                    src={images[currentIndex]}
                    alt=""
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
            </div>

            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentIndex
                                    ? "bg-white w-6"
                                    : "bg-white/40 hover:bg-white/60"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

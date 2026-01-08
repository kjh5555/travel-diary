import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import getCroppedImg from '@/presentation/utils/canvasUtils';

interface ImageCropperModalProps {
    isOpen: boolean;
    image: string;
    onClose: () => void;
    onCropComplete: (croppedImage: string) => void;
    aspectRatio?: number;
    title?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    image,
    onClose,
    onCropComplete,
    aspectRatio = 1,
    title = '이미지 자르기'
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)] z-10">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="relative flex-1 bg-black min-h-[400px]">
                    {/* @ts-ignore - react-easy-crop types issue with React 19 */}
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={handleCropComplete}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)] z-10 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium whitespace-nowrap">확대/축소</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg font-bold text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-bold hover:bg-[var(--primary-dark)] shadow-md shadow-[var(--primary)]/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">crop</span>
                            저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

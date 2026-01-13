"use client";

import { useState, useEffect, useRef } from "react";
import { TripPhoto } from "@/domain/types/friend";

interface SharedPhotosGalleryProps {
    placeId: string;
    itineraryId: string;
    currentUserId: string;
}

export const SharedPhotosGallery = ({ placeId, itineraryId, currentUserId }: SharedPhotosGalleryProps) => {
    const [photos, setPhotos] = useState<TripPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<TripPhoto | null>(null);
    const [caption, setCaption] = useState("");
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPhotos();
    }, [placeId]);

    const fetchPhotos = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/photos?placeId=${placeId}`);
            if (res.ok) {
                setPhotos(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch photos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
            setShowUploadForm(true);
        };
        reader.readAsDataURL(file);
    };

    const uploadPhoto = async () => {
        if (!previewImage || isUploading) return;
        setIsUploading(true);
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    placeId,
                    imageUrl: previewImage,
                    caption: caption.trim() || undefined
                })
            });
            if (res.ok) {
                setPreviewImage(null);
                setCaption("");
                setShowUploadForm(false);
                fetchPhotos();
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const deletePhoto = async (photoId: string) => {
        if (!confirm('사진을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/photos?photoId=${photoId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchPhotos();
                if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
            }
        } catch (error) {
            console.error('Failed to delete photo:', error);
        }
    };

    const Avatar = ({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) => {
        if (!user) return null;
        const letter = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();
        return user.image ? (
            <img src={user.image} alt="" className="w-6 h-6 rounded-full object-cover border-2 border-white" />
        ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                {letter}
            </div>
        );
    };

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    공유 사진 {photos.length > 0 && `(${photos.length})`}
                </h4>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    사진 추가
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {showUploadForm && previewImage && (
                <div className="mb-4 p-4 bg-[var(--secondary)] rounded-xl">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="사진 설명 (선택)"
                        className="w-full h-9 px-3 mb-3 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowUploadForm(false); setPreviewImage(null); setCaption(""); }}
                            className="flex-1 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--surface)]"
                        >
                            취소
                        </button>
                        <button
                            onClick={uploadPhoto}
                            disabled={isUploading}
                            className="flex-1 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {isUploading ? '업로드 중...' : '업로드'}
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <span className="material-symbols-outlined animate-spin text-2xl text-[var(--muted-foreground)]">progress_activity</span>
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">add_photo_alternate</span>
                    <p className="text-sm">아직 공유된 사진이 없습니다</p>
                    <p className="text-xs">첫 번째 사진을 추가해보세요</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img src={photo.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-1 left-1">
                                <Avatar user={photo.user} />
                            </div>
                            {photo.userId === currentUserId && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    <div className="max-w-4xl max-h-[90vh] px-4" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedPhoto.imageUrl} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                        <div className="mt-4 text-white">
                            <div className="flex items-center gap-2">
                                <Avatar user={selectedPhoto.user} />
                                <span className="text-sm">{selectedPhoto.user?.name || '익명'}</span>
                            </div>
                            {selectedPhoto.caption && (
                                <p className="mt-2 text-sm text-white/80">{selectedPhoto.caption}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

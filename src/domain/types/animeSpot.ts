export type AnimeCategory = 'romance' | 'fantasy' | 'sports' | 'action' | 'nature' | 'ghibli' | 'shinkai';

export interface AnimeSpot {
    id: string;
    title: string;
    sceneName: string;
    originalImageUrl: string;
    realImageUrl?: string;
    lat: number;
    lng: number;
    guideTip: string;
    category: AnimeCategory;
    rating: number;
    location: string;
    description?: string;
    isLiked?: boolean;
}

export interface AnimeSpotFilter {
    category?: AnimeCategory;
    searchQuery?: string;
}

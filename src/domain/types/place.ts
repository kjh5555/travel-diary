export interface Location {
    lat: number;
    lng: number;
}

export interface Place {
    id: string;
    name: string;
    address: string;
    location: Location;
    rating?: number;
    user_ratings_total?: number;
    photos?: string[];
    types?: string[];
    price_level?: number;
    opening_hours?: {
        open_now: boolean;
        weekday_text?: string[];
    };
}

export interface SearchPlacesOptions {
    query: string;
    location?: Location;
    airportsOnly?: boolean;
}

export interface IPlaceRepository {
    searchPlaces(options: SearchPlacesOptions): Promise<Place[]>;
    getPlaceDetails(placeId: string): Promise<Place | null>;
}

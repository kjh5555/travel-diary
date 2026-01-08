import { Place } from "./place";

export interface TransitDetails {
    line?: {
        name: string;
        short_name?: string;
        color?: string;
        vehicle?: {
            icon?: string;
            type: 'BUS' | 'RAIL' | 'SUBWAY' | 'TRAM' | 'FERRY' | 'OTHER';
        };
    };
    departure_stop?: string;
    arrival_stop?: string;
    departure_time?: string;
    arrival_time?: string;
    num_stops?: number;
    headsign?: string;
}

export interface RouteStep {
    instruction: string;
    distance: string;
    duration: string;
    mode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING';
    transit?: TransitDetails;
}

export interface Route {
    distanceMeters: number;
    durationSeconds: number;
    mode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING';
    polyline?: string;
    steps: RouteStep[];
    isFallback?: boolean; // True if this is a fallback route (e.g., DRIVING when TRANSIT not available)
}

export interface ItineraryItem {
    id: string; // Unique ID for this item in the itinerary
    place: Place;
    order: number;
    startTime?: string; // ISO string or HH:mm
    durationMinutes?: number; // Estimated stay duration
    routeFromPrevious?: Route; // Travel info from the previous item
}

export interface Itinerary {
    id: string;
    date: string; // YYYY-MM-DD
    items: ItineraryItem[];
}

export interface PlaceMemory {
    text?: string;
    images?: string[]; // Base64 strings
    timestamp?: string;
    isLiked?: boolean;
}

export interface SavedItineraryPlace {
    place: Place;
    routeToNext?: Route;
    day: number;
    isDayTransition?: boolean;
    memory?: PlaceMemory;
}

export interface SavedItinerary {
    id: string;
    title?: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    arrivalAirport?: Place;
    departureAirport?: Place;
    items: SavedItineraryPlace[];
    createdAt: string; // ISO timestamp
    coverImage?: string; // Base64 or URL
    thumbnail?: string; // Base64 or URL for list view
}

export interface IRouteRepository {
    getRoute(origin: Place, destination: Place, mode: string): Promise<Route | null>;
}

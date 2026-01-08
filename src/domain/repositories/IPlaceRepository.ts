import { Place, SearchPlacesOptions } from "../types/place";

export interface IPlaceRepository {
    searchPlaces(options: SearchPlacesOptions): Promise<Place[]>;
    getPlaceDetails(placeId: string): Promise<Place | null>;
}

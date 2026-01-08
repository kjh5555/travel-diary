import { Itinerary, ItineraryItem, SavedItinerary } from "../types/itinerary";

export interface IItineraryRepository {
    getItinerary(id: string): Promise<Itinerary | null>;
    saveItinerary(itinerary: Itinerary): Promise<Itinerary>;
    addItem(itineraryId: string, item: ItineraryItem): Promise<Itinerary>;
    removeItem(itineraryId: string, itemId: string): Promise<Itinerary>;
    updateItem(itineraryId: string, item: ItineraryItem): Promise<Itinerary>;

    saveTripItinerary(itinerary: SavedItinerary): Promise<void>;
    getAllTripItineraries(): Promise<SavedItinerary[]>;
    getTripItinerary(id: string): Promise<SavedItinerary | null>;
    deleteTripItinerary(id: string): Promise<void>;
}

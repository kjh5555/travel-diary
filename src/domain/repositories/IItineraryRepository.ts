import { Itinerary, ItineraryItem, SavedItinerary } from "../types/itinerary";

export interface IItineraryRepository {
    getItinerary(id: string, userId: string): Promise<Itinerary | null>;
    saveItinerary(itinerary: Itinerary, userId: string): Promise<Itinerary>;
    addItem(itineraryId: string, item: ItineraryItem, userId: string): Promise<Itinerary>;
    removeItem(itineraryId: string, itemId: string, userId: string): Promise<Itinerary>;
    updateItem(itineraryId: string, item: ItineraryItem, userId: string): Promise<Itinerary>;

    saveTripItinerary(itinerary: SavedItinerary, userId: string): Promise<void>;
    getAllTripItineraries(userId: string): Promise<SavedItinerary[]>;
    getTripItinerary(id: string, userId: string): Promise<SavedItinerary | null>;
    deleteTripItinerary(id: string, userId: string): Promise<void>;
}

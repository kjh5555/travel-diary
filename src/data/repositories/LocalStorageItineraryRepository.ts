
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { Itinerary, ItineraryItem, SavedItinerary } from "@/domain/types/itinerary";

const STORAGE_KEY = "trip_itineraries";

export class LocalStorageItineraryRepository implements IItineraryRepository {
    getItinerary(_id: string, _userId: string): Promise<Itinerary | null> {
        throw new Error("Method not implemented.");
    }
    saveItinerary(_itinerary: Itinerary, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }
    addItem(_itineraryId: string, _item: ItineraryItem, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }
    removeItem(_itineraryId: string, _itemId: string, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }
    updateItem(_itineraryId: string, _item: ItineraryItem, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }

    async saveTripItinerary(itinerary: SavedItinerary, _userId: string): Promise<void> {
        if (typeof window === 'undefined') return;
        const current = await this.getAllTripItineraries(_userId);
        const index = current.findIndex(i => i.id === itinerary.id);
        if (index >= 0) {
            current[index] = itinerary;
        } else {
            current.push(itinerary);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }

    async getAllTripItineraries(_userId: string): Promise<SavedItinerary[]> {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data) as SavedItinerary[];
        } catch (e) {
            console.error("Failed to parse itineraries", e);
            return [];
        }
    }

    async getTripItinerary(id: string, _userId: string): Promise<SavedItinerary | null> {
        const all = await this.getAllTripItineraries(_userId);
        return all.find(i => i.id === id) || null;
    }

    async deleteTripItinerary(id: string, _userId: string): Promise<void> {
        if (typeof window === 'undefined') return;
        const current = await this.getAllTripItineraries(_userId);
        const filtered = current.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
}


import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { Itinerary, ItineraryItem, SavedItinerary } from "@/domain/types/itinerary";

const STORAGE_KEY = "trip_itineraries";

export class LocalStorageItineraryRepository implements IItineraryRepository {
    getItinerary(id: string): Promise<Itinerary | null> {
        throw new Error("Method not implemented.");
    }
    saveItinerary(itinerary: Itinerary): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }
    addItem(itineraryId: string, item: ItineraryItem): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }
    removeItem(itineraryId: string, itemId: string): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }
    updateItem(itineraryId: string, item: ItineraryItem): Promise<Itinerary> {
        throw new Error("Method not implemented.");
    }

    async saveTripItinerary(itinerary: SavedItinerary): Promise<void> {
        if (typeof window === 'undefined') return;
        const current = await this.getAllTripItineraries();
        // Check if exists and update, or add new
        const index = current.findIndex(i => i.id === itinerary.id);
        if (index >= 0) {
            current[index] = itinerary;
        } else {
            current.push(itinerary);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }

    async getAllTripItineraries(): Promise<SavedItinerary[]> {
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

    async getTripItinerary(id: string): Promise<SavedItinerary | null> {
        const all = await this.getAllTripItineraries();
        return all.find(i => i.id === id) || null;
    }

    async deleteTripItinerary(id: string): Promise<void> {
        if (typeof window === 'undefined') return;
        const current = await this.getAllTripItineraries();
        const filtered = current.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
}

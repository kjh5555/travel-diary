import { Place } from "@/domain/types/place";
import { ItineraryItem } from "@/domain/types/itinerary";

export class AddToItineraryUseCase {
    execute(place: Place, currentItems: ItineraryItem[]): ItineraryItem[] {
        const newItem: ItineraryItem = {
            id: crypto.randomUUID(),
            place,
            order: currentItems.length,
            durationMinutes: 60, // Default 1 hour stay duration
        };

        return [...currentItems, newItem];
    }
}

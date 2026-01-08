import { ItineraryItem } from "@/domain/types/itinerary";

export class RemoveFromItineraryUseCase {
    execute(itemId: string, currentItems: ItineraryItem[]): ItineraryItem[] {
        const filteredItems = currentItems.filter(item => item.id !== itemId);

        // Reorder remaining items
        return filteredItems.map((item, index) => ({
            ...item,
            order: index,
        }));
    }
}

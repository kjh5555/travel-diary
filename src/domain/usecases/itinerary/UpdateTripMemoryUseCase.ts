
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class UpdateTripMemoryUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(itineraryId: string, updatedItinerary: SavedItinerary, userId: string): Promise<void> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        return this.repository.saveTripItinerary(updatedItinerary, userId);
    }
}

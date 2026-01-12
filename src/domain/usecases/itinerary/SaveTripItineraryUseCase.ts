
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class SaveTripItineraryUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(itinerary: SavedItinerary, userId: string): Promise<void> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        return this.repository.saveTripItinerary(itinerary, userId);
    }
}

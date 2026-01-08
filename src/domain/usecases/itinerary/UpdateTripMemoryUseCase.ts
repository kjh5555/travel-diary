
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class UpdateTripMemoryUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(itineraryId: string, updatedItinerary: SavedItinerary): Promise<void> {
        // Since the repo saves the whole object, we can re-use saveTripItinerary or create a specific update method if needed.
        // For now, simpler to just re-save the modified object.
        return this.repository.saveTripItinerary(updatedItinerary);
    }
}

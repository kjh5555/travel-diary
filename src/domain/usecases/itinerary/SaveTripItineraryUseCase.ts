
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class SaveTripItineraryUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(itinerary: SavedItinerary): Promise<void> {
        return this.repository.saveTripItinerary(itinerary);
    }
}

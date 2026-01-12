
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class GetTripItinerariesUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(userId: string): Promise<SavedItinerary[]> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        return this.repository.getAllTripItineraries(userId);
    }
}

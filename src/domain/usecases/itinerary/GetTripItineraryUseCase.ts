
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class GetTripItineraryUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(id: string, userId: string): Promise<SavedItinerary | null> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        return this.repository.getTripItinerary(id, userId);
    }
}

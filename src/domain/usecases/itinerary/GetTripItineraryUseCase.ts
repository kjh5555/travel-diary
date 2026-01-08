
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class GetTripItineraryUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(id: string): Promise<SavedItinerary | null> {
        return this.repository.getTripItinerary(id);
    }
}

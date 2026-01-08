
import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";

export class GetTripItinerariesUseCase {
    constructor(private repository: IItineraryRepository) { }

    async execute(): Promise<SavedItinerary[]> {
        return this.repository.getAllTripItineraries();
    }
}

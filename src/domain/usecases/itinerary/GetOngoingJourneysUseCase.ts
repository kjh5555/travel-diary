import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";
import { getItineraryStatus } from "@/domain/utils/dateUtils";

export class GetOngoingJourneysUseCase {
    constructor(private repository: IItineraryRepository) {}

    async execute(userId: string): Promise<SavedItinerary[]> {
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        const allItineraries = await this.repository.getAllTripItineraries(userId);
        
        return allItineraries.filter(itinerary => 
            getItineraryStatus(itinerary.startDate, itinerary.endDate) === 'ongoing'
        );
    }
}

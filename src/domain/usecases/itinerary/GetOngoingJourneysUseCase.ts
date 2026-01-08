import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";
import { getItineraryStatus } from "@/domain/utils/dateUtils";

export class GetOngoingJourneysUseCase {
    constructor(private repository: IItineraryRepository) {}

    async execute(): Promise<SavedItinerary[]> {
        const allItineraries = await this.repository.getAllTripItineraries();
        
        return allItineraries.filter(itinerary => 
            getItineraryStatus(itinerary.startDate, itinerary.endDate) === 'ongoing'
        );
    }
}

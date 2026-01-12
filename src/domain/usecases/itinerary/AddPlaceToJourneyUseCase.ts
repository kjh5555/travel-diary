import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary, SavedItineraryPlace } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";

export interface AddPlaceToJourneyParams {
    place: Place;
    journeyId: string;
    day: number;
    userId: string;
}

export class AddPlaceToJourneyUseCase {
    constructor(private repository: IItineraryRepository) {}

    async execute(params: AddPlaceToJourneyParams): Promise<SavedItinerary> {
        const { place, journeyId, day, userId } = params;
        
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        
        const journey = await this.repository.getTripItinerary(journeyId, userId);
        
        if (!journey) {
            throw new Error(`Journey with id ${journeyId} not found`);
        }
        
        const newPlace: SavedItineraryPlace = {
            place,
            day,
            isDayTransition: false
        };
        
        const updatedItems = [...journey.items, newPlace];
        
        const updatedJourney: SavedItinerary = {
            ...journey,
            items: updatedItems
        };
        
        await this.repository.saveTripItinerary(updatedJourney, userId);
        
        return updatedJourney;
    }
}

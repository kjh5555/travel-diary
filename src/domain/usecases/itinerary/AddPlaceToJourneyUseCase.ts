import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary, SavedItineraryPlace } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";

export interface AddPlaceToJourneyParams {
    place: Place;
    journeyId: string;
    day: number;
}

export class AddPlaceToJourneyUseCase {
    constructor(private repository: IItineraryRepository) {}

    async execute(params: AddPlaceToJourneyParams): Promise<SavedItinerary> {
        const { place, journeyId, day } = params;
        
        const journey = await this.repository.getTripItinerary(journeyId);
        
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
        
        await this.repository.saveTripItinerary(updatedJourney);
        
        return updatedJourney;
    }
}

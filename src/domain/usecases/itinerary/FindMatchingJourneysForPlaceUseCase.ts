import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { SavedItinerary } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import { getItineraryStatus } from "@/domain/utils/dateUtils";
import { getJourneyCountry, getPlaceCountry, countriesMatch } from "@/domain/utils/countryUtils";

export interface MatchingJourneysResult {
    journeys: SavedItinerary[];
    placeCountry: string | null;
    hasOngoingJourneys: boolean;
}

export class FindMatchingJourneysForPlaceUseCase {
    constructor(private repository: IItineraryRepository) {}

    async execute(place: Place): Promise<MatchingJourneysResult> {
        const allItineraries = await this.repository.getAllTripItineraries();
        
        const ongoingJourneys = allItineraries.filter(itinerary => 
            getItineraryStatus(itinerary.startDate, itinerary.endDate) === 'ongoing'
        );
        
        const placeCountry = getPlaceCountry(place);
        
        if (!placeCountry) {
            return {
                journeys: ongoingJourneys,
                placeCountry: null,
                hasOngoingJourneys: ongoingJourneys.length > 0
            };
        }
        
        const matchingJourneys = ongoingJourneys.filter(journey => {
            const journeyCountry = getJourneyCountry(journey);
            return countriesMatch(placeCountry, journeyCountry);
        });
        
        return {
            journeys: matchingJourneys,
            placeCountry,
            hasOngoingJourneys: ongoingJourneys.length > 0
        };
    }
}

import { Place } from "./place";

export interface IRecommendationRepository {
    getRecommendations(place: Place): Promise<Place[]>;
}

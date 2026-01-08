import { IRecommendationRepository } from "@/domain/types/recommendation";
import { Place } from "@/domain/types/place";

export class GetRecommendationsUseCase {
    constructor(private recommendationRepository: IRecommendationRepository) { }

    async execute(place: Place): Promise<Place[]> {
        return this.recommendationRepository.getRecommendations(place);
    }
}

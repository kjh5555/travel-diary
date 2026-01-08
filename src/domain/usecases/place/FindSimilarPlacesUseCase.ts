import { IPlaceRepository } from "@/domain/repositories/IPlaceRepository";
import { Place } from "@/domain/types/place";

export class FindSimilarPlacesUseCase {
    constructor(private repository: IPlaceRepository) { }

    async execute(targetPlace: Place, limit: number = 5): Promise<Place[]> {
        if (!targetPlace.types || targetPlace.types.length === 0) {
            return [];
        }

        // Use the first type as search query
        const primaryType = targetPlace.types[0];
        const searchQuery = primaryType.replace(/_/g, ' ');

        try {
            const results = await this.repository.searchPlaces({
                query: searchQuery,
                location: targetPlace.location // Optimization: Search near the target place
            });

            // Filter out the original place and limit results
            return results
                .filter(place => place.id !== targetPlace.id)
                .slice(0, limit);
        } catch (error) {
            throw error;
        }
    }
}

import { IPlaceRepository } from "@/domain/repositories/IPlaceRepository";
import { Place, SearchPlacesOptions } from "@/domain/types/place";

export class SearchPlacesUseCase {
    constructor(private repository: IPlaceRepository) { }

    async execute(options: SearchPlacesOptions): Promise<Place[]> {
        if (!options.query || options.query.trim().length === 0) {
            throw new Error("Search query cannot be empty");
        }

        return await this.repository.searchPlaces({
            ...options,
            query: options.query.trim()
        });
    }
}

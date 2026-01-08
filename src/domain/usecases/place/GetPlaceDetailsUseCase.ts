import { IPlaceRepository } from "@/domain/repositories/IPlaceRepository";
import { Place } from "@/domain/types/place";

export class GetPlaceDetailsUseCase {
    constructor(private repository: IPlaceRepository) {}

    async execute(placeId: string): Promise<Place | null> {
        if (!placeId || placeId.trim().length === 0) {
            throw new Error("Place ID cannot be empty");
        }

        return await this.repository.getPlaceDetails(placeId.trim());
    }
}

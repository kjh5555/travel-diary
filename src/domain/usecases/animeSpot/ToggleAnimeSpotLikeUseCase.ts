import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot } from "@/domain/types/animeSpot";

export class ToggleAnimeSpotLikeUseCase {
    constructor(private repository: IAnimeSpotRepository) {}

    async execute(id: string, userId: string): Promise<AnimeSpot | null> {
        if (!id || id.trim().length === 0) {
            throw new Error("AnimeSpot ID cannot be empty");
        }
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID is required");
        }
        return this.repository.toggleLike(id, userId);
    }
}

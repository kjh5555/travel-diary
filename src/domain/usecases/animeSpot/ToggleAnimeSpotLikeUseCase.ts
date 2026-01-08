import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot } from "@/domain/types/animeSpot";

export class ToggleAnimeSpotLikeUseCase {
    constructor(private repository: IAnimeSpotRepository) {}

    async execute(id: string): Promise<AnimeSpot | null> {
        if (!id || id.trim().length === 0) {
            throw new Error("AnimeSpot ID cannot be empty");
        }
        return this.repository.toggleLike(id);
    }
}

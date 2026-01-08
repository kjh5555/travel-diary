import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot } from "@/domain/types/animeSpot";

export class SearchAnimeSpotsUseCase {
    constructor(private repository: IAnimeSpotRepository) {}

    async execute(query: string): Promise<AnimeSpot[]> {
        if (!query || query.trim().length === 0) {
            return this.repository.getAll();
        }
        return this.repository.search(query.trim());
    }
}

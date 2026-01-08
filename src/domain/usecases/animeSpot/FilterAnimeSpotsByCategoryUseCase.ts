import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot, AnimeCategory } from "@/domain/types/animeSpot";

export class FilterAnimeSpotsByCategoryUseCase {
    constructor(private repository: IAnimeSpotRepository) {}

    async execute(category: AnimeCategory): Promise<AnimeSpot[]> {
        return this.repository.getByCategory(category);
    }
}

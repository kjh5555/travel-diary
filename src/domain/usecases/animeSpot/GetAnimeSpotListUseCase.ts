import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot } from "@/domain/types/animeSpot";

export class GetAnimeSpotListUseCase {
    constructor(private repository: IAnimeSpotRepository) {}

    async execute(): Promise<AnimeSpot[]> {
        return this.repository.getAll();
    }
}

import { AnimeSpot, AnimeCategory } from "../types/animeSpot";

export interface IAnimeSpotRepository {
    getAll(): Promise<AnimeSpot[]>;
    getById(id: string): Promise<AnimeSpot | null>;
    getByCategory(category: AnimeCategory): Promise<AnimeSpot[]>;
    search(query: string): Promise<AnimeSpot[]>;
    toggleLike(id: string): Promise<AnimeSpot | null>;
}

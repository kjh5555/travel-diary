import { AnimeSpot, AnimeCategory } from "../types/animeSpot";

export interface IAnimeSpotRepository {
    getAll(userId?: string): Promise<AnimeSpot[]>;
    getById(id: string, userId?: string): Promise<AnimeSpot | null>;
    getByCategory(category: AnimeCategory, userId?: string): Promise<AnimeSpot[]>;
    search(query: string, userId?: string): Promise<AnimeSpot[]>;
    toggleLike(id: string, userId: string): Promise<AnimeSpot | null>;
    getLikedByUser(userId: string): Promise<AnimeSpot[]>;
}

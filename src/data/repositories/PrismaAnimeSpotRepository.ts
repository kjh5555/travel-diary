import { IAnimeSpotRepository } from "@/domain/repositories/IAnimeSpotRepository";
import { AnimeSpot, AnimeCategory } from "@/domain/types/animeSpot";
import prisma from "@/lib/prisma";
import { AnimeSpot as PrismaAnimeSpot, AnimeSpotLike } from "@prisma/client";

type AnimeSpotWithLikes = PrismaAnimeSpot & {
    likes?: AnimeSpotLike[];
};

export class PrismaAnimeSpotRepository implements IAnimeSpotRepository {
    private mapToAnimeSpot(dbSpot: AnimeSpotWithLikes, isLiked: boolean = false): AnimeSpot {
        return {
            id: dbSpot.id,
            title: dbSpot.title,
            sceneName: dbSpot.sceneName,
            originalImageUrl: dbSpot.originalImageUrl,
            realImageUrl: dbSpot.realImageUrl || undefined,
            lat: dbSpot.lat,
            lng: dbSpot.lng,
            guideTip: dbSpot.guideTip,
            category: dbSpot.category as AnimeCategory,
            rating: dbSpot.rating,
            location: dbSpot.location,
            description: dbSpot.description || undefined,
            isLiked,
        };
    }

    async getAll(userId?: string): Promise<AnimeSpot[]> {
        const spots = await prisma.animeSpot.findMany({
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as AnimeSpotWithLikes;
            return this.mapToAnimeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async getById(id: string, userId?: string): Promise<AnimeSpot | null> {
        const spot = await prisma.animeSpot.findUnique({
            where: { id },
            include: { likes: userId ? { where: { userId } } : false },
        });

        if (!spot) return null;
        const spotWithLikes = spot as AnimeSpotWithLikes;
        return this.mapToAnimeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
    }

    async getByCategory(category: AnimeCategory, userId?: string): Promise<AnimeSpot[]> {
        const spots = await prisma.animeSpot.findMany({
            where: { category },
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as AnimeSpotWithLikes;
            return this.mapToAnimeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async search(query: string, userId?: string): Promise<AnimeSpot[]> {
        const lowercaseQuery = query.toLowerCase();
        const spots = await prisma.animeSpot.findMany({
            where: {
                OR: [
                    { title: { contains: lowercaseQuery } },
                    { sceneName: { contains: lowercaseQuery } },
                    { location: { contains: lowercaseQuery } },
                    { description: { contains: lowercaseQuery } },
                ],
            },
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as AnimeSpotWithLikes;
            return this.mapToAnimeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async toggleLike(id: string, userId: string): Promise<AnimeSpot | null> {
        const existingLike = await prisma.animeSpotLike.findUnique({
            where: {
                userId_animeSpotId: { userId, animeSpotId: id }
            },
        });

        if (existingLike) {
            await prisma.animeSpotLike.delete({
                where: { id: existingLike.id }
            });
        } else {
            await prisma.animeSpotLike.create({
                data: { userId, animeSpotId: id }
            });
        }

        return this.getById(id, userId);
    }

    async getLikedByUser(userId: string): Promise<AnimeSpot[]> {
        const likes = await prisma.animeSpotLike.findMany({
            where: { userId },
            include: { animeSpot: true },
            orderBy: { createdAt: "desc" },
        });

        return likes.map(like => this.mapToAnimeSpot(like.animeSpot, true));
    }
}

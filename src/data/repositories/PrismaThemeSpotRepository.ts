import { IThemeSpotRepository } from "@/domain/repositories/IThemeSpotRepository";
import { ThemeSpot, ThemeCategoryId, ThemeSubCategory } from "@/domain/types/themeSpot";
import prisma from "@/lib/prisma";
import { ThemeSpot as PrismaThemeSpot, ThemeSpotLike } from "@prisma/client";

type ThemeSpotWithLikes = PrismaThemeSpot & {
    likes?: ThemeSpotLike[];
};

export class PrismaThemeSpotRepository implements IThemeSpotRepository {
    private mapToThemeSpot(dbSpot: ThemeSpotWithLikes, isLiked: boolean = false): ThemeSpot {
        return {
            id: dbSpot.id,
            themeId: dbSpot.themeId as ThemeCategoryId,
            title: dbSpot.title,
            subtitle: dbSpot.subtitle,
            imageUrl: dbSpot.imageUrl,
            lat: dbSpot.lat,
            lng: dbSpot.lng,
            tip: dbSpot.tip,
            subCategory: dbSpot.subCategory as ThemeSubCategory,
            rating: dbSpot.rating,
            location: dbSpot.location,
            description: dbSpot.description || undefined,
            isLiked,
        };
    }

    async getAll(userId?: string): Promise<ThemeSpot[]> {
        const spots = await prisma.themeSpot.findMany({
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as ThemeSpotWithLikes;
            return this.mapToThemeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async getById(id: string, userId?: string): Promise<ThemeSpot | null> {
        const spot = await prisma.themeSpot.findUnique({
            where: { id },
            include: { likes: userId ? { where: { userId } } : false },
        });

        if (!spot) return null;
        const spotWithLikes = spot as ThemeSpotWithLikes;
        return this.mapToThemeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
    }

    async getByTheme(themeId: ThemeCategoryId, userId?: string): Promise<ThemeSpot[]> {
        const spots = await prisma.themeSpot.findMany({
            where: { themeId },
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as ThemeSpotWithLikes;
            return this.mapToThemeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async getBySubCategory(themeId: ThemeCategoryId, subCategory: ThemeSubCategory, userId?: string): Promise<ThemeSpot[]> {
        const spots = await prisma.themeSpot.findMany({
            where: { themeId, subCategory },
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as ThemeSpotWithLikes;
            return this.mapToThemeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async search(query: string, themeId?: ThemeCategoryId, userId?: string): Promise<ThemeSpot[]> {
        const lowercaseQuery = query.toLowerCase();
        const spots = await prisma.themeSpot.findMany({
            where: {
                AND: [
                    themeId ? { themeId } : {},
                    {
                        OR: [
                            { title: { contains: lowercaseQuery } },
                            { subtitle: { contains: lowercaseQuery } },
                            { location: { contains: lowercaseQuery } },
                            { description: { contains: lowercaseQuery } },
                        ],
                    },
                ],
            },
            include: { likes: userId ? { where: { userId } } : false },
            orderBy: { rating: "desc" },
        });

        return spots.map(spot => {
            const spotWithLikes = spot as ThemeSpotWithLikes;
            return this.mapToThemeSpot(spotWithLikes, (spotWithLikes.likes?.length ?? 0) > 0);
        });
    }

    async toggleLike(id: string, userId: string): Promise<ThemeSpot | null> {
        const existingLike = await prisma.themeSpotLike.findUnique({
            where: {
                userId_themeSpotId: { userId, themeSpotId: id }
            },
        });

        if (existingLike) {
            await prisma.themeSpotLike.delete({
                where: { id: existingLike.id }
            });
        } else {
            await prisma.themeSpotLike.create({
                data: { userId, themeSpotId: id }
            });
        }

        return this.getById(id, userId);
    }

    async getLikedByUser(userId: string): Promise<ThemeSpot[]> {
        const likes = await prisma.themeSpotLike.findMany({
            where: { userId },
            include: { themeSpot: true },
            orderBy: { createdAt: "desc" },
        });

        return likes.map(like => this.mapToThemeSpot(like.themeSpot, true));
    }
}

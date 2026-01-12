import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";
import {
    CustomTheme,
    CreateCustomThemeInput,
    UpdateCustomThemeInput,
    CustomThemePlace,
    DEFAULT_THEME_COLOR,
    DEFAULT_THEME_ICON
} from "@/domain/types/customTheme";
import { Place } from "@/domain/types/place";
import prisma from "@/lib/prisma";
import { CustomTheme as PrismaCustomTheme, CustomThemePlace as PrismaCustomThemePlace } from "@prisma/client";

type CustomThemeWithPlaces = PrismaCustomTheme & {
    places?: PrismaCustomThemePlace[];
};

export class PrismaCustomThemeRepository implements ICustomThemeRepository {
    private mapToCustomTheme(dbTheme: CustomThemeWithPlaces): CustomTheme {
        return {
            id: dbTheme.id,
            name: dbTheme.name,
            description: dbTheme.description || undefined,
            coverImage: dbTheme.coverImage || undefined,
            color: dbTheme.color,
            icon: dbTheme.icon,
            places: dbTheme.places?.map(p => this.mapToCustomThemePlace(p)) || [],
            createdAt: dbTheme.createdAt.toISOString(),
            updatedAt: dbTheme.updatedAt.toISOString(),
        };
    }

    private mapToCustomThemePlace(dbPlace: PrismaCustomThemePlace): CustomThemePlace {
        return {
            id: dbPlace.id,
            place: {
                id: dbPlace.placeId,
                name: dbPlace.placeName,
                address: dbPlace.placeAddress,
                location: { lat: dbPlace.placeLat, lng: dbPlace.placeLng },
                rating: dbPlace.placeRating || undefined,
                photos: dbPlace.placePhotos ? JSON.parse(dbPlace.placePhotos) : undefined,
                types: dbPlace.placeTypes ? JSON.parse(dbPlace.placeTypes) : undefined,
            },
            note: dbPlace.note || undefined,
            addedAt: dbPlace.addedAt.toISOString(),
        };
    }

    async getAll(userId: string): Promise<CustomTheme[]> {
        const themes = await prisma.customTheme.findMany({
            where: { userId },
            include: { places: true },
            orderBy: { updatedAt: "desc" },
        });
        return themes.map(t => this.mapToCustomTheme(t));
    }

    async getById(id: string, userId: string): Promise<CustomTheme | null> {
        const theme = await prisma.customTheme.findFirst({
            where: { id, userId },
            include: { places: true },
        });
        return theme ? this.mapToCustomTheme(theme) : null;
    }

    async create(input: CreateCustomThemeInput, userId: string): Promise<CustomTheme> {
        const theme = await prisma.customTheme.create({
            data: {
                userId,
                name: input.name,
                description: input.description,
                coverImage: input.coverImage,
                color: input.color || DEFAULT_THEME_COLOR.value,
                icon: input.icon || DEFAULT_THEME_ICON,
            },
            include: { places: true },
        });
        return this.mapToCustomTheme(theme);
    }

    async update(id: string, input: UpdateCustomThemeInput, userId: string): Promise<CustomTheme | null> {
        const existing = await prisma.customTheme.findFirst({
            where: { id, userId },
        });

        if (!existing) return null;

        const theme = await prisma.customTheme.update({
            where: { id },
            data: {
                name: input.name,
                description: input.description,
                coverImage: input.coverImage,
                color: input.color,
                icon: input.icon,
            },
            include: { places: true },
        });

        return this.mapToCustomTheme(theme);
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const existing = await prisma.customTheme.findFirst({
            where: { id, userId },
        });

        if (!existing) return false;

        await prisma.customTheme.delete({
            where: { id },
        });
        return true;
    }

    async addPlace(themeId: string, place: Place, userId: string, note?: string): Promise<CustomThemePlace | null> {
        const theme = await prisma.customTheme.findFirst({
            where: { id: themeId, userId },
        });
        if (!theme) return null;

        const existing = await prisma.customThemePlace.findUnique({
            where: {
                customThemeId_placeId: { customThemeId: themeId, placeId: place.id }
            },
        });

        if (existing) {
            const updated = await prisma.customThemePlace.update({
                where: { id: existing.id },
                data: { note },
            });
            return this.mapToCustomThemePlace(updated);
        }

        const dbPlace = await prisma.customThemePlace.create({
            data: {
                customThemeId: themeId,
                placeId: place.id,
                placeName: place.name,
                placeAddress: place.address,
                placeLat: place.location.lat,
                placeLng: place.location.lng,
                placeRating: place.rating,
                placePhotos: place.photos ? JSON.stringify(place.photos) : null,
                placeTypes: place.types ? JSON.stringify(place.types) : null,
                note,
            },
        });

        if (!theme.coverImage && place.photos?.[0]) {
            await prisma.customTheme.update({
                where: { id: themeId },
                data: { coverImage: place.photos[0] },
            });
        }

        return this.mapToCustomThemePlace(dbPlace);
    }

    async removePlace(themeId: string, placeId: string, userId: string): Promise<boolean> {
        const theme = await prisma.customTheme.findFirst({
            where: { id: themeId, userId },
        });
        if (!theme) return false;

        const result = await prisma.customThemePlace.deleteMany({
            where: { customThemeId: themeId, placeId },
        });
        return result.count > 0;
    }

    async updatePlaceNote(themeId: string, placeId: string, note: string, userId: string): Promise<CustomThemePlace | null> {
        const theme = await prisma.customTheme.findFirst({
            where: { id: themeId, userId },
        });
        if (!theme) return null;

        const existing = await prisma.customThemePlace.findUnique({
            where: {
                customThemeId_placeId: { customThemeId: themeId, placeId }
            },
        });
        if (!existing) return null;

        const dbPlace = await prisma.customThemePlace.update({
            where: { id: existing.id },
            data: { note },
        });

        return this.mapToCustomThemePlace(dbPlace);
    }
}

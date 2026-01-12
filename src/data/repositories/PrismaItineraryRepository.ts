import { IItineraryRepository } from "@/domain/repositories/IItineraryRepository";
import { Itinerary, ItineraryItem, SavedItinerary, SavedItineraryPlace, Route, PlaceMemory } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import prisma from "@/lib/prisma";
import { SavedItinerary as PrismaSavedItinerary, SavedItineraryPlace as PrismaSavedItineraryPlace } from "@prisma/client";

type SavedItineraryWithPlaces = PrismaSavedItinerary & {
    items?: PrismaSavedItineraryPlace[];
};

export class PrismaItineraryRepository implements IItineraryRepository {
    private mapToSavedItinerary(db: SavedItineraryWithPlaces): SavedItinerary {
        return {
            id: db.id,
            title: db.title || undefined,
            startDate: db.startDate.toISOString().split("T")[0],
            endDate: db.endDate.toISOString().split("T")[0],
            arrivalAirport: db.arrivalAirport ? JSON.parse(db.arrivalAirport) : undefined,
            departureAirport: db.departureAirport ? JSON.parse(db.departureAirport) : undefined,
            items: db.items?.map(item => this.mapToSavedItineraryPlace(item)) || [],
            createdAt: db.createdAt.toISOString(),
            coverImage: db.coverImage || undefined,
            thumbnail: db.thumbnail || undefined,
        };
    }

    private mapToSavedItineraryPlace(db: PrismaSavedItineraryPlace): SavedItineraryPlace {
        const place: Place = {
            id: db.placeId,
            name: db.placeName,
            address: db.placeAddress,
            location: { lat: db.placeLat, lng: db.placeLng },
            rating: db.placeRating || undefined,
            photos: db.placePhotos ? JSON.parse(db.placePhotos) : undefined,
            types: db.placeTypes ? JSON.parse(db.placeTypes) : undefined,
        };

        const memory: PlaceMemory | undefined = db.memoryText || db.memoryImages ? {
            text: db.memoryText || undefined,
            images: db.memoryImages ? JSON.parse(db.memoryImages) : undefined,
            timestamp: db.memoryTimestamp?.toISOString(),
            isLiked: db.memoryIsLiked,
        } : undefined;

        return {
            place,
            routeToNext: db.routeToNext ? JSON.parse(db.routeToNext) : undefined,
            day: db.day,
            isDayTransition: db.isDayTransition,
            memory,
        };
    }

    async getItinerary(_id: string, _userId: string): Promise<Itinerary | null> {
        throw new Error("Method not implemented - use getTripItinerary instead");
    }

    async saveItinerary(_itinerary: Itinerary, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented - use saveTripItinerary instead");
    }

    async addItem(_itineraryId: string, _item: ItineraryItem, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented");
    }

    async removeItem(_itineraryId: string, _itemId: string, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented");
    }

    async updateItem(_itineraryId: string, _item: ItineraryItem, _userId: string): Promise<Itinerary> {
        throw new Error("Method not implemented");
    }

    async saveTripItinerary(itinerary: SavedItinerary, userId: string): Promise<void> {
        const existing = await prisma.savedItinerary.findFirst({
            where: { id: itinerary.id, userId },
        });

        const data = {
            userId,
            title: itinerary.title,
            startDate: new Date(itinerary.startDate),
            endDate: new Date(itinerary.endDate),
            arrivalAirport: itinerary.arrivalAirport ? JSON.stringify(itinerary.arrivalAirport) : null,
            departureAirport: itinerary.departureAirport ? JSON.stringify(itinerary.departureAirport) : null,
            coverImage: itinerary.coverImage,
            thumbnail: itinerary.thumbnail,
        };

        if (existing) {
            await prisma.savedItineraryPlace.deleteMany({
                where: { itineraryId: itinerary.id },
            });

            await prisma.savedItinerary.update({
                where: { id: itinerary.id },
                data,
            });
        } else {
            await prisma.savedItinerary.create({
                data: {
                    id: itinerary.id,
                    ...data,
                },
            });
        }

        let orderInDay = 0;
        let currentDay = 0;

        for (const item of itinerary.items) {
            if (item.day !== currentDay) {
                currentDay = item.day;
                orderInDay = 0;
            }

            await prisma.savedItineraryPlace.create({
                data: {
                    itineraryId: itinerary.id,
                    day: item.day,
                    orderInDay: orderInDay++,
                    isDayTransition: item.isDayTransition || false,
                    placeId: item.place.id,
                    placeName: item.place.name,
                    placeAddress: item.place.address,
                    placeLat: item.place.location.lat,
                    placeLng: item.place.location.lng,
                    placeRating: item.place.rating,
                    placePhotos: item.place.photos ? JSON.stringify(item.place.photos) : null,
                    placeTypes: item.place.types ? JSON.stringify(item.place.types) : null,
                    routeToNext: item.routeToNext ? JSON.stringify(item.routeToNext) : null,
                    memoryText: item.memory?.text,
                    memoryImages: item.memory?.images ? JSON.stringify(item.memory.images) : null,
                    memoryTimestamp: item.memory?.timestamp ? new Date(item.memory.timestamp) : null,
                    memoryIsLiked: item.memory?.isLiked || false,
                },
            });
        }
    }

    async getAllTripItineraries(userId: string): Promise<SavedItinerary[]> {
        const itineraries = await prisma.savedItinerary.findMany({
            where: { userId },
            include: {
                items: {
                    orderBy: [{ day: "asc" }, { orderInDay: "asc" }],
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return itineraries.map(it => this.mapToSavedItinerary(it));
    }

    async getTripItinerary(id: string, userId: string): Promise<SavedItinerary | null> {
        const itinerary = await prisma.savedItinerary.findFirst({
            where: { id, userId },
            include: {
                items: {
                    orderBy: [{ day: "asc" }, { orderInDay: "asc" }],
                },
            },
        });

        return itinerary ? this.mapToSavedItinerary(itinerary) : null;
    }

    async deleteTripItinerary(id: string, userId: string): Promise<void> {
        const existing = await prisma.savedItinerary.findFirst({
            where: { id, userId },
        });

        if (existing) {
            await prisma.savedItinerary.delete({
                where: { id },
            });
        }
    }
}

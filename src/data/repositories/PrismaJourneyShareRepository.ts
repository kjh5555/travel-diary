import { IJourneyShareRepository } from "@/domain/repositories/IJourneyShareRepository";
import { JourneyShare, SharePermission, TripComment, TripPhoto, SharedJourneyInfo } from "@/domain/types/friend";
import { SavedItinerary, SavedItineraryPlace, SavedItineraryWithShare, PlaceMemory, TravelType } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";
import prisma from "@/lib/prisma";

export class PrismaJourneyShareRepository implements IJourneyShareRepository {
    async shareJourney(
        itineraryId: string,
        ownerId: string,
        sharedWithId: string,
        permission: SharePermission
    ): Promise<JourneyShare> {
        const itinerary = await prisma.savedItinerary.findFirst({
            where: { id: itineraryId, userId: ownerId }
        });

        if (!itinerary) {
            throw new Error("여정을 찾을 수 없거나 권한이 없습니다.");
        }

        const existingShare = await prisma.journeyShare.findUnique({
            where: {
                itineraryId_sharedWithId: { itineraryId, sharedWithId }
            }
        });

        if (existingShare) {
            throw new Error("이미 공유된 사용자입니다.");
        }

        const share = await prisma.journeyShare.create({
            data: {
                itineraryId,
                ownerId,
                sharedWithId,
                permission
            },
            include: {
                owner: true,
                sharedWith: true
            }
        });

        return this.mapToJourneyShare(share);
    }

    async updateSharePermission(shareId: string, ownerId: string, permission: SharePermission): Promise<JourneyShare> {
        const share = await prisma.journeyShare.findUnique({
            where: { id: shareId }
        });

        if (!share || share.ownerId !== ownerId) {
            throw new Error("공유 정보를 찾을 수 없거나 권한이 없습니다.");
        }

        const updated = await prisma.journeyShare.update({
            where: { id: shareId },
            data: { permission },
            include: { owner: true, sharedWith: true }
        });

        return this.mapToJourneyShare(updated);
    }

    async removeShare(shareId: string, ownerId: string): Promise<void> {
        const share = await prisma.journeyShare.findUnique({
            where: { id: shareId }
        });

        if (!share || share.ownerId !== ownerId) {
            throw new Error("공유 정보를 찾을 수 없거나 권한이 없습니다.");
        }

        await prisma.journeyShare.delete({
            where: { id: shareId }
        });
    }

    async getSharesForJourney(itineraryId: string, ownerId: string): Promise<JourneyShare[]> {
        const shares = await prisma.journeyShare.findMany({
            where: { itineraryId, ownerId },
            include: { owner: true, sharedWith: true },
            orderBy: { createdAt: 'desc' }
        });

        return shares.map(s => this.mapToJourneyShare(s));
    }

    async getSharedWithMe(userId: string): Promise<SharedJourneyInfo[]> {
        const shares = await prisma.journeyShare.findMany({
            where: { sharedWithId: userId },
            include: {
                itinerary: true,
                owner: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return shares.map(s => ({
            itineraryId: s.itineraryId,
            title: s.itinerary.title || undefined,
            permission: s.permission as SharePermission,
            owner: {
                id: s.owner.id,
                name: s.owner.name,
                email: s.owner.email,
                image: s.owner.image
            },
            sharedAt: s.createdAt.toISOString()
        }));
    }

    async getSharedWithMeFull(userId: string): Promise<SavedItineraryWithShare[]> {
        const shares = await prisma.journeyShare.findMany({
            where: { sharedWithId: userId },
            include: {
                itinerary: {
                    include: {
                        items: {
                            orderBy: [{ day: 'asc' }, { orderInDay: 'asc' }]
                        }
                    }
                },
                owner: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return shares.map(share => {
            const itinerary = this.mapToSavedItinerary(share.itinerary);
            return {
                ...itinerary,
                shareInfo: {
                    isShared: true,
                    sharedBy: {
                        id: share.owner.id,
                        name: share.owner.name,
                        email: share.owner.email,
                        image: share.owner.image
                    },
                    permission: share.permission as 'VIEW' | 'EDIT',
                    sharedAt: share.createdAt.toISOString()
                }
            };
        });
    }

    async getSharedJourney(itineraryId: string, userId: string): Promise<SavedItinerary | null> {
        const share = await prisma.journeyShare.findFirst({
            where: { itineraryId, sharedWithId: userId }
        });

        const itinerary = await prisma.savedItinerary.findFirst({
            where: {
                id: itineraryId,
                OR: [
                    { userId },
                    { shares: { some: { sharedWithId: userId } } }
                ]
            },
            include: {
                items: {
                    orderBy: [{ day: 'asc' }, { orderInDay: 'asc' }],
                    include: {
                        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
                        photos: { include: { user: true }, orderBy: { createdAt: 'desc' } }
                    }
                }
            }
        });

        if (!itinerary) return null;

        return this.mapToSavedItinerary(itinerary);
    }

    async hasAccess(itineraryId: string, userId: string): Promise<{ hasAccess: boolean; permission: SharePermission | null }> {
        const itinerary = await prisma.savedItinerary.findFirst({
            where: { id: itineraryId, userId }
        });

        if (itinerary) {
            return { hasAccess: true, permission: 'EDIT' };
        }

        const share = await prisma.journeyShare.findFirst({
            where: { itineraryId, sharedWithId: userId }
        });

        if (share) {
            return { hasAccess: true, permission: share.permission as SharePermission };
        }

        return { hasAccess: false, permission: null };
    }

    async addComment(placeId: string, userId: string, content: string): Promise<TripComment> {
        const comment = await prisma.tripComment.create({
            data: { placeId, userId, content },
            include: { user: true }
        });

        return this.mapToTripComment(comment);
    }

    async updateComment(commentId: string, userId: string, content: string): Promise<TripComment> {
        const comment = await prisma.tripComment.findUnique({
            where: { id: commentId }
        });

        if (!comment || comment.userId !== userId) {
            throw new Error("댓글을 찾을 수 없거나 권한이 없습니다.");
        }

        const updated = await prisma.tripComment.update({
            where: { id: commentId },
            data: { content },
            include: { user: true }
        });

        return this.mapToTripComment(updated);
    }

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = await prisma.tripComment.findUnique({
            where: { id: commentId }
        });

        if (!comment || comment.userId !== userId) {
            throw new Error("댓글을 찾을 수 없거나 권한이 없습니다.");
        }

        await prisma.tripComment.delete({
            where: { id: commentId }
        });
    }

    async getComments(placeId: string): Promise<TripComment[]> {
        const comments = await prisma.tripComment.findMany({
            where: { placeId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        return comments.map(c => this.mapToTripComment(c));
    }

    async addPhoto(placeId: string, userId: string, imageUrl: string, caption?: string): Promise<TripPhoto> {
        const photo = await prisma.tripPhoto.create({
            data: { placeId, userId, imageUrl, caption },
            include: { user: true }
        });

        return this.mapToTripPhoto(photo);
    }

    async deletePhoto(photoId: string, userId: string): Promise<void> {
        const photo = await prisma.tripPhoto.findUnique({
            where: { id: photoId }
        });

        if (!photo || photo.userId !== userId) {
            throw new Error("사진을 찾을 수 없거나 권한이 없습니다.");
        }

        await prisma.tripPhoto.delete({
            where: { id: photoId }
        });
    }

    async getPhotos(placeId: string): Promise<TripPhoto[]> {
        const photos = await prisma.tripPhoto.findMany({
            where: { placeId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        return photos.map(p => this.mapToTripPhoto(p));
    }

    private mapToJourneyShare(db: {
        id: string;
        itineraryId: string;
        ownerId: string;
        sharedWithId: string;
        permission: string;
        createdAt: Date;
        owner?: { id: string; name: string | null; email: string | null; image: string | null };
        sharedWith?: { id: string; name: string | null; email: string | null; image: string | null };
    }): JourneyShare {
        return {
            id: db.id,
            itineraryId: db.itineraryId,
            ownerId: db.ownerId,
            sharedWithId: db.sharedWithId,
            permission: db.permission as SharePermission,
            owner: db.owner ? {
                id: db.owner.id,
                name: db.owner.name,
                email: db.owner.email,
                image: db.owner.image
            } : undefined,
            sharedWith: db.sharedWith ? {
                id: db.sharedWith.id,
                name: db.sharedWith.name,
                email: db.sharedWith.email,
                image: db.sharedWith.image
            } : undefined,
            createdAt: db.createdAt.toISOString()
        };
    }

    private mapToTripComment(db: {
        id: string;
        placeId: string;
        userId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        user?: { id: string; name: string | null; email: string | null; image: string | null };
    }): TripComment {
        return {
            id: db.id,
            placeId: db.placeId,
            userId: db.userId,
            content: db.content,
            user: db.user ? {
                id: db.user.id,
                name: db.user.name,
                email: db.user.email,
                image: db.user.image
            } : undefined,
            createdAt: db.createdAt.toISOString(),
            updatedAt: db.updatedAt.toISOString()
        };
    }

    private mapToTripPhoto(db: {
        id: string;
        placeId: string;
        userId: string;
        imageUrl: string;
        caption: string | null;
        createdAt: Date;
        user?: { id: string; name: string | null; email: string | null; image: string | null };
    }): TripPhoto {
        return {
            id: db.id,
            placeId: db.placeId,
            userId: db.userId,
            imageUrl: db.imageUrl,
            caption: db.caption || undefined,
            user: db.user ? {
                id: db.user.id,
                name: db.user.name,
                email: db.user.email,
                image: db.user.image
            } : undefined,
            createdAt: db.createdAt.toISOString()
        };
    }

    private mapToSavedItinerary(db: {
        id: string;
        userId: string;
        title: string | null;
        travelType: string;
        startDate: Date;
        endDate: Date;
        arrivalAirport: string | null;
        departureAirport: string | null;
        coverImage: string | null;
        thumbnail: string | null;
        createdAt: Date;
        items: Array<{
            id: string;
            day: number;
            isDayTransition: boolean;
            placeId: string;
            placeName: string;
            placeAddress: string;
            placeLat: number;
            placeLng: number;
            placeRating: number | null;
            placePhotos: string | null;
            placeTypes: string | null;
            routeToNext: string | null;
            memoryText: string | null;
            memoryImages: string | null;
            memoryTimestamp: Date | null;
            memoryIsLiked: boolean;
            comments?: Array<{
                id: string;
                userId: string;
                content: string;
                createdAt: Date;
                updatedAt: Date;
                user: { id: string; name: string | null; email: string | null; image: string | null };
            }>;
            photos?: Array<{
                id: string;
                userId: string;
                imageUrl: string;
                caption: string | null;
                createdAt: Date;
                user: { id: string; name: string | null; email: string | null; image: string | null };
            }>;
        }>;
    }): SavedItinerary {
        return {
            id: db.id,
            title: db.title || undefined,
            travelType: db.travelType as TravelType,
            startDate: db.startDate.toISOString().split('T')[0],
            endDate: db.endDate.toISOString().split('T')[0],
            arrivalAirport: db.arrivalAirport ? JSON.parse(db.arrivalAirport) : undefined,
            departureAirport: db.departureAirport ? JSON.parse(db.departureAirport) : undefined,
            coverImage: db.coverImage || undefined,
            thumbnail: db.thumbnail || undefined,
            createdAt: db.createdAt.toISOString(),
            items: db.items.map(item => {
                const place: Place = {
                    id: item.placeId,
                    name: item.placeName,
                    address: item.placeAddress,
                    location: { lat: item.placeLat, lng: item.placeLng },
                    rating: item.placeRating || undefined,
                    photos: item.placePhotos ? JSON.parse(item.placePhotos) : undefined,
                    types: item.placeTypes ? JSON.parse(item.placeTypes) : undefined
                };

                const memory: PlaceMemory | undefined = item.memoryText || item.memoryImages ? {
                    text: item.memoryText || undefined,
                    images: item.memoryImages ? JSON.parse(item.memoryImages) : undefined,
                    timestamp: item.memoryTimestamp?.toISOString(),
                    isLiked: item.memoryIsLiked
                } : undefined;

                return {
                    place,
                    routeToNext: item.routeToNext ? JSON.parse(item.routeToNext) : undefined,
                    day: item.day,
                    isDayTransition: item.isDayTransition,
                    memory
                } as SavedItineraryPlace;
            })
        };
    }
}

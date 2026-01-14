import { JourneyShare, SharePermission, TripComment, TripPhoto, SharedJourneyInfo } from "@/domain/types/friend";
import { SavedItinerary, SavedItineraryWithShare } from "@/domain/types/itinerary";

export interface IJourneyShareRepository {
    shareJourney(itineraryId: string, ownerId: string, sharedWithId: string, permission: SharePermission): Promise<JourneyShare>;
    updateSharePermission(shareId: string, ownerId: string, permission: SharePermission): Promise<JourneyShare>;
    removeShare(shareId: string, ownerId: string): Promise<void>;
    
    getSharesForJourney(itineraryId: string, ownerId: string): Promise<JourneyShare[]>;
    getSharedWithMe(userId: string): Promise<SharedJourneyInfo[]>;
    getSharedWithMeFull(userId: string): Promise<SavedItineraryWithShare[]>;
    getSharedJourney(itineraryId: string, userId: string): Promise<SavedItinerary | null>;
    hasAccess(itineraryId: string, userId: string): Promise<{ hasAccess: boolean; permission: SharePermission | null }>;
    
    addComment(placeId: string, userId: string, content: string): Promise<TripComment>;
    updateComment(commentId: string, userId: string, content: string): Promise<TripComment>;
    deleteComment(commentId: string, userId: string): Promise<void>;
    getComments(placeId: string): Promise<TripComment[]>;
    
    addPhoto(placeId: string, userId: string, imageUrl: string, caption?: string): Promise<TripPhoto>;
    deletePhoto(photoId: string, userId: string): Promise<void>;
    getPhotos(placeId: string): Promise<TripPhoto[]>;
}

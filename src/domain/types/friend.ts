import { User } from "@/domain/entities/User";

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type SharePermission = 'VIEW' | 'EDIT';

export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: FriendRequestStatus;
    message?: string;
    sender?: User;
    receiver?: User;
    createdAt: string;
}

export interface Friendship {
    id: string;
    userId: string;
    friendId: string;
    friend: User;
    createdAt: string;
}

export interface JourneyShare {
    id: string;
    itineraryId: string;
    ownerId: string;
    sharedWithId: string;
    permission: SharePermission;
    owner?: User;
    sharedWith?: User;
    createdAt: string;
}

export interface TripComment {
    id: string;
    placeId: string;
    userId: string;
    content: string;
    user?: User;
    createdAt: string;
    updatedAt: string;
}

export interface TripPhoto {
    id: string;
    placeId: string;
    userId: string;
    imageUrl: string;
    caption?: string;
    user?: User;
    createdAt: string;
}

export interface FriendWithProfile extends User {
    friendshipId: string;
    friendsSince: string;
}

export interface SharedJourneyInfo {
    itineraryId: string;
    title?: string;
    permission: SharePermission;
    owner: User;
    sharedAt: string;
}

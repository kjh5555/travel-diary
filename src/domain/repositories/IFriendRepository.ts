import { User } from "@/domain/entities/User";
import { FriendRequest, Friendship, FriendWithProfile } from "@/domain/types/friend";

export interface IFriendRepository {
    sendFriendRequest(senderId: string, receiverEmail: string, message?: string): Promise<FriendRequest>;
    acceptFriendRequest(requestId: string, userId: string): Promise<Friendship>;
    rejectFriendRequest(requestId: string, userId: string): Promise<void>;
    cancelFriendRequest(requestId: string, userId: string): Promise<void>;
    
    getSentRequests(userId: string): Promise<FriendRequest[]>;
    getReceivedRequests(userId: string): Promise<FriendRequest[]>;
    getPendingRequestsCount(userId: string): Promise<number>;
    
    getFriends(userId: string): Promise<FriendWithProfile[]>;
    removeFriend(userId: string, friendId: string): Promise<void>;
    isFriend(userId: string, friendId: string): Promise<boolean>;
    
    searchUsersByEmail(email: string, excludeUserId: string): Promise<User[]>;
}

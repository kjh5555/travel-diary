import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { FriendRequest } from "@/domain/types/friend";

export class GetFriendRequestsUseCase {
    constructor(private repository: IFriendRepository) {}

    async executeSent(userId: string): Promise<FriendRequest[]> {
        return await this.repository.getSentRequests(userId);
    }

    async executeReceived(userId: string): Promise<FriendRequest[]> {
        return await this.repository.getReceivedRequests(userId);
    }

    async getPendingCount(userId: string): Promise<number> {
        return await this.repository.getPendingRequestsCount(userId);
    }
}

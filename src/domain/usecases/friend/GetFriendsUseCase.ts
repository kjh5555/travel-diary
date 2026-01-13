import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { FriendWithProfile } from "@/domain/types/friend";

export class GetFriendsUseCase {
    constructor(private repository: IFriendRepository) {}

    async execute(userId: string): Promise<FriendWithProfile[]> {
        return await this.repository.getFriends(userId);
    }
}

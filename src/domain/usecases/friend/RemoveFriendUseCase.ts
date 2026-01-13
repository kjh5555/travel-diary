import { IFriendRepository } from "@/domain/repositories/IFriendRepository";

export class RemoveFriendUseCase {
    constructor(private repository: IFriendRepository) {}

    async execute(userId: string, friendId: string): Promise<void> {
        if (!friendId) {
            throw new Error("친구 ID가 필요합니다.");
        }

        await this.repository.removeFriend(userId, friendId);
    }
}

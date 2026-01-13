import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { Friendship } from "@/domain/types/friend";

export class AcceptFriendRequestUseCase {
    constructor(private repository: IFriendRepository) {}

    async execute(requestId: string, userId: string): Promise<Friendship> {
        if (!requestId) {
            throw new Error("요청 ID가 필요합니다.");
        }

        return await this.repository.acceptFriendRequest(requestId, userId);
    }
}
